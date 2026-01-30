// =================================================================
// VENDOR MIDDLEWARE
// =================================================================
// PRODUCTION-READY: Defensive validation to prevent CastErrors and crashes

const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');

/**
 * Attach vendor profile to request
 * Must be used AFTER protect and authorize('vendor') middleware
 *
 * Fetches the Vendor document by user ID and attaches to req.vendor
 * Returns 403 if no vendor profile exists for the authenticated user
 *
 * DEFENSIVE: Validates all inputs to prevent CastErrors and crashes
 */
const attachVendor = async (req, res, next) => {
  try {
    // DEFENSIVE: Validate req.user exists
    if (!req.user || !req.user.id) {
      console.error('attachVendor: req.user or req.user.id is undefined');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in again.',
        errorCode: 'MISSING_USER_CONTEXT'
      });
    }

    const userId = req.user.id;

    // DEFENSIVE: Validate userId is a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('attachVendor: Invalid user ID format:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        errorCode: 'INVALID_USER_ID'
      });
    }

    // Find vendor profile
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: 'Vendor profile not found. Please complete vendor registration first.',
        errorCode: 'VENDOR_NOT_FOUND'
      });
    }

    // DEFENSIVE: Validate vendor has required fields
    if (!vendor._id) {
      console.error('attachVendor: Vendor document missing _id:', vendor);
      return res.status(500).json({
        success: false,
        message: 'Invalid vendor profile',
        errorCode: 'INVALID_VENDOR_PROFILE'
      });
    }

    // Check if vendor is pending approval
    req.vendorPendingApproval = vendor.approvalStatus === 'pending';

    // Attach vendor to request for use in controllers
    req.vendor = vendor;
    next();
  } catch (error) {
    console.error('attachVendor middleware error:', error);

    // DEFENSIVE: Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID format',
        errorCode: 'CAST_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error fetching vendor profile',
      errorCode: 'VENDOR_FETCH_ERROR'
    });
  }
};

module.exports = {
  attachVendor
};
