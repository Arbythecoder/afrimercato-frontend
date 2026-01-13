// File: src/controllers/payoutController.js
// Manages vendor payout operations

const Payout = require('../models/Payout');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const { sendEmail } = require('../utils/emailService');

// =================================================================
// VENDOR PAYOUT ENDPOINTS
// =================================================================

/**
 * @route   GET /api/vendor/payouts
 * @desc    Get all payouts for the logged-in vendor
 * @access  Private (Vendor)
 */
exports.getVendorPayouts = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Find vendor profile
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Build query
    const query = { vendor: vendor._id };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Payout.countDocuments(query);

    const payouts = await Payout.find(query)
      .populate('vendor', 'storeName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: payouts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: payouts
    });
  } catch (error) {
    console.error('Error fetching vendor payouts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payouts',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/vendor/payouts/:id
 * @desc    Get single payout details
 * @access  Private (Vendor)
 */
exports.getPayoutById = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const payout = await Payout.findOne({
      _id: req.params.id,
      vendor: vendor._id
    })
      .populate('vendor', 'storeName bankDetails')
      .populate('orders.orderId', 'orderNumber pricing.total createdAt');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payout
    });
  } catch (error) {
    console.error('Error fetching payout:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payout',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/vendor/payouts/summary
 * @desc    Get payout summary statistics
 * @access  Private (Vendor)
 */
exports.getPayoutSummary = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Get all payouts for vendor
    const payouts = await Payout.find({ vendor: vendor._id });

    // Calculate summary
    const summary = {
      totalPaid: 0,
      totalPending: 0,
      totalProcessing: 0,
      totalOrders: 0,
      totalPlatformFees: 0,
      lifetimeEarnings: 0,
      lastPayoutDate: null,
      nextPayoutDate: null,
      payoutHistory: {
        completed: 0,
        pending: 0,
        failed: 0
      }
    };

    payouts.forEach(payout => {
      summary.totalOrders += payout.orders.length;
      summary.totalPlatformFees += payout.financials.totalPlatformFees;
      summary.lifetimeEarnings += payout.financials.totalVendorEarnings;

      if (payout.status === 'completed') {
        summary.totalPaid += payout.financials.finalPayoutAmount;
        summary.payoutHistory.completed++;

        if (!summary.lastPayoutDate || payout.processedAt > summary.lastPayoutDate) {
          summary.lastPayoutDate = payout.processedAt;
        }
      } else if (payout.status === 'pending') {
        summary.totalPending += payout.financials.finalPayoutAmount;
        summary.payoutHistory.pending++;
      } else if (payout.status === 'processing') {
        summary.totalProcessing += payout.financials.finalPayoutAmount;
      } else if (payout.status === 'failed') {
        summary.payoutHistory.failed++;
      }
    });

    // Get pending earnings (completed orders not yet in payout)
    const completedOrders = await Order.find({
      vendor: vendor._id,
      status: 'completed',
      'payment.status': 'paid'
    });

    const paidOrderIds = payouts
      .flatMap(p => p.orders.map(o => o.orderId.toString()));

    const unpaidOrders = completedOrders.filter(
      order => !paidOrderIds.includes(order._id.toString())
    );

    const pendingEarnings = unpaidOrders.reduce((sum, order) => {
      const platformFee = (order.pricing.total * 15) / 100; // 15% commission
      return sum + (order.pricing.total - platformFee);
    }, 0);

    summary.pendingEarnings = pendingEarnings;
    summary.unpaidOrderCount = unpaidOrders.length;

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching payout summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payout summary',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/vendor/payouts/request
 * @desc    Request a payout for eligible earnings
 * @access  Private (Vendor)
 */
exports.requestPayout = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Check if vendor has bank details
    if (!vendor.bankDetails || !vendor.bankDetails.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please add your bank details before requesting payout'
      });
    }

    // Get completed orders not yet paid out
    const completedOrders = await Order.find({
      vendor: vendor._id,
      status: 'completed',
      'payment.status': 'paid'
    });

    // Get already paid order IDs
    const existingPayouts = await Payout.find({ vendor: vendor._id });
    const paidOrderIds = existingPayouts
      .flatMap(p => p.orders.map(o => o.orderId.toString()));

    // Filter unpaid orders
    const unpaidOrders = completedOrders.filter(
      order => !paidOrderIds.includes(order._id.toString())
    );

    if (unpaidOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No eligible orders for payout'
      });
    }

    // Calculate payout
    const commissionRate = 15; // 15% platform fee
    let totalOrderValue = 0;
    let totalPlatformFees = 0;
    let totalVendorEarnings = 0;

    const orderDetails = unpaidOrders.map(order => {
      const orderTotal = order.pricing.total;
      const platformFee = (orderTotal * commissionRate) / 100;
      const vendorEarning = orderTotal - platformFee;

      totalOrderValue += orderTotal;
      totalPlatformFees += platformFee;
      totalVendorEarnings += vendorEarning;

      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderTotal,
        platformFee,
        vendorEarning,
        completedAt: order.updatedAt
      };
    });

    // Determine payout period
    const sortedOrders = unpaidOrders.sort((a, b) => a.updatedAt - b.updatedAt);
    const startDate = sortedOrders[0].updatedAt;
    const endDate = sortedOrders[sortedOrders.length - 1].updatedAt;

    // Create payout
    const payoutNumber = await Payout.generatePayoutNumber();

    const payout = await Payout.create({
      payoutNumber,
      vendor: vendor._id,
      period: {
        startDate,
        endDate
      },
      orders: orderDetails,
      financials: {
        totalOrderValue,
        totalPlatformFees,
        totalVendorEarnings,
        finalPayoutAmount: totalVendorEarnings
      },
      commission: {
        rate: commissionRate,
        type: 'percentage'
      },
      status: 'pending',
      payment: {
        method: 'bank_transfer',
        bankDetails: vendor.bankDetails
      },
      requestedBy: req.user._id,
      requestedAt: new Date(),
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Payout requested by vendor',
        updatedBy: req.user._id
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: payout
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting payout',
      error: error.message
    });
  }
};

