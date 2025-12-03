// =================================================================
// VENDOR AUTHENTICATION ROUTES
// =================================================================
// Routes for vendor registration, login, and verification

const express = require('express');
const router = express.Router();

// Import controllers
const {
  registerVendor,
  loginVendor,
  verifyOTP,
  verifyVendorEmail
} = require('../controllers/vendorAuthController');

// Import middleware
const { loginLimiter } = require('../middleware/rateLimit');
const {
  validateVendorRegistration,
  validateLogin,
  validateOTP
} = require('../middleware/validator');

// @route   POST /api/vendor/register
// @desc    Register a new vendor
// @access  Public
router.post('/register', validateVendorRegistration, registerVendor);

// @route   POST /api/vendor/login
// @desc    Login vendor (first step - credentials)
// @access  Public
router.post('/login', loginLimiter, validateLogin, loginVendor);

// @route   POST /api/vendor/verify-otp
// @desc    Complete login with OTP verification
// @access  Public
router.post('/verify-otp', validateOTP, verifyOTP);

// @route   GET /api/vendor/verify-email/:token
// @desc    Verify vendor email address
// @access  Public
router.get('/verify-email/:token', verifyVendorEmail);

module.exports = router;