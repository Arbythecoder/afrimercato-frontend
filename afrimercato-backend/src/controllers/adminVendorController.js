// =================================================================
// ADMIN VENDOR CONTROLLER - Vendor Management
// =================================================================

const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const AuditLog = require('../models/AuditLog');

// Get all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};

    if (status) query.approvalStatus = status;

    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { storeId: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Vendor.countDocuments(query);

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendors'
    });
  }
};

// Get vendor details
exports.getVendorDetails = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId).populate('user', 'name email phone createdAt');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get vendor statistics
    const totalOrders = await Order.countDocuments({ vendor: vendorId });
    const totalRevenue = await Order.aggregate([
      { $match: { vendor: vendor._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      rating: vendor.rating,
      reviews: vendor.reviews
    };

    res.json({
      success: true,
      data: {
        vendor,
        stats
      }
    });
  } catch (error) {
    console.error('Get vendor details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendor details'
    });
  }
};

// Approve vendor
exports.approveVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { notes } = req.body;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const beforeStatus = vendor.approvalStatus;

    vendor.approvalStatus = 'approved';
    vendor.isVerified = true;
    vendor.isActive = true;

    await vendor.save();

    // Log action
    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'vendor_approved',
      targetType: 'Vendor',
      targetId: vendor._id,
      targetIdentifier: vendor.storeName,
      changes: {
        before: { approvalStatus: beforeStatus },
        after: { approvalStatus: 'approved', isVerified: true }
      },
      notes,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Vendor approved successfully',
      data: { vendor }
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving vendor'
    });
  }
};

// Reject vendor
exports.rejectVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason required'
      });
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const beforeStatus = vendor.approvalStatus;

    vendor.approvalStatus = 'rejected';
    vendor.rejectionReason = reason;
    vendor.isActive = false;

    await vendor.save();

    // Log action
    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'vendor_rejected',
      targetType: 'Vendor',
      targetId: vendor._id,
      targetIdentifier: vendor.storeName,
      changes: {
        before: { approvalStatus: beforeStatus },
        after: { approvalStatus: 'rejected' }
      },
      reason,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Vendor rejected',
      data: { vendor }
    });
  } catch (error) {
    console.error('Reject vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting vendor'
    });
  }
};

// Suspend vendor
exports.suspendVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Suspension reason required'
      });
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.isActive = false;
    vendor.suspensionReason = reason;
    vendor.suspendedAt = new Date();

    await vendor.save();

    // Log action
    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'vendor_suspended',
      targetType: 'Vendor',
      targetId: vendor._id,
      targetIdentifier: vendor.storeName,
      reason,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Vendor suspended',
      data: { vendor }
    });
  } catch (error) {
    console.error('Suspend vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error suspending vendor'
    });
  }
};

// Reactivate vendor
exports.reactivateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.isActive = true;
    vendor.suspensionReason = undefined;
    vendor.suspendedAt = undefined;

    await vendor.save();

    // Log action
    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'vendor_activated',
      targetType: 'Vendor',
      targetId: vendor._id,
      targetIdentifier: vendor.storeName,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Vendor reactivated',
      data: { vendor }
    });
  } catch (error) {
    console.error('Reactivate vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reactivating vendor'
    });
  }
};

// Delete vendor
exports.deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation required. Send { confirmation: "DELETE" }'
      });
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const vendorName = vendor.storeName;

    // Soft delete by marking inactive
    vendor.isActive = false;
    vendor.deletedAt = new Date();
    await vendor.save();

    // Log action
    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'vendor_deleted',
      targetType: 'Vendor',
      targetId: vendor._id,
      targetIdentifier: vendorName,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Vendor account deleted'
    });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting vendor'
    });
  }
};

// Get verification details
exports.getVerificationDetails = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId).populate('user', 'email phone');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          storeName: vendor.storeName,
          businessLicense: vendor.businessLicense,
          taxId: vendor.taxId,
          isVerified: vendor.isVerified,
          approvalStatus: vendor.approvalStatus,
          bankDetails: vendor.bankDetails
        }
      }
    });
  } catch (error) {
    console.error('Get verification details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching verification details'
    });
  }
};

// Approve verification
exports.approveVerification = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.isVerified = true;

    await vendor.save();

    // Log action
    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'vendor_document_verified',
      targetType: 'Vendor',
      targetId: vendor._id,
      targetIdentifier: vendor.storeName
    });

    res.json({
      success: true,
      message: 'Verification approved',
      data: { vendor }
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving verification'
    });
  }
};

// Reject verification
exports.rejectVerification = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.isVerified = false;
    vendor.verificationRejectionReason = reason;

    await vendor.save();

    // Log action
    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'vendor_document_rejected',
      targetType: 'Vendor',
      targetId: vendor._id,
      targetIdentifier: vendor.storeName,
      reason
    });

    res.json({
      success: true,
      message: 'Verification rejected',
      data: { vendor }
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting verification'
    });
  }
};

// Get vendor documents
exports.getVendorDocuments = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const documents = {
      businessLicense: vendor.businessLicense,
      taxId: vendor.taxId,
      verificationStatus: vendor.isVerified ? 'verified' : 'pending'
    };

    res.json({
      success: true,
      data: { documents }
    });
  } catch (error) {
    console.error('Get vendor documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching documents'
    });
  }
};

// Send notification to vendor
exports.notifyVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { title, message } = req.body;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // In production, this would send actual notification
    // For now, just log the action

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'notification_sent',
      targetType: 'Vendor',
      targetId: vendor._id,
      targetIdentifier: vendor.storeName,
      metadata: { title, message }
    });

    res.json({
      success: true,
      message: 'Notification sent to vendor'
    });
  } catch (error) {
    console.error('Notify vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending notification'
    });
  }
};

// Send message to vendor
exports.messageVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { subject, message } = req.body;

    const vendor = await Vendor.findById(vendorId).populate('user', 'email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // In production, this would send actual email
    // For now, just log the action

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'notification_sent',
      targetType: 'Vendor',
      targetId: vendor._id,
      targetIdentifier: vendor.storeName,
      metadata: { subject, message, email: vendor.user.email }
    });

    res.json({
      success: true,
      message: 'Message sent to vendor'
    });
  } catch (error) {
    console.error('Message vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
};

// Get vendor reports
exports.getVendorReports = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get order statistics
    const orders = await Order.find({ vendor: vendorId });

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const ordersByStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        },
        ordersByStatus
      }
    });
  } catch (error) {
    console.error('Get vendor reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendor reports'
    });
  }
};

// Get vendor transactions
exports.getVendorTransactions = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const payouts = await Payout.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Payout.countDocuments({ vendor: vendorId });

    res.json({
      success: true,
      data: {
        transactions: payouts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get vendor transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transactions'
    });
  }
};
