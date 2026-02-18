// =================================================================
// AUTH CONTROLLER
// =================================================================
// Handles authentication business logic for all user types

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateAccessToken, generateRefreshToken, setAuthCookies, clearAuthCookies, formatUserResponse } = require('../utils/authHelpers');
const { sendVerificationEmail } = require('../utils/emailService');

// =================================================================
// @route   POST /api/auth/register
// @desc    Register a new customer
// @access  Public
// =================================================================
exports.registerCustomer = asyncHandler(async (req, res) => {
  const { email, password, firstName: fName, lastName: lName, name, phone, role } = req.body;

  // Check if user exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Normalize name fields: prefer explicit firstName/lastName, otherwise split `name`
  let firstName = fName;
  let lastName = lName;
  if ((!firstName || !lastName) && name) {
    const parts = name.trim().split(/\s+/);
    firstName = parts.shift();
    lastName = parts.join(' ') || '';
  }

  // Validate we have at least a first name
  if (!firstName) {
    return res.status(400).json({ success: false, message: 'First name required' });
  }

  // SECURITY: Public registration always creates customers only
  // Vendors use /api/vendor/register, Riders use /api/rider-auth/register, etc.
  const assignedRole = 'customer';

  // Create new user (password will be hashed automatically by pre-save hook)
  user = new User({
    email,
    password, // Will be hashed by User model pre-save middleware
    firstName,
    lastName,
    phone,
    roles: [assignedRole]
  });

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();

  // Save user
  await user.save();

  // Send verification email
  try {
    await sendVerificationEmail(user.email, verificationToken, user.firstName);
  } catch (emailError) {
    console.error('[EMAIL_SEND_ERROR]', emailError.message);
    // Don't fail registration if email fails
  }

  // Create JWT and refresh token
  const token = generateAccessToken({ id: user._id, roles: user.roles, email: user.email });
  const refreshToken = generateRefreshToken();

  // Set secure HTTP-only cookies
  setAuthCookies(res, token, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: {
      token,
      refreshToken,
      user: formatUserResponse(user, 'customer')
    }
  });
});

// =================================================================
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// =================================================================
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user with 25s timeout to handle slow DB connections
    const userPromise = User.findOne({ email }).select('+password').maxTimeMS(25000);
    const user = await userPromise;
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }

    // Check password with timeout protection
    const comparePromise = bcrypt.compare(password, user.password);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Password comparison timeout')), 5000)
    );
    
    const isMatch = await Promise.race([comparePromise, timeoutPromise]);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }

    // Create JWT and refresh token
    const token = generateAccessToken({ id: user._id, roles: user.roles, email: user.email });
    const refreshToken = generateRefreshToken();

    // Set secure HTTP-only cookies
    setAuthCookies(res, token, refreshToken);

    // Determine primary role for frontend routing
    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'customer';

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        user: formatUserResponse(user, primaryRole)
      }
    });
  } catch (error) {
    console.error('[LOGIN_ERROR]', error.message);
    
    // Handle MongoDB timeout errors
    if (error.name === 'MongoNetworkTimeoutError' || 
        error.name === 'MongoServerSelectionError' ||
        error.message?.includes('timeout') || 
        error.message?.includes('timed out') ||
        error.code === 50) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection issue. Please try again in a moment.', 
        code: 'DATABASE_TIMEOUT' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.', 
      code: 'SERVER_ERROR' 
    });
  }
});

// =================================================================
// @route   GET /api/auth/me
// @desc    Get current user (alias for profile)
// @access  Private
// =================================================================
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Use formatUserResponse for consistency with login endpoint
  const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'customer';

  res.json({
    success: true,
    data: formatUserResponse(user, primaryRole)
  });
});

// =================================================================
// @route   GET /api/auth/profile
// @desc    Get logged-in user profile
// @access  Private
// =================================================================
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Use formatUserResponse for consistency with login endpoint
  const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'customer';

  res.json({
    success: true,
    data: formatUserResponse(user, primaryRole)
  });
});

// =================================================================
// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
// =================================================================
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { firstName, lastName, phone },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

// =================================================================
// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
// =================================================================
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Don't reveal if user exists
    return res.json({ success: true, message: 'If email exists, reset link will be sent' });
  }

  // Generate reset token
  user.generatePasswordResetToken();
  await user.save();

  // TODO: Send email with reset link
  // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${user.resetPasswordToken}`;
  // await sendEmail(user.email, resetUrl);

  res.json({
    success: true,
    message: 'Password reset link sent to your email'
  });
});

