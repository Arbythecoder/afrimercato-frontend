// =================================================================
// OTP SERVICE - SMS Verification for Phone Numbers
// =================================================================
// Supports multiple SMS providers:
// 1. Twilio (Global, including UK)
// 2. Africa's Talking (African markets)
// 3. Mock mode for development/testing

const axios = require('axios');

// SMS Provider Configuration
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'mock'; // 'twilio', 'africas-talking', or 'mock'

// Twilio Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Africa's Talking Configuration
const AT_API_KEY = process.env.AFRICAS_TALKING_API_KEY;
const AT_USERNAME = process.env.AFRICAS_TALKING_USERNAME;
const AT_SENDER_ID = process.env.AFRICAS_TALKING_SENDER_ID || 'Afrimercato';

// OTP Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 3;

// In-memory OTP storage (use Redis in production for scalability)
const otpStore = new Map();

/**
 * Generate a random OTP code
 * @param {number} length - Length of OTP (default 6)
 * @returns {string} OTP code
 */
function generateOTP(length = OTP_LENGTH) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

/**
 * Send OTP via Twilio SMS
 * @param {string} phoneNumber - Recipient phone number (E.164 format)
 * @param {string} otp - OTP code to send
 * @returns {Promise<object>} Send result
 */
async function sendViaTwilio(phoneNumber, otp) {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const message = await client.messages.create({
      body: `Your Afrimercato verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`✅ OTP sent via Twilio to ${phoneNumber}: ${message.sid}`);

    return {
      success: true,
      provider: 'twilio',
      messageId: message.sid
    };

  } catch (error) {
    console.error('Twilio SMS error:', error);
    throw error;
  }
}

/**
 * Send OTP via Africa's Talking SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} otp - OTP code to send
 * @returns {Promise<object>} Send result
 */
async function sendViaAfricasTalking(phoneNumber, otp) {
  try {
    if (!AT_API_KEY || !AT_USERNAME) {
      throw new Error('Africa\'s Talking credentials not configured');
    }

    const response = await axios.post(
      'https://api.africastalking.com/version1/messaging',
      new URLSearchParams({
        username: AT_USERNAME,
        to: phoneNumber,
        message: `Your Afrimercato verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`,
        from: AT_SENDER_ID
      }),
      {
        headers: {
          'apiKey': AT_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    console.log(`✅ OTP sent via Africa's Talking to ${phoneNumber}`);

    return {
      success: true,
      provider: 'africas-talking',
      messageId: response.data.SMSMessageData.Recipients[0].messageId
    };

  } catch (error) {
    console.error('Africa\'s Talking SMS error:', error);
    throw error;
  }
}

/**
 * Mock SMS sending for development/testing
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} otp - OTP code
 * @returns {Promise<object>} Send result
 */
async function sendViaMock(phoneNumber, otp) {
  console.log('📱 [MOCK SMS]');
  console.log('═'.repeat(50));
  console.log(`To: ${phoneNumber}`);
  console.log(`Code: ${otp}`);
  console.log(`Valid for: ${OTP_EXPIRY_MINUTES} minutes`);
  console.log('═'.repeat(50));

  return {
    success: true,
    provider: 'mock',
    messageId: 'mock-' + Date.now(),
    otp: otp // Include OTP in mock mode for testing
  };
}

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Recipient phone number (E.164 format recommended)
 * @param {string} purpose - Purpose of OTP (registration, login, password-reset, etc.)
 * @returns {Promise<object>} Result with success status
 */
exports.sendOTP = async (phoneNumber, purpose = 'verification') => {
  try {
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP with metadata
    const otpData = {
      otp,
      phoneNumber,
      purpose,
      createdAt: new Date(),
      expiresAt,
      attempts: 0,
      verified: false
    };

    otpStore.set(phoneNumber, otpData);

    // Send via configured provider
    let sendResult;

    switch (SMS_PROVIDER) {
      case 'twilio':
        sendResult = await sendViaTwilio(phoneNumber, otp);
        break;

      case 'africas-talking':
        sendResult = await sendViaAfricasTalking(phoneNumber, otp);
        break;

      case 'mock':
      default:
        sendResult = await sendViaMock(phoneNumber, otp);
        break;
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      phoneNumber,
      expiresAt,
      provider: sendResult.provider,
      messageId: sendResult.messageId,
      // Include OTP in response ONLY in mock mode for testing
      ...(SMS_PROVIDER === 'mock' && { otp: sendResult.otp })
    };

  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: error.message
    };
  }
};

/**
 * Verify OTP code
 * @param {string} phoneNumber - Phone number to verify
 * @param {string} otp - OTP code entered by user
 * @returns {Promise<object>} Verification result
 */
exports.verifyOTP = async (phoneNumber, otp) => {
  try {
    const otpData = otpStore.get(phoneNumber);

    // Check if OTP exists
    if (!otpData) {
      return {
        success: false,
        message: 'No OTP found for this phone number. Please request a new one.',
        errorCode: 'OTP_NOT_FOUND'
      };
    }

    // Check if OTP is already verified
    if (otpData.verified) {
      return {
        success: false,
        message: 'This OTP has already been used. Please request a new one.',
        errorCode: 'OTP_ALREADY_USED'
      };
    }

    // Check if OTP is expired
    if (new Date() > otpData.expiresAt) {
      otpStore.delete(phoneNumber);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.',
        errorCode: 'OTP_EXPIRED'
      };
    }

    // Check max attempts
    if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
      otpStore.delete(phoneNumber);
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.',
        errorCode: 'MAX_ATTEMPTS_EXCEEDED'
      };
    }

    // Increment attempts
    otpData.attempts++;

    // Verify OTP
    if (otpData.otp !== otp) {
      return {
        success: false,
        message: `Incorrect OTP. ${MAX_OTP_ATTEMPTS - otpData.attempts} attempts remaining.`,
        errorCode: 'INCORRECT_OTP',
        attemptsRemaining: MAX_OTP_ATTEMPTS - otpData.attempts
      };
    }

    // OTP is correct - mark as verified
    otpData.verified = true;
    otpData.verifiedAt = new Date();

    // Clean up after successful verification (optional - keep for audit trail)
    setTimeout(() => {
      otpStore.delete(phoneNumber);
    }, 60000); // Delete after 1 minute

    console.log(`✅ OTP verified successfully for ${phoneNumber}`);

    return {
      success: true,
      message: 'Phone number verified successfully',
      phoneNumber,
      verifiedAt: otpData.verifiedAt
    };

  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      error: error.message
    };
  }
};

/**
 * Check if phone number is already verified
 * @param {string} phoneNumber - Phone number to check
 * @returns {boolean} True if verified
 */
exports.isPhoneVerified = (phoneNumber) => {
  const otpData = otpStore.get(phoneNumber);
  return otpData ? otpData.verified : false;
};

/**
 * Clear OTP for phone number (for testing/admin purposes)
 * @param {string} phoneNumber - Phone number
 */
exports.clearOTP = (phoneNumber) => {
  otpStore.delete(phoneNumber);
  console.log(`🗑️ OTP cleared for ${phoneNumber}`);
};

/**
 * Get OTP statistics (for monitoring)
 * @returns {object} Statistics
 */
exports.getOTPStats = () => {
  const stats = {
    totalActive: otpStore.size,
    verified: 0,
    expired: 0,
    pending: 0
  };

  const now = new Date();

  otpStore.forEach((data) => {
    if (data.verified) {
      stats.verified++;
    } else if (now > data.expiresAt) {
      stats.expired++;
    } else {
      stats.pending++;
    }
  });

  return stats;
};

module.exports = exports;
