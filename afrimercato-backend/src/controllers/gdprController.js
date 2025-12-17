// =================================================================
// GDPR CONTROLLER - Data Rights Management
// =================================================================
// Handles GDPR compliance: data export, data deletion, consent management

const User = require('../models/User');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Rider = require('../models/Rider');
const Picker = require('../models/Picker');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/gdpr/export-data
 * @desc    Export all user data (GDPR Article 15 - Right to Access)
 * @access  Private
 */
exports.exportUserData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Collect all user data
  const userData = {
    exportDate: new Date().toISOString(),
    user: await User.findById(userId).select('-password -resetPasswordToken -emailVerificationToken').lean(),
    metadata: {
      accountCreated: req.user.createdAt,
      lastUpdated: req.user.updatedAt,
      lastLogin: req.user.lastLogin
    }
  };

  // Get role-specific data
  if (req.user.hasRole('customer')) {
    userData.customerProfile = await Customer.findOne({ user: userId }).lean();
    userData.orders = await Order.find({ customer: userId }).lean();
  }

  if (req.user.hasRole('vendor')) {
    userData.vendorProfile = await Vendor.findOne({ user: userId }).lean();
    userData.vendorOrders = await Order.find({ vendor: userId }).lean();
  }

  if (req.user.hasRole('rider')) {
    userData.riderProfile = await Rider.findOne({ user: userId }).lean();
  }

  if (req.user.hasRole('picker')) {
    userData.pickerProfile = await Picker.findOne({ user: userId }).lean();
  }

  res.status(200).json({
    success: true,
    message: 'Your personal data export is ready',
    data: userData,
    gdprNote: 'This export includes all personal data we hold about you as required by GDPR Article 15'
  });
});

/**
 * @route   POST /api/gdpr/request-deletion
 * @desc    Request account and data deletion (GDPR Article 17 - Right to Erasure)
 * @access  Private
 */
exports.requestDataDeletion = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { reason, confirmEmail } = req.body;

  // Verify email confirmation
  if (confirmEmail !== req.user.email) {
    return res.status(400).json({
      success: false,
      message: 'Email confirmation does not match your account email'
    });
  }

  // Check for active orders
  const activeOrders = await Order.countDocuments({
    customer: userId,
    status: { $in: ['pending', 'confirmed', 'preparing', 'out-for-delivery'] }
  });

  if (activeOrders > 0) {
    return res.status(400).json({
      success: false,
      message: `You have ${activeOrders} active order(s). Please cancel or complete them before requesting deletion.`,
      activeOrdersCount: activeOrders
    });
  }

  // Check if vendor has active orders
  if (req.user.hasRole('vendor')) {
    const vendor = await Vendor.findOne({ user: userId });
    if (vendor) {
      const activeVendorOrders = await Order.countDocuments({
        vendor: vendor._id,
        status: { $in: ['pending', 'confirmed', 'preparing', 'out-for-delivery'] }
      });

      if (activeVendorOrders > 0) {
        return res.status(400).json({
          success: false,
          message: `Your store has ${activeVendorOrders} active order(s). Please fulfill them before requesting deletion.`,
          activeOrdersCount: activeVendorOrders
        });
      }
    }
  }

  // Mark account for deletion (30-day grace period)
  req.user.isActive = false;
  req.user.deletionRequested = true;
  req.user.deletionRequestDate = new Date();
  req.user.deletionReason = reason;
  req.user.scheduledDeletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await req.user.save();

  // TODO: Send confirmation email with cancellation link

  res.status(200).json({
    success: true,
    message: 'Data deletion request received',
    gracePeriod: '30 days',
    scheduledDeletionDate: req.user.scheduledDeletionDate,
    note: 'Your account will be deactivated immediately and permanently deleted after 30 days. You can cancel this request within the grace period.',
    gdprCompliance: 'GDPR Article 17 - Right to Erasure'
  });
});

/**
 * @route   POST /api/gdpr/cancel-deletion
 * @desc    Cancel data deletion request (within grace period)
 * @access  Private
 */
