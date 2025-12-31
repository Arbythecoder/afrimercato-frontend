// Middleware to check if vendor is approved before allowing certain actions

const Vendor = require('../models/Vendor');

/**
 * Middleware to ensure vendor is approved before they can:
 * - Create products
 * - Receive orders
 * - Manage inventory
 */
const checkVendorApproval = async (req, res, next) => {
  try {
    // Get vendor profile for the authenticated user
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found. Please complete your store setup first.'
      });
    }

    // Check approval status
    if (vendor.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        status: 'pending_approval',
        message: 'Your vendor account is pending admin approval. We typically review applications within 24 hours. You will receive an email when your account is approved.',
        submittedAt: vendor.submittedForReviewAt || vendor.createdAt,
        estimatedReviewTime: '24 hours'
      });
    }

    if (vendor.approvalStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        status: 'rejected',
        message: 'Your vendor application was not approved.',
        reason: vendor.rejectionReason || 'Please contact support for more information.',
        rejectedAt: vendor.rejectedAt,
        supportEmail: 'vendors@afrimercato.com'
      });
    }

    if (vendor.approvalStatus === 'needs_info') {
      return res.status(403).json({
        success: false,
        status: 'needs_information',
        message: 'Additional information required for your vendor application.',
        notes: vendor.approvalNote || 'Please check your email for details on what information is needed.',
        resubmitUrl: '/vendor/resubmit-documents'
      });
    }

    if (vendor.approvalStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        status: 'suspended',
        message: 'Your vendor account has been suspended.',
        reason: vendor.approvalNote || 'Please contact support.',
        supportEmail: 'vendors@afrimercato.com'
      });
    }

    // If approved, attach vendor to request and continue
    if (vendor.approvalStatus === 'approved') {
      req.vendor = vendor;
      return next();
    }

    // Fallback for any other status
    return res.status(403).json({
      success: false,
      message: 'Unable to process request. Please contact support.',
      status: vendor.approvalStatus
    });

  } catch (error) {
    console.error('Vendor verification check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking vendor verification status'
    });
  }
};

/**
 * Middleware for routes that can be accessed regardless of approval status
 * But still need vendor profile (like settings, viewing own profile)
 */
const attachVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    console.error('Error attaching vendor profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error loading vendor profile'
    });
  }
};

module.exports = {
  checkVendorApproval,
  attachVendorProfile
};
