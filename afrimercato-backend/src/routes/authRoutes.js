// =================================================================
// AUTHENTICATION ROUTES
// =================================================================
// Defines all authentication endpoints: login, register, password reset, etc.

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken
} = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validateNewPassword
} = require('../middleware/validator');

/**
 * ROUTE STRUCTURE EXPLANATION:
 *
 * router.METHOD(path, [middleware], controller)
 *
 * - METHOD: get, post, put, delete, patch
 * - path: URL endpoint (e.g., '/register')
 * - middleware: Functions that run before controller (optional)
 * - controller: The function that handles the request
 *
 * MIDDLEWARE ORDER MATTERS:
 * Request → Validator → Auth Check → Controller → Response
 */

// =================================================================
// PUBLIC ROUTES (No authentication required)
// =================================================================

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset email
// @access  Public
router.post('/forgot-password', validatePasswordReset, forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', validateNewPassword, resetPassword);

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', verifyEmail);

// @route   POST /api/auth/refresh-token
// @desc    Get new access token using refresh token
// @access  Public
router.post('/refresh-token', refreshToken);

// =================================================================
// PROTECTED ROUTES (Authentication required)
// =================================================================
// All routes below require valid JWT token in Authorization header

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, changePassword);

// =================================================================
// OAUTH ROUTES (Social Authentication)
// =================================================================

const passport = require('passport');
require('../config/passport'); // Initialize passport strategies

/**
 * Google OAuth Routes
 * User clicks "Sign in with Google" → Redirected to Google → Google callback
 */

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth flow
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Successful authentication
    const token = req.user.generateAuthToken();
    const refreshToken = req.user.generateRefreshToken();

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth/callback?token=${token}&refreshToken=${refreshToken}&provider=google`
    );
  }
);

/**
 * Facebook OAuth Routes
 * User clicks "Sign in with Facebook" → Redirected to Facebook → Facebook callback
 */

// @route   GET /api/auth/facebook
// @desc    Initiate Facebook OAuth flow
// @access  Public
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false })
);

// @route   GET /api/auth/facebook/callback
// @desc    Facebook OAuth callback
// @access  Public
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Successful authentication
    const token = req.user.generateAuthToken();
    const refreshToken = req.user.generateRefreshToken();

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth/callback?token=${token}&refreshToken=${refreshToken}&provider=facebook`
    );
  }
);

module.exports = router;
