// =================================================================
// AUTHENTICATION MIDDLEWARE (JWT SECURITY)
// =================================================================
// This protects your API routes so only logged-in users can access them

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * WHAT IS MIDDLEWARE?
 * Middleware is like a security guard at a building entrance.
 * Before someone can enter (access an API endpoint), the guard checks:
 * - Do they have a valid ID card (JWT token)?
 * - Is the ID card real or fake?
 * - Has the ID card expired?
 *
 * If everything checks out ✅ → Let them in
 * If something's wrong ❌ → Stop them at the door
 */

// =================================================================
// PROTECT MIDDLEWARE: Verify User is Logged In
// =================================================================
/**
 * HOW IT WORKS:
 *
 * 1. User sends a request with a token in the header:
 *    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * 2. We extract the token and verify it
 * 3. We find the user in the database
 * 4. We attach the user to the request object (req.user)
 * 5. Next() → Proceed to the actual route handler
 *
 * If token is missing or invalid → Send error response
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    // Format: "Authorization: Bearer YOUR_TOKEN_HERE"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from "Bearer TOKEN"
      token = req.headers.authorization.split(' ')[1];
    }

    // No token found?
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in to access this resource.',
        errorCode: 'NO_TOKEN'
      });
    }

    try {
      // Verify token is valid and not expired
      // jwt.verify() will throw an error if token is invalid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // decoded contains: { id, role, email, iat, exp }
      // iat = issued at (when token was created)
      // exp = expiration time

      // Find user in database
      // select('-password') = don't include password in result
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists',
          errorCode: 'USER_NOT_FOUND'
        });
      }

      // Check if user account is active
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
          errorCode: 'ACCOUNT_DEACTIVATED'
        });
      }

      // ✅ All checks passed! User is authenticated
      // Proceed to next middleware or route handler
      next();
    } catch (error) {
      // Token verification failed
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please log in again.',
          errorCode: 'INVALID_TOKEN'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Your session has expired. Please log in again.',
          errorCode: 'TOKEN_EXPIRED'
        });
      }

      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      errorCode: 'AUTH_ERROR'
    });
  }
};

// =================================================================
// AUTHORIZE MIDDLEWARE: Check User Has Required Role
// =================================================================
/**
 * WHY NEEDED?
 * Some routes should only be accessed by certain user types.
 * Examples:
 * - Only vendors can create products
 * - Only customers can place orders
 * - Only admins can delete users
 *
 * USAGE EXAMPLE:
 * router.get('/vendor/dashboard', protect, authorize('vendor'), getDashboard);
 *
 * This means:
 * 1. User must be logged in (protect)
 * 2. User must have role='vendor' (authorize('vendor'))
 */
exports.authorize = (...roles) => {
  // roles is an array like: ['vendor', 'admin']

  return (req, res, next) => {
    // Check if user's primary role or any of their roles match
    const userRoles = req.user.roles || [];
    const primaryRole = req.user.primaryRole;

    const hasRole = roles.includes(primaryRole) || userRoles.some(role => roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${roles.join(', ')} can access this resource.`,
        errorCode: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // ✅ User has required role
    next();
  };
};

// =================================================================
// OPTIONAL AUTH: Attach User If Token Exists (But Don't Require It)
// =================================================================
/**
 * USE CASE:
 * Some routes work for both logged-in and guest users.
 * Example: Product listing
 * - Guests can see products
 * - Logged-in users see products + their wishlist status
 *
 * This middleware:
 * - If token exists → Attach user to req.user
 * - If no token → Continue anyway (req.user will be undefined)
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token? No problem! Continue as guest
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Invalid token? Ignore and continue as guest
      console.log('Optional auth: Invalid token, continuing as guest');
    }

    next();
  } catch (error) {
    // Don't block the request on errors
    next();
  }
};

// =================================================================
// VERIFY VENDOR: Check User is a Verified Vendor
// =================================================================
/**
 * Extra security for vendor-specific routes
 * Not only must they be a vendor, they must be VERIFIED
 */
exports.verifyVendor = async (req, res, next) => {
  try {
    const Vendor = require('../models/Vendor');

    // Find vendor profile for this user
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: 'Vendor profile not found. Please create a vendor profile first.',
        errorCode: 'VENDOR_PROFILE_NOT_FOUND'
      });
    }

    // Check if vendor is approved via approvalStatus (more granular than isVerified)
    if (vendor.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account is pending verification. Our automated system will review your application within 24-48 hours.',
        errorCode: 'VENDOR_PENDING_APPROVAL',
        status: 'pending',
        submittedAt: vendor.submittedForReviewAt || vendor.createdAt
      });
    }

    if (vendor.approvalStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor application was not approved.',
        errorCode: 'VENDOR_REJECTED',
        status: 'rejected',
        reason: vendor.rejectionReason
      });
    }

    if (vendor.approvalStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account has been suspended.',
        errorCode: 'VENDOR_SUSPENDED',
        status: 'suspended'
      });
    }

    if (!vendor.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account has been deactivated.',
        errorCode: 'VENDOR_DEACTIVATED'
      });
    }

    // Attach vendor to request for use in route handlers
    req.vendor = vendor;

    next();
  } catch (error) {
    console.error('Vendor verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying vendor status'
    });
  }
};
