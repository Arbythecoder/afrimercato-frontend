// =================================================================
// OTP CONTROLLER - Phone Verification
// =================================================================
// Handles OTP sending and verification for phone numbers

const { sendOTP, verifyOTP, isPhoneVerified, getOTPStats } = require('../utils/otpService');
const User = require('../models/User');

/**
 * Send OTP to phone number
 * POST /api/auth/otp/send
 * Body: { phoneNumber, purpose }
 */
exports.sendOTPCode = async (req, res) => {
  try {
    const { phoneNumber, purpose = 'verification' } = req.body;

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Normalize phone number (basic validation)
    const normalizedPhone = phoneNumber.trim().replace(/\s+/g, '');

    // Send OTP
    const result = await sendOTP(normalizedPhone, purpose);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${normalizedPhone}`,
      expiresAt: result.expiresAt,
      provider: result.provider,
      // Include OTP in response ONLY in mock mode
      ...(result.otp && { otp: result.otp })
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code',
      error: error.message
    });
  }
};

/**
 * Verify OTP code
 * POST /api/auth/otp/verify
 * Body: { phoneNumber, otp }
 */
exports.verifyOTPCode = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Validate input
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP code are required'
      });
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.trim().replace(/\s+/g, '');
    const normalizedOTP = otp.trim();

    // Verify OTP
    const result = await verifyOTP(normalizedPhone, normalizedOTP);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Update user phone verification status if authenticated
    if (req.user) {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          phone: normalizedPhone,
          isPhoneVerified: true,
          phoneVerifiedAt: new Date()
        });

        console.log(`✅ User ${req.user._id} phone verified: ${normalizedPhone}`);
      } catch (updateError) {
        console.error('Failed to update user phone status:', updateError);
        // Don't fail the OTP verification if user update fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      phoneNumber: normalizedPhone,
      verifiedAt: result.verifiedAt
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code',
      error: error.message
    });
  }
};

/**
 * Resend OTP code
 * POST /api/auth/otp/resend
 * Body: { phoneNumber }
 */
exports.resendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.trim().replace(/\s+/g, '');

    // Send new OTP
    const result = await sendOTP(normalizedPhone, 'resend');

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(200).json({
      success: true,
      message: 'New verification code sent',
      expiresAt: result.expiresAt,
      // Include OTP in response ONLY in mock mode
      ...(result.otp && { otp: result.otp })
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code',
      error: error.message
    });
  }
};

/**
 * Check phone verification status
 * GET /api/auth/otp/status/:phoneNumber
 * Protected route
 */
exports.checkVerificationStatus = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const normalizedPhone = phoneNumber.trim().replace(/\s+/g, '');
    const isVerified = isPhoneVerified(normalizedPhone);

    // Also check database for persistent verification status
    let dbVerified = false;
    if (req.user) {
      const user = await User.findById(req.user._id).select('phone isPhoneVerified phoneVerifiedAt');
      dbVerified = user && user.phone === normalizedPhone && user.isPhoneVerified;
    }

    res.status(200).json({
      success: true,
      phoneNumber: normalizedPhone,
      isVerified: isVerified || dbVerified,
      source: dbVerified ? 'database' : isVerified ? 'session' : 'none'
    });

  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check verification status',
      error: error.message
    });
  }
};

/**
 * Get OTP statistics (Admin only)
 * GET /api/auth/otp/stats
 * Protected route - Admin only
 */
exports.getStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = getOTPStats();

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get OTP stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
};

module.exports = exports;
