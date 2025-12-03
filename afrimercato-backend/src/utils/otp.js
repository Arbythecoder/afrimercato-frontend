// =================================================================
// OTP UTILITIES
// =================================================================
// Functions for generating and validating One-Time Passwords (OTP)

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Check if OTP is expired
 * @param {Date} expiryTime - OTP expiry timestamp
 * @returns {boolean} true if expired, false otherwise
 */
exports.isOTPExpired = (expiryTime) => {
  return Date.now() > expiryTime;
};