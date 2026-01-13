// Admin controller for vendor verification and approval

const Vendor = require('../models/Vendor');
const User = require('../models/User');
const {
  sendVendorApprovalEmail,
  sendVendorRejectionEmail,
  sendVendorInfoRequestEmail,
  sendVendorSuspensionEmail,
  sendVendorReactivationEmail
} = require('../utils/emailService');

/**
 * Get all pending vendor applications
 * GET /api/admin/vendors/pending
 */
exports.getPendingVendors = async (req, res) => {
  try {
    const pendingVendors = await Vendor.find({
      approvalStatus: 'pending'
    })
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 }); // Newest first

    // Calculate wait time for each vendor
    const vendorsWithWaitTime = pendingVendors.map(vendor => {
      const submittedAt = vendor.submittedForReviewAt || vendor.createdAt;
      const hoursWaiting = Math.floor((Date.now() - submittedAt) / (1000 * 60 * 60));

      return {
        ...vendor.toObject(),
        hoursWaiting,
        isUrgent: hoursWaiting > 24 // Flag if waiting more than 24 hours
      };
    });

    res.json({
      success: true,
      count: pendingVendors.length,
      data: vendorsWithWaitTime
    });
  } catch (error) {
    console.error('Error fetching pending vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending vendor applications'
    });
  }
};

/**
 * Get all vendors (with filters)
 * GET /api/admin/vendors
 */
exports.getAllVendors = async (req, res) => {
  try {
    const { status, search, category, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};

    if (status && status !== 'all') {
      query.approvalStatus = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const vendors = await Vendor.find(query)
      .populate('user', 'name email phone createdAt')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vendor.countDocuments(query);

    res.json({
      success: true,
      data: vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors'
    });
  }
};

/**
 * Get single vendor details for review
 * GET /api/admin/vendors/:id
 */
exports.getVendorForReview = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user', 'name email phone createdAt')
      .populate('approvedBy', 'name email')
      .populate('verificationDocuments');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Calculate review metrics
    const submittedAt = vendor.submittedForReviewAt || vendor.createdAt;
    const hoursWaiting = Math.floor((Date.now() - submittedAt) / (1000 * 60 * 60));

    res.json({
      success: true,
      data: {
        ...vendor.toObject(),
        hoursWaiting,
        submittedAt
      }
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor details'
    });
  }
};

/**
 * Approve vendor application
 * POST /api/admin/vendors/:id/approve
 */
exports.approveVendor = async (req, res) => {
  try {
    const { approvalNote } = req.body;

    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.approvalStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Vendor is already approved'
      });
    }

    // Update vendor approval status
    vendor.approvalStatus = 'approved';
    vendor.isVerified = true;
    vendor.approvalNote = approvalNote || 'Your application has been approved';
    vendor.approvedBy = req.user._id;
    vendor.approvedAt = new Date();
    vendor.verifiedAt = new Date();
    vendor.lastReviewedAt = new Date();

    await vendor.save();

    // Send approval email to vendor
    await sendVendorApprovalEmail(vendor.user.email, vendor.storeName, approvalNote);

    res.json({
      success: true,
      message: `Vendor "${vendor.storeName}" has been approved successfully`,
      data: vendor
    });
  } catch (error) {
    console.error('Error approving vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving vendor'
    });
  }
};

/**
 * Reject vendor application
 * POST /api/admin/vendors/:id/reject
 */
exports.rejectVendor = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for rejection'
      });
    }

    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update vendor status
    vendor.approvalStatus = 'rejected';
    vendor.rejectionReason = rejectionReason;
    vendor.rejectedAt = new Date();
    vendor.lastReviewedAt = new Date();
    vendor.approvalNote = `Application rejected: ${rejectionReason}`;

    await vendor.save();

    // Send rejection email to vendor
    await sendVendorRejectionEmail(vendor.user.email, vendor.storeName, rejectionReason);

    res.json({
      success: true,
      message: `Vendor "${vendor.storeName}" application has been rejected`,
      data: vendor
    });
  } catch (error) {
    console.error('Error rejecting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting vendor'
    });
  }
};

/**
 * Request more information from vendor
 * POST /api/admin/vendors/:id/request-info
 */
exports.requestMoreInfo = async (req, res) => {
  try {
    const { requestMessage } = req.body;

    if (!requestMessage || requestMessage.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please specify what information is needed'
      });
    }

    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update vendor status
    vendor.approvalStatus = 'needs_info';
    vendor.approvalNote = requestMessage;
    vendor.lastReviewedAt = new Date();

    await vendor.save();

    // Send email to vendor requesting more information
    await sendVendorInfoRequestEmail(vendor.user.email, vendor.storeName, requestMessage);

    res.json({
      success: true,
      message: `Information request sent to "${vendor.storeName}"`,
      data: vendor
    });
  } catch (error) {
    console.error('Error requesting vendor info:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting information'
    });
  }
};

/**
 * Suspend vendor
 * POST /api/admin/vendors/:id/suspend
 */
exports.suspendVendor = async (req, res) => {
  try {
    const { suspensionReason } = req.body;

    if (!suspensionReason || suspensionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for suspension'
      });
    }

    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update vendor status
    vendor.approvalStatus = 'suspended';
    vendor.isActive = false;
    vendor.approvalNote = `Account suspended: ${suspensionReason}`;
    vendor.lastReviewedAt = new Date();

    await vendor.save();

    // Send suspension email to vendor
    await sendVendorSuspensionEmail(vendor.user.email, vendor.storeName, suspensionReason);

    res.json({
      success: true,
      message: `Vendor "${vendor.storeName}" has been suspended`,
      data: vendor
    });
  } catch (error) {
    console.error('Error suspending vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error suspending vendor'
    });
  }
};

/**
 * Reactivate suspended vendor
 * POST /api/admin/vendors/:id/reactivate
 */
exports.reactivateVendor = async (req, res) => {
  try {
    const { reactivationNote } = req.body;

    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.approvalStatus !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Vendor is not currently suspended'
      });
    }

    // Reactivate vendor
    vendor.approvalStatus = 'approved';
    vendor.isActive = true;
    vendor.approvalNote = reactivationNote || 'Account reactivated';
    vendor.lastReviewedAt = new Date();

    await vendor.save();

    // Send reactivation email
    await sendVendorReactivationEmail(vendor.user.email, vendor.storeName);

    res.json({
      success: true,
      message: `Vendor "${vendor.storeName}" has been reactivated`,
      data: vendor
    });
  } catch (error) {
    console.error('Error reactivating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating vendor'
    });
  }
};

/**
 * Get vendor verification statistics
 * GET /api/admin/vendors/stats
 */
exports.getVendorStats = async (req, res) => {
  try {
    const [
      totalVendors,
      pendingCount,
      approvedCount,
      rejectedCount,
      suspendedCount,
      needsInfoCount
    ] = await Promise.all([
      Vendor.countDocuments(),
      Vendor.countDocuments({ approvalStatus: 'pending' }),
      Vendor.countDocuments({ approvalStatus: 'approved' }),
      Vendor.countDocuments({ approvalStatus: 'rejected' }),
      Vendor.countDocuments({ approvalStatus: 'suspended' }),
      Vendor.countDocuments({ approvalStatus: 'needs_info' })
    ]);

    // Get average approval time (for approved vendors)
    const approvedVendors = await Vendor.find({
      approvalStatus: 'approved',
      approvedAt: { $exists: true },
      createdAt: { $exists: true }
    }).select('createdAt approvedAt');

    let avgApprovalHours = 0;
    if (approvedVendors.length > 0) {
      const totalHours = approvedVendors.reduce((sum, vendor) => {
        const hours = (vendor.approvedAt - vendor.createdAt) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgApprovalHours = Math.round(totalHours / approvedVendors.length);
    }

    // Get urgent applications (waiting more than 24 hours)
    const urgentApplications = await Vendor.find({
      approvalStatus: 'pending',
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).countDocuments();

    res.json({
      success: true,
      data: {
        total: totalVendors,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        suspended: suspendedCount,
        needsInfo: needsInfoCount,
        avgApprovalTimeHours: avgApprovalHours,
        urgentApplications,
        approvalRate: totalVendors > 0
          ? Math.round((approvedCount / (approvedCount + rejectedCount)) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor statistics'
    });
  }
};

module.exports = exports;
