/**
 * OTP Routes - Phone Verification
 * SMS verification for user phone numbers
 */

const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const { protect } = require('../middleware/auth');

/**
 * Send OTP code
 * POST /api/auth/otp/send
 * Body: { phoneNumber, purpose }
 * Public (no auth required)
 */
router.post('/send', otpController.sendOTPCode);

/**
 * Verify OTP code
 * POST /api/auth/otp/verify
 * Body: { phoneNumber, otp }
 * Public (but updates user if authenticated)
 */
router.post('/verify', otpController.verifyOTPCode);

/**
 * Resend OTP code
 * POST /api/auth/otp/resend
 * Body: { phoneNumber }
 * Public (no auth required)
 */
router.post('/resend', otpController.resendOTP);

/**
 * Check verification status
 * GET /api/auth/otp/status/:phoneNumber
 * Protected (requires authentication)
 */
router.get('/status/:phoneNumber', protect, otpController.checkVerificationStatus);

/**
 * Get OTP statistics (Admin only)
 * GET /api/auth/otp/stats
 * Protected (admin only)
 */
router.get('/stats', protect, otpController.getStats);

module.exports = router;