exports.cancelDeletionRequest = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!req.user.deletionRequested) {
    return res.status(400).json({
      success: false,
      message: 'No active deletion request found'
    });
  }

  // Check if still within grace period
  const now = new Date();
  if (now > req.user.scheduledDeletionDate) {
    return res.status(400).json({
      success: false,
      message: 'Grace period has expired. Your data has been scheduled for deletion.'
    });
  }

  // Cancel deletion
  req.user.isActive = true;
  req.user.deletionRequested = false;
  req.user.deletionRequestDate = null;
  req.user.deletionReason = null;
  req.user.scheduledDeletionDate = null;

  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Deletion request cancelled successfully. Your account has been reactivated.'
  });
});

/**
 * @route   GET /api/gdpr/consent-status
 * @desc    Get user's consent status for marketing and data processing
 * @access  Private
 */
exports.getConsentStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let consents = {
    marketing: {
      email: false,
      sms: false,
      push: false
    },
    dataProcessing: {
      analytics: false,
      personalization: false,
      thirdPartySharing: false
    }
  };

  // Get role-specific consent settings
  if (req.user.hasRole('customer')) {
    const customer = await Customer.findOne({ user: userId });
    if (customer && customer.preferences && customer.preferences.notifications) {
      consents.marketing = {
        email: customer.preferences.notifications.email?.promotions || false,
        sms: customer.preferences.notifications.sms?.promotions || false,
        push: customer.preferences.notifications.push?.promotions || false
      };
    }
  }

  res.status(200).json({
    success: true,
    consents,
    gdprCompliance: 'GDPR Article 7 - Conditions for Consent'
  });
});

/**
 * @route   PUT /api/gdpr/update-consent
 * @desc    Update user's consent preferences
 * @access  Private
 */
exports.updateConsent = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { marketing, dataProcessing } = req.body;

  if (req.user.hasRole('customer')) {
    const customer = await Customer.findOne({ user: userId });

    if (customer) {
      if (marketing) {
        customer.preferences.notifications.email.promotions = marketing.email || false;
        customer.preferences.notifications.sms.promotions = marketing.sms || false;
        customer.preferences.notifications.push.promotions = marketing.push || false;
      }

      await customer.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Consent preferences updated successfully',
    updatedConsents: { marketing, dataProcessing }
  });
});

/**
 * @route   POST /api/gdpr/rectify-data
 * @desc    Request data rectification (GDPR Article 16 - Right to Rectification)
 * @access  Private
 */
exports.requestDataRectification = asyncHandler(async (req, res) => {
  const { field, currentValue, correctedValue, reason } = req.body;

  // Log rectification request (in production, create a ticket system)
  console.log('Data Rectification Request:', {
    userId: req.user._id,
    email: req.user.email,
    field,
    currentValue,
    correctedValue,
    reason,
    requestedAt: new Date()
  });

  // TODO: In production, create a support ticket or admin notification

  res.status(200).json({
    success: true,
    message: 'Data rectification request submitted successfully',
    note: 'Our team will review your request and update your data within 30 days',
    gdprCompliance: 'GDPR Article 16 - Right to Rectification'
  });
});

/**
 * @route   GET /api/gdpr/processing-activities
 * @desc    Get information about data processing activities
 * @access  Public
 */
exports.getProcessingActivities = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    processingActivities: [
      {
        purpose: 'Order Processing',
        legalBasis: 'Contract Performance (GDPR Art. 6(1)(b))',
        dataCategories: ['Identity', 'Contact', 'Financial', 'Transaction'],
        retention: 'Active orders: Until fulfilled + 6 years for accounting',
        recipients: ['Vendors', 'Delivery Partners', 'Payment Processors']
      },
      {
        purpose: 'Marketing Communications',
        legalBasis: 'Consent (GDPR Art. 6(1)(a))',
        dataCategories: ['Identity', 'Contact', 'Marketing Preferences'],
        retention: 'Until consent is withdrawn',
        recipients: ['Email Service Provider']
      },
      {
        purpose: 'Platform Analytics',
        legalBasis: 'Legitimate Interests (GDPR Art. 6(1)(f))',
        dataCategories: ['Usage Data', 'Technical Data'],
        retention: '26 months',
        recipients: ['Analytics Provider (Google Analytics)']
      },
      {
        purpose: 'Legal Compliance',
        legalBasis: 'Legal Obligation (GDPR Art. 6(1)(c))',
        dataCategories: ['All personal data'],
        retention: 'As required by UK law (typically 6-7 years)',
        recipients: ['Regulatory Authorities', 'Law Enforcement']
      }
    ],
    gdprCompliance: 'GDPR Article 13 & 14 - Information to be provided'
  });
});
