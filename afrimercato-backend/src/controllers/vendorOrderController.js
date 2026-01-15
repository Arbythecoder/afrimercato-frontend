// =================================================================
// VENDOR ORDER MANAGEMENT CONTROLLER - PRODUCTION GRADE
// =================================================================
// File: src/controllers/vendorOrderController.js
// UK Standard | Industry Best Practices | Complete Order Lifecycle
//
// Features:
// - Order management
// - Status tracking
// - Fulfillment workflows
// - Order analytics
// - Picker assignment
// - Delivery coordination

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// =================================================================
// ORDER MANAGEMENT
// =================================================================

/**
 * @route   GET /api/vendor/orders
 * @desc    Get all vendor orders with filters
 * @access  Private (Vendor)
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    search,
    sortBy = 'newest'
  } = req.query;

  const skip = (page - 1) * limit;
  const query = { vendor: vendorId };

  // Filter by order status
  if (status && status !== 'all') {
    query.status = status;
  }

  // Filter by payment status
  if (paymentStatus && paymentStatus !== 'all') {
    query.paymentStatus = paymentStatus;
  }

  // Search by order number or customer name
  if (search) {
    query.$or = [
      { orderNumber: new RegExp(search, 'i') }
    ];
  }

  // Sorting
  let sortObj = {};
  switch (sortBy) {
    case 'newest':
      sortObj = { createdAt: -1 };
      break;
    case 'oldest':
      sortObj = { createdAt: 1 };
      break;
    case 'highest-value':
      sortObj = { totalAmount: -1 };
      break;
    case 'lowest-value':
      sortObj = { totalAmount: 1 };
      break;
    default:
      sortObj = { createdAt: -1 };
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    filters: {
      status,
      paymentStatus,
      search
    },
    data: orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer?.name,
        email: order.customer?.email,
        phone: order.customer?.phone
      },
      itemsCount: order.items.length,
      totalAmount: formatCurrency(order.totalAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdDate: formatDate(order.createdAt),
      createdTime: formatTime(order.createdAt)
    }))
  });
});

/**
 * @route   GET /api/vendor/orders/:orderId
 * @desc    Get order details
 * @access  Private (Vendor)
 */
exports.getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const vendorId = req.vendor._id;

  const order = await Order.findOne({
    _id: orderId,
    vendor: vendorId
  })
    .populate('customer', 'name email phone')
    .populate('items.product', 'name price images')
    .populate('picker', 'name phone')
    .populate('rider', 'name phone');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      id: order._id,
      orderNumber: order.orderNumber,
      customer: {
        id: order.customer._id,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone
      },
      items: order.items.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: formatCurrency(item.price),
        total: formatCurrency(item.price * item.quantity),
        image: item.product.images?.[0]
      })),
      delivery: {
        address: order.deliveryAddress,
        details: order.deliveryAddressDetails
      },
      charges: {
        subtotal: formatCurrency(
          order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        ),
        tax: formatCurrency(order.totalAmount * 0.05),
        deliveryFee: formatCurrency(5),
        total: formatCurrency(order.totalAmount)
      },
      status: {
        order: order.status,
        payment: order.paymentStatus
      },
      assignment: {
        picker: order.picker ? {
          id: order.picker._id,
          name: order.picker.name,
          phone: order.picker.phone
        } : null,
        rider: order.rider ? {
          id: order.rider._id,
          name: order.rider.name,
          phone: order.rider.phone
        } : null
      },
      timeline: {
        createdAt: formatDate(order.createdAt),
        createdTime: formatTime(order.createdAt),
        updatedAt: formatDate(order.updatedAt)
      }
    }
  });
});

/**
 * @route   PATCH /api/vendor/orders/:orderId/status
 * @desc    Update order status
 * @access  Private (Vendor)
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const vendorId = req.vendor._id;

  const validStatuses = ['pending', 'processing', 'picker_assigned', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Valid options: ${validStatuses.join(', ')}`
    });
  }

  const order = await Order.findOne({
    _id: orderId,
    vendor: vendorId
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Validation: Can't mark complete without picker assigned
  if (status === 'completed' && !order.picker) {
    return res.status(400).json({
      success: false,
      message: 'Assign a picker before marking order as completed'
    });
  }

  const oldStatus = order.status;
  order.status = status;
  order.updatedAt = new Date();

  // Set completion date if marked complete
  if (status === 'completed' && !order.completedAt) {
    order.completedAt = new Date();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      oldStatus,
      newStatus: order.status,
      updatedAt: formatDate(order.updatedAt)
    }
  });
});

/**
 * @route   POST /api/vendor/orders/:orderId/assign-picker
 * @desc    Assign picker to order
 * @access  Private (Vendor)
 */
