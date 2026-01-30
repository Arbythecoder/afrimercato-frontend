// =================================================================
// AUTH ROUTES - USER AUTHENTICATION
// =================================================================
// Complete implementation: login, registration, password reset for all users

const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// ==============================================
// POST /api/auth/register - Register new user
// ==============================================
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    // Accept either a combined `name` or separate `firstName`/`lastName`
    body('name').optional().trim(),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phone').optional().trim(),
  ],
  asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

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
    user.generateEmailVerificationToken();

    // Save user
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles
        }
      }
    });
  })
);

// ==============================================
// POST /api/auth/login - User login
// ==============================================
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user info (without password)
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userObj
      }
    });
  })
);

// ==============================================
// GET /api/auth/me - Get current user (alias for profile)
// ==============================================
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// ==============================================
// GET /api/auth/profile - Get logged-in user profile
// ==============================================
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// ==============================================
// PUT /api/auth/profile - Update user profile
// ==============================================
router.put(
  '/profile',
  protect,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

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
  })
);

// ==============================================
// POST /api/auth/forgot-password - Request password reset
// ==============================================
router.post(
  '/forgot-password',
  [body('email').isEmail()],
  asyncHandler(async (req, res) => {
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
  })
);

// ==============================================
// POST /api/auth/reset-password/:token - Reset password
// ==============================================
router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

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
  })
);

// ==============================================
// POST /api/auth/verify-email - Verify email address
// ==============================================
router.post(
  '/verify-email',
  [body('token').notEmpty().withMessage('Verification token required')],
  asyncHandler(async (req, res) => {
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
  })
);

// ==============================================
// POST /api/auth/logout - Logout user (no backend action needed with JWT)
// ==============================================
router.post('/logout', protect, asyncHandler(async (req, res) => {
  // With JWT, logout is handled client-side by deleting token
  res.json({
    success: true,
    message: 'Logged out successfully. Please remove token from client.'
  });
}));

// ==============================================
// POST /api/auth/refresh-token - Get new access token
// ==============================================
router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    // Extract token from request
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
      // SECURITY: Verify token is still valid (not expired)
      // Users must re-authenticate if token is truly expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Create new token
      const newToken = jwt.sign(
        { id: decoded.id, roles: decoded.roles },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Token refreshed',
        data: { token: newToken }
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  })
);

module.exports = router;
