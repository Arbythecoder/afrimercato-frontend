// =================================================================
// OTP ROUTES
// =================================================================
// Routes for OTP verification and multi-factor authentication

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Send OTP
router.post('/send-phone', (req, res) => res.status(501).json({ message: 'Send OTP to phone' }));
router.post('/send-email', (req, res) => res.status(501).json({ message: 'Send OTP to email' }));

// Verify OTP
router.post('/verify-phone', (req, res) => res.status(501).json({ message: 'Verify phone OTP' }));
router.post('/verify-email', (req, res) => res.status(501).json({ message: 'Verify email OTP' }));

// For authenticated users
router.use(protect);

// OTP management
router.get('/status', (req, res) => res.status(501).json({ message: 'Get OTP status' }));
router.post('/resend', (req, res) => res.status(501).json({ message: 'Resend OTP' }));

module.exports = router;
