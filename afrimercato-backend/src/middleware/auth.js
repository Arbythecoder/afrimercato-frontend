// =================================================================
// AUTHENTICATION MIDDLEWARE
// =================================================================
// JWT verification and role-based authorization

const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and attach user to request
 */
const protect = (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies
  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Check if user has required roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user has role
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userRoles = req.user.roles || [req.user.role]; // Support both roles array and role string
    if (!userRoles.some(role => roles.includes(role))) {
      return res.status(403).json({
        success: false,
        message: `User roles '${userRoles}' is not authorized for this route`
      });
    }

    next();
  };
};

/**
 * Verify email is verified before allowing access
 * Use this middleware on routes that require email verification
 */
const requireEmailVerified = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      errorCode: 'NOT_AUTHENTICATED'
    });
  }

  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('emailVerified email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Allow access if email is verified
    if (user.emailVerified) {
      return next();
    }

    // Block access and return clear message
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to continue',
      errorCode: 'EMAIL_NOT_VERIFIED',
      userMessage: 'Please check your email and click the verification link to continue using this feature.',
      email: user.email
    });
  } catch (error) {
    console.error('Email verification check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking email verification status',
      errorCode: 'VERIFICATION_CHECK_ERROR'
    });
  }
};

module.exports = {
  protect,
  authorize,
  requireEmailVerified
};
