// =================================================================
// ADMIN CONTROLLER
// =================================================================
// Handles admin operations: vendor approval, user management, etc.

const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// =================================================================
// VENDOR MANAGEMENT
// =================================================================

/**
 * @route   GET /api/admin/vendors/pending
 * @desc    Get all vendors pending approval
 * @access  Private (Admin only)
 */
exports.getPendingVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find({ approvalStatus: 'pending' })
    .populate('user', 'name email createdAt')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors
  });
});

/**
 * @route   GET /api/admin/vendors
 * @desc    Get all vendors with filters
 * @access  Private (Admin only)
 */
exports.getAllVendors = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (status && status !== 'all') {
    query.approvalStatus = status;
  }

  if (search) {
    query.$or = [
      { storeName: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } }
    ];
  }

  const vendors = await Vendor.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Vendor.countDocuments(query);

  res.status(200).json({
    success: true,
    data: vendors,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @route   PUT /api/admin/vendors/:id/approve
 * @desc    Approve a vendor store
 * @access  Private (Admin only)
 */
exports.approveVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  const vendor = await Vendor.findById(id);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  vendor.approvalStatus = 'approved';
  vendor.approvalNote = note || 'Your store has been approved!';
  vendor.approvedBy = req.user._id;
  vendor.approvedAt = new Date();
  vendor.isVerified = true;
  vendor.verifiedAt = new Date();

  await vendor.save();

  // TODO: Send email notification to vendor

  res.status(200).json({
    success: true,
    message: 'Vendor approved successfully',
    data: vendor
  });
});

/**
 * @route   PUT /api/admin/vendors/:id/reject
 * @desc    Reject a vendor store
 * @access  Private (Admin only)
 */
exports.rejectVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a rejection reason'
    });
  }

  const vendor = await Vendor.findById(id);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  vendor.approvalStatus = 'rejected';
  vendor.approvalNote = reason;
  vendor.approvedBy = req.user._id;

  await vendor.save();

  // TODO: Send email notification to vendor

  res.status(200).json({
    success: true,
    message: 'Vendor rejected',
    data: vendor
  });
});

/**
 * @route   PUT /api/admin/vendors/:id/suspend
 * @desc    Suspend an approved vendor
 * @access  Private (Admin only)
 */
exports.suspendVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const vendor = await Vendor.findById(id);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  vendor.approvalStatus = 'suspended';
  vendor.approvalNote = reason || 'Your store has been suspended';
  vendor.isActive = false;

  await vendor.save();

  res.status(200).json({
    success: true,
    message: 'Vendor suspended',
    data: vendor
  });
});

// =================================================================
// DASHBOARD STATS
// =================================================================

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin only)
 */
exports.getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalVendors,
    pendingVendors,
    approvedVendors,
    totalUsers,
    totalOrders,
    totalProducts,
    recentOrders
  ] = await Promise.all([
    Vendor.countDocuments(),
    Vendor.countDocuments({ approvalStatus: 'pending' }),
    Vendor.countDocuments({ approvalStatus: 'approved' }),
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name')
      .populate('vendor', 'storeName')
  ]);

  // Calculate revenue
  const revenueData = await Order.aggregate([
    { $match: { status: { $in: ['delivered', 'completed'] } } },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      vendors: {
        total: totalVendors,
        pending: pendingVendors,
        approved: approvedVendors,
        rejected: totalVendors - pendingVendors - approvedVendors
      },
      users: totalUsers,
      orders: totalOrders,
      products: totalProducts,
      revenue: revenueData[0]?.total || 0,
      recentOrders
    }
  });
});
