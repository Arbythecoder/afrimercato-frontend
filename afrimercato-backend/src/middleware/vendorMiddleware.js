// =================================================================
// VENDOR MIDDLEWARE
// =================================================================
// Attaches vendor profile to request for authenticated vendor users

const Vendor = require('../models/Vendor');

/**
 * Attach vendor profile to request
 * Must be used AFTER protect and authorize('vendor') middleware
 * 
 * Fetches the Vendor document by user ID and attaches to req.vendor
 * Returns 403 if no vendor profile exists for the authenticated user
 */
const attachVendor = async (req, res, next) => {
  try {
    // req.user is set by protect middleware (contains JWT payload: id, roles)
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: 'Vendor profile not found. Please complete vendor registration first.'
      });
    }

    // Attach vendor to request for use in controllers
    req.vendor = vendor;
    next();
  } catch (error) {
    console.error('attachVendor middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching vendor profile'
    });
  }
};

module.exports = {
  attachVendor
};
