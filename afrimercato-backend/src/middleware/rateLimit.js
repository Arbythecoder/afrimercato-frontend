// =================================================================
// RATE LIMIT MIDDLEWARE
// =================================================================
// Implements rate limiting for login attempts and API requests

const rateLimit = require('express-rate-limit');

// Limit login attempts to 5 per 15 minutes per IP
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    errorCode: 'LOGIN_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limit - 100 requests per minute
exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    errorCode: 'API_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false
});