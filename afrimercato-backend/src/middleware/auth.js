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

module.exports = {
  protect,
  authorize
};
