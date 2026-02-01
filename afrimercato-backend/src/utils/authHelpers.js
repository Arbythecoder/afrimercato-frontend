// =================================================================
// CENTRALIZED AUTH UTILITIES
// =================================================================
// Shared authentication helpers for consistent token/cookie handling
// across all roles (Customer, Vendor, Admin, Rider, Picker)

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Get cookie options based on environment
 * Used for setting HTTP-only secure cookies
 * @returns {Object} Cookie configuration
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,                        // Prevent XSS attacks
    secure: isProduction,                  // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // Cross-site for production
    maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days in milliseconds
    path: '/'                              // Cookie available site-wide
  };
};

/**
 * Get refresh token cookie options (longer lifetime)
 * @returns {Object} Refresh token cookie configuration
 */
const getRefreshCookieOptions = () => {
  return {
    ...getCookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days for refresh token
  };
};

/**
 * Generate cryptographically secure refresh token
 * @returns {string} 80-character hex refresh token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (id, roles, email)
 * @param {string} expiresIn - Token expiration (default: 7d)
 * @returns {string} Signed JWT token
 */
const generateAccessToken = (payload, expiresIn = '7d') => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Set authentication cookies on response
 * @param {Object} res - Express response object
 * @param {string} token - JWT access token
 * @param {string} refreshToken - Refresh token
 */
const setAuthCookies = (res, token, refreshToken) => {
  res.cookie('token', token, getCookieOptions());
  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
};

/**
 * Clear authentication cookies on logout
 * @param {Object} res - Express response object
 */
const clearAuthCookies = (res) => {
  const options = getCookieOptions();
  res.cookie('token', '', { ...options, maxAge: 0 });
  res.cookie('refreshToken', '', { ...options, maxAge: 0 });
};

/**
 * Format user response data (exclude sensitive fields)
 * @param {Object} user - User document from database
 * @param {string} role - Primary role (customer, vendor, admin, rider, picker)
 * @returns {Object} Safe user object for API response
 */
const formatUserResponse = (user, role = null) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;

  const primaryRole = role || (user.roles && user.roles[0]) || 'customer';

  return {
    id: user._id,
    _id: user._id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    roles: user.roles || [primaryRole],
    role: primaryRole,
    primaryRole,
    avatar: user.avatar
  };
};

module.exports = {
  getCookieOptions,
  getRefreshCookieOptions,
  generateRefreshToken,
  generateAccessToken,
  setAuthCookies,
  clearAuthCookies,
  formatUserResponse
};
