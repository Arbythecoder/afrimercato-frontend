// =================================================================
// AUTHENTICATION CONTROLLER
// =================================================================
// Handles user registration, login, password reset, etc.

const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendVendorWelcomeEmail } = require('../emails/vendorEmails');

/**
 * WHAT IS A CONTROLLER?
 * Controllers contain the actual logic for handling requests.
 * Think of them as the "brain" that processes user actions.
 *
 * FLOW:
 * User Request → Route → Middleware → Controller → Response
 * Example: POST /api/auth/register → authController.register()
 */

// =================================================================
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// =================================================================
/**
 * HOW REGISTRATION WORKS:
 * 1. User fills registration form
 * 2. Data is validated (by validator middleware)
 * 3. Check if email already exists
 * 4. Hash password (User model does this automatically)
 * 5. Save user to database
 * 6. Generate JWT token
 * 7. Send token back to user
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'A user with this email already exists',
      errorCode: 'EMAIL_EXISTS'
    });
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password, // Will be hashed automatically by User model middleware
    roles: role ? [role] : ['customer'], // Default to customer
    primaryRole: role || 'customer',
    phone,
    isEmailVerified: true // Auto-verify for now since email system is not set up
  });

  // NOTE: Email verification disabled until email system is configured
  // To enable email verification:
  // 1. Set up SMTP credentials in environment variables
  // 2. Configure email service in utils/emailService.js
  // 3. Uncomment the code below and remove isEmailVerified: true above

  // const verificationToken = user.generateEmailVerificationToken();
  // await user.save();
  // await sendEmail({
  //   to: user.email,
  //   subject: 'Verify Your Email',
  //   text: `Click here to verify: ${process.env.CLIENT_URL}/verify-email/${verificationToken}`
  // });

  // AUTOMATICALLY CREATE CUSTOMER PROFILE (like Chowdeck, UberEats, JustEat)
  // This allows users to immediately start ordering without extra steps
  if (user.primaryRole === 'customer' || user.roles.includes('customer')) {
    const Customer = require('../models/Customer');

    try {
      await Customer.create({
        user: user._id,
        preferences: {
          notifications: {
            email: true,
            sms: true,
            push: true
          }
        }
      });
      console.log(`✅ Customer profile auto-created for ${user.email}`);
    } catch (customerError) {
      console.error('Failed to create customer profile:', customerError);
      // Don't fail registration if customer profile creation fails
      // User can create it later
    }
  }

  // Send welcome email to vendors immediately (like Uber Eats)
  if (user.roles.includes('vendor')) {
    try {
      await sendVendorWelcomeEmail(user);
      console.log(`📧 Welcome email sent to vendor: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send vendor welcome email:', emailError);
      // Don't fail registration if email fails
    }
  }

  // Generate JWT token for immediate login
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Different messages for vendors vs customers
  let message = 'Account created successfully! You can now start shopping.';
  if (user.roles.includes('vendor')) {
    message = 'Vendor account created successfully! Check your email for next steps. Your account is pending admin approval.';
  }

  // Send response
  res.status(201).json({
    success: true,
    message,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.primaryRole || user.roles[0] || 'customer',
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
        approvalStatus: user.approvalStatus
      },
      token,
      refreshToken
    }
  });
});

// =================================================================
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// =================================================================
/**
 * HOW LOGIN WORKS:
 * 1. User enters email and password
 * 2. Find user by email
 * 3. Compare entered password with hashed password in database
 * 4. If match → Generate JWT token
 * 5. Update lastLogin timestamp
 * 6. Send token to user
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field (normally excluded)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      errorCode: 'INVALID_CREDENTIALS'
    });
  }

  // Check if password matches
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      errorCode: 'INVALID_CREDENTIALS'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.',
      errorCode: 'ACCOUNT_DEACTIVATED'
    });
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Send response
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.primaryRole || user.roles[0] || 'customer',
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        approvalStatus: user.approvalStatus
      },
      token,
      refreshToken
    }
  });
});

// =================================================================
// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
// =================================================================
/**
 * HOW LOGOUT WORKS:
 * In JWT-based auth, logout happens on the frontend by:
 * 1. Deleting the token from localStorage
 * 2. Redirecting to login page
 *
 * Backend logout is optional but can:
 * - Log the logout event
 * - Invalidate refresh tokens (if using token blacklist)
 * - Update last activity timestamp
 */
exports.logout = asyncHandler(async (req, res) => {
  // You could add token to blacklist here if implementing token revocation

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// =================================================================
// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
// =================================================================
/**
 * Returns information about the currently logged-in user
 * Used by frontend to check if user is still authenticated
 */
exports.getMe = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        phone: user.phone,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
});

// =================================================================
// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
// =================================================================
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    }
  });
});

// =================================================================
// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
// =================================================================
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password field
  const user = await User.findById(req.user.id).select('+password');

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
      errorCode: 'INCORRECT_PASSWORD'
    });
  }

  // Update password (will be hashed automatically)
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// =================================================================
// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
// =================================================================
/**
 * HOW PASSWORD RESET WORKS:
 * 1. User enters their email
 * 2. System generates reset token
 * 3. Email sent with reset link containing token
 * 4. User clicks link, enters new password
 * 5. Token is verified and password updated
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists (security best practice)
    return res.json({
      success: true,
      message: 'If that email exists, a password reset link has been sent'
    });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // TODO: Send email
  // await sendEmail({
  //   to: user.email,
  //   subject: 'Password Reset Request',
  //   text: `Click here to reset your password: ${resetUrl}\n\nThis link expires in 10 minutes.`
  // });

  res.json({
    success: true,
    message: 'If that email exists, a password reset link has been sent',
    // Only include in development for testing
    ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl })
  });
});

// =================================================================
// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
// =================================================================
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Find user with valid reset token
  const user = await User.findOne({
    resetPasswordExpire: { $gt: Date.now() } // Token not expired
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token',
      errorCode: 'INVALID_RESET_TOKEN'
    });
  }

  // Verify token matches
  const bcrypt = require('bcryptjs');
  const isTokenValid = bcrypt.compareSync(token, user.resetPasswordToken);

  if (!isTokenValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token',
      errorCode: 'INVALID_RESET_TOKEN'
    });
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful. You can now log in with your new password.'
  });
});

// =================================================================
// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
// =================================================================
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find user with valid verification token
  const user = await User.findOne({
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
      errorCode: 'INVALID_VERIFICATION_TOKEN'
    });
  }

  // Verify token
  const bcrypt = require('bcryptjs');
  const isTokenValid = bcrypt.compareSync(token, user.emailVerificationToken);

  if (!isTokenValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
      errorCode: 'INVALID_VERIFICATION_TOKEN'
    });
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully!'
  });
});

// =================================================================
// @route   POST /api/auth/refresh-token
// @desc    Get new access token using refresh token
// @access  Public
// =================================================================
/**
 * WHAT ARE REFRESH TOKENS?
 * - Access tokens expire quickly (7 days)
 * - Refresh tokens last longer (30 days)
 * - When access token expires, use refresh token to get new one
 * - No need to log in again!
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
      errorCode: 'NO_REFRESH_TOKEN'
    });
  }

  try {
    // Verify refresh token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        errorCode: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new access token
    const newToken = user.generateAuthToken();

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      errorCode: 'INVALID_REFRESH_TOKEN'
    });
  }
});