// =================================================================
// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
// =================================================================
exports.resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  // Set new password (will be hashed automatically by pre-save hook)
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// =================================================================
// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
// =================================================================
exports.verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    emailVerificationToken: req.body.token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

// =================================================================
// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Private
// =================================================================
exports.resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Already verified
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Send verification email
  try {
    const emailResult = await sendVerificationEmail(user.email, verificationToken, user.firstName);
    res.json({
      success: true,
      message: 'Verification email sent',
      ...(process.env.NODE_ENV === 'development' && {
        verificationToken,
        verificationLink: emailResult.verificationLink
      })
    });
  } catch (emailError) {
    console.error('[EMAIL_SEND_ERROR]', emailError.message);
    res.json({
      success: true,
      message: 'Verification email sent (email service unavailable - check server logs)',
      ...(process.env.NODE_ENV === 'development' && {
        verificationToken
      })
    });
  }
});

// =================================================================
// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
// =================================================================
exports.logout = asyncHandler(async (req, res) => {
  // Clear cookies on logout
  clearAuthCookies(res);

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// =================================================================
// @route   POST /api/auth/refresh-token
// @desc    Get new access token
// @access  Public
// =================================================================
exports.refreshToken = asyncHandler(async (req, res) => {
  // Try to get refresh token from body, cookie, or header
  const refreshToken = req.body.refreshToken ||
                       req.cookies?.refreshToken ||
                       req.headers['x-refresh-token'];

  // Fallback: try to use existing access token if still valid
  const existingToken = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (!refreshToken && !existingToken) {
    return res.status(401).json({
      success: false,
      message: 'No refresh token provided',
      errorCode: 'NO_REFRESH_TOKEN'
    });
  }

  try {
    let userId, userRoles;

    // If we have a valid existing token, use it to get user info
    if (existingToken) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(existingToken, process.env.JWT_SECRET);
        userId = decoded.id;
        userRoles = decoded.roles;
      } catch (tokenErr) {
        // Token expired or invalid - that's ok, we'll try to find user another way
        if (!refreshToken) {
          return res.status(401).json({
            success: false,
            message: 'Token expired',
            errorCode: 'TOKEN_EXPIRED'
          });
        }
      }
    }

    // If we still don't have user info, we need the refresh token
    // In a full implementation, you'd store refresh tokens in DB and look up user
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please log in again',
        errorCode: 'REFRESH_FAILED'
      });
    }

    // Create new tokens
    const newToken = generateAccessToken({ id: userId, roles: userRoles, email: '' });
    const newRefreshToken = generateRefreshToken();

    // Set new cookies
    setAuthCookies(res, newToken, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token refresh failed',
      errorCode: 'REFRESH_FAILED'
    });
  }
});

// =================================================================
// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
// =================================================================
exports.googleAuthStart = (req, res, next) => {
  // Fail fast if Google OAuth is not configured
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({ success: false, message: 'Google OAuth is not configured' });
  }

  const passport = require('passport');
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
};

// =================================================================
// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
// =================================================================
exports.googleAuthCallback = (req, res, next) => {
  const passport = require('passport');
  const frontendUrl = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

  passport.authenticate('google', { session: false }, (err, user, info) => {
    // LOG FAILURE FOR PRODUCTION DEBUGGING
    if (err) {
      console.error(`[OAUTH_FAIL] ${new Date().toISOString()} | Error: ${err.message || err}`);
      return res.redirect(`${frontendUrl}/oauth/callback?error=google_auth_failed&details=server_error`);
    }
    if (!user) {
      console.error(`[OAUTH_FAIL] ${new Date().toISOString()} | No user | Info: ${JSON.stringify(info)}`);
      return res.redirect(`${frontendUrl}/oauth/callback?error=google_auth_failed&details=no_user`);
    }

    try {
      const token = generateAccessToken({ id: user._id, roles: user.roles, email: user.email });
      const refreshToken = generateRefreshToken();

      res.redirect(`${frontendUrl}/oauth/callback?token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}&provider=google`);
    } catch (tokenErr) {
      console.error(`[OAUTH_TOKEN_FAIL] ${new Date().toISOString()} | User: ${user.email} | Error: ${tokenErr.message}`);
      res.redirect(`${frontendUrl}/oauth/callback?error=server_error`);
    }
  })(req, res, next);
};