// =================================================================
// ADMIN PAYOUT ENDPOINTS
// =================================================================

/**
 * @route   GET /api/admin/payouts
 * @desc    Get all payouts (Admin)
 * @access  Private (Admin)
 */
exports.getAllPayouts = async (req, res) => {
  try {
    const { status, vendorId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (vendorId) {
      query.vendor = vendorId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await Payout.countDocuments(query);

    const payouts = await Payout.find(query)
      .populate('vendor', 'storeName phone')
      .populate('requestedBy', 'name email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: payouts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: payouts
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payouts',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/admin/payouts/:id/approve
 * @desc    Approve payout and initiate payment
 * @access  Private (Admin)
 */
exports.approvePayout = async (req, res) => {
  try {
    const { transactionId, notes } = req.body;

    const payout = await Payout.findById(req.params.id).populate('vendor');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve payout with status: ${payout.status}`
      });
    }

    // Update payout status
    payout.status = 'processing';
    payout.approvedBy = req.user._id;
    payout.approvedAt = new Date();
    payout.payment.transactionId = transactionId;
    if (notes) payout.internalNotes = notes;

    payout.statusHistory.push({
      status: 'processing',
      timestamp: new Date(),
      note: notes || 'Payout approved and processing',
      updatedBy: req.user._id
    });

    await payout.save();

    res.status(200).json({
      success: true,
      message: 'Payout approved and processing',
      data: payout
    });
  } catch (error) {
    console.error('Error approving payout:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving payout',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/admin/payouts/:id/complete
 * @desc    Mark payout as completed
 * @access  Private (Admin)
 */
exports.completePayout = async (req, res) => {
  try {
    const { reference, receiptUrl, notes } = req.body;

    const payout = await Payout.findById(req.params.id).populate('vendor');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (!['pending', 'processing'].includes(payout.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete payout with status: ${payout.status}`
      });
    }

    // Update payout
    payout.status = 'completed';
    payout.processedBy = req.user._id;
    payout.processedAt = new Date();
    payout.payment.reference = reference;
    payout.payment.receiptUrl = receiptUrl;
    payout.payment.processedAt = new Date();
    if (notes) payout.notes = notes;

    payout.statusHistory.push({
      status: 'completed',
      timestamp: new Date(),
      note: notes || 'Payout completed successfully',
      updatedBy: req.user._id
    });

    await payout.save();

    res.status(200).json({
      success: true,
      message: 'Payout marked as completed',
      data: payout
    });
  } catch (error) {
    console.error('Error completing payout:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing payout',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/admin/payouts/:id/reject
 * @desc    Reject payout request
 * @access  Private (Admin)
 */
exports.rejectPayout = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rejection reason'
      });
    }

    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    payout.status = 'cancelled';
    payout.payment.failureReason = reason;
    payout.processedBy = req.user._id;
    payout.processedAt = new Date();

    payout.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason,
      updatedBy: req.user._id
    });

    await payout.save();

    res.status(200).json({
      success: true,
      message: 'Payout rejected',
      data: payout
    });
  } catch (error) {
    console.error('Error rejecting payout:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting payout',
      error: error.message
    });
  }
};

module.exports = exports;