exports.assignPicker = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { pickerId } = req.body;
  const vendorId = req.vendor._id;

  if (!pickerId) {
    return res.status(400).json({
      success: false,
      message: 'Picker ID is required'
    });
  }

  const order = await Order.findOne({
    _id: orderId,
    vendor: vendorId
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify picker exists and has picker role
  const picker = await User.findOne({
    _id: pickerId,
    roles: 'picker'
  });

  if (!picker) {
    return res.status(404).json({
      success: false,
      message: 'Picker not found'
    });
  }

  order.picker = pickerId;
  order.status = 'picker_assigned';
  order.updatedAt = new Date();
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Picker assigned successfully',
    data: {
      orderId: order._id,
      picker: {
        id: picker._id,
        name: picker.name,
        phone: picker.phone
      },
      status: order.status
    }
  });
});

/**
 * @route   POST /api/vendor/orders/:orderId/assign-rider
 * @desc    Assign rider to order
 * @access  Private (Vendor)
 */
exports.assignRider = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { riderId } = req.body;
  const vendorId = req.vendor._id;

  if (!riderId) {
    return res.status(400).json({
      success: false,
      message: 'Rider ID is required'
    });
  }

  const order = await Order.findOne({
    _id: orderId,
    vendor: vendorId
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify rider exists
  const rider = await User.findOne({
    _id: riderId,
    roles: 'rider'
  });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider not found'
    });
  }

  order.rider = riderId;
  order.updatedAt = new Date();
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Rider assigned successfully',
    data: {
      orderId: order._id,
      rider: {
        id: rider._id,
        name: rider.name,
        phone: rider.phone
      }
    }
  });
});

/**
 * @route   POST /api/vendor/orders/:orderId/cancel
 * @desc    Cancel order (with refund)
 * @access  Private (Vendor)
 */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const vendorId = req.vendor._id;

  const order = await Order.findOne({
    _id: orderId,
    vendor: vendorId
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Can't cancel completed orders
  if (order.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel completed orders'
    });
  }

  // Can't cancel already cancelled orders
  if (order.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Order is already cancelled'
    });
  }

  // Restore stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.status = 'cancelled';
  order.cancellationReason = reason;
  order.cancelledAt = new Date();
  order.updatedAt = new Date();
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      refundAmount: formatCurrency(order.totalAmount)
    }
  });
});

/**
 * @route   GET /api/vendor/orders/stats/summary
 * @desc    Get order summary statistics
 * @access  Private (Vendor)
 */
exports.getOrderStats = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    pendingPayment
  ] = await Promise.all([
    Order.countDocuments({ vendor: vendorId }),
    Order.countDocuments({ vendor: vendorId, status: 'pending' }),
    Order.countDocuments({ vendor: vendorId, status: 'processing' }),
    Order.countDocuments({ vendor: vendorId, status: 'completed' }),
    Order.countDocuments({ vendor: vendorId, status: 'cancelled' }),
    Order.aggregate([
      { $match: { vendor: vendorId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { vendor: vendorId, paymentStatus: 'pending' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
  ]);

  const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders
      },
      financial: {
        totalRevenue: formatCurrency(totalRevenue[0]?.total || 0),
        pendingPayment: formatCurrency(pendingPayment[0]?.total || 0)
      },
      metrics: {
        completionRate: `${completionRate}%`,
        cancellationRate: `${totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0}%`
      }
    }
  });
});

/**
 * @route   GET /api/vendor/orders/export/csv
 * @desc    Export orders as CSV (for accounting/compliance)
 * @access  Private (Vendor)
 */
exports.exportOrdersCSV = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { startDate, endDate } = req.query;

  const query = { vendor: vendorId };

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const orders = await Order.find(query)
    .populate('customer', 'name email phone')
    .lean();

  // Build CSV
  let csv = 'Order Number,Date,Customer,Email,Items,Total,Status,Payment Status\n';

  orders.forEach(order => {
    const itemsStr = order.items.length;
    const row = [
      order.orderNumber,
      formatDate(order.createdAt),
      order.customer?.name || 'Unknown',
      order.customer?.email || '',
      itemsStr,
      order.totalAmount,
      order.status,
      order.paymentStatus
    ].join(',');
    csv += row + '\n';
  });

  res.status(200).json({
    success: true,
    data: csv,
    filename: `orders-${new Date().toISOString().split('T')[0]}.csv`
  });
});

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date));
}
