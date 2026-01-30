// =================================================================
// PICKER ORDER CONTROLLER - Order Fulfillment Workflow
// =================================================================

const Order = require('../models/Order');
const PickingSession = require('../models/PickingSession');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// Get available orders for picking
exports.getAvailableOrders = async (req, res) => {
  try {
    const { storeId } = req.query;

    const query = {
      status: { $in: ['confirmed', 'preparing'] },
      picker: { $exists: false }
    };

    if (storeId) {
      query.vendor = storeId;
    }

    const orders = await Order.find(query)
      .populate('vendor', 'storeName location')
      .populate('customer', 'name phone')
      .populate('items.product', 'name price images')
      .sort({ createdAt: 1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        orders: orders.map(formatOrder),
        total: orders.length
      }
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available orders'
    });
  }
};

// Get picker's assigned orders
exports.getMyOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {
      picker: req.user.id
    };

    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['assigned_to_picker', 'picking', 'packed'] };
    }

    const orders = await Order.find(query)
      .populate('vendor', 'storeName location')
      .populate('customer', 'name phone')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        orders: orders.map(formatOrder),
        total: orders.length
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
};

// Claim order for picking
exports.claimOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.picker) {
      return res.status(400).json({
        success: false,
        message: 'Order already claimed'
      });
    }

    // Assign picker to order
    order.picker = req.user.id;
    order.status = 'assigned_to_picker';
    order.timestamps.assignedToPicker = new Date();

    await order.save();

    // Create picking session
    const session = new PickingSession({
      order: order._id,
      picker: req.user.id,
      vendor: order.vendor,
      status: 'assigned',
      items: order.items.map(item => ({
        product: item.product,
        quantityOrdered: item.quantity,
        status: 'pending'
      }))
    });

    await session.save();

    res.json({
      success: true,
      message: 'Order claimed successfully',
      data: {
        order: formatOrder(order),
        sessionId: session._id
      }
    });
  } catch (error) {
    console.error('Claim order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error claiming order'
    });
  }
};

// Start picking order
exports.startPicking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.picker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pick this order'
      });
    }

    const session = await PickingSession.findOne({ order: orderId, picker: req.user.id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Picking session not found'
      });
    }

    session.status = 'in_progress';
    session.startedAt = new Date();
    await session.save();

    order.status = 'picking';
    order.timestamps.pickingStarted = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Picking started',
      data: {
        sessionId: session._id,
        order: formatOrder(order)
      }
    });
  } catch (error) {
    console.error('Start picking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting picking'
    });
  }
};

// Get order items to pick
exports.getOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;

    const session = await PickingSession.findOne({ order: orderId, picker: req.user.id })
      .populate('items.product', 'name price images stock')
      .populate('items.replacementProduct', 'name price images');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Picking session not found'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        items: session.items.map(item => ({
          id: item._id,
          product: item.product,
          quantityOrdered: item.quantityOrdered,
          quantityPicked: item.quantityPicked,
          status: item.status,
          replacementProduct: item.replacementProduct,
          replacementReason: item.replacementReason,
          unavailableReason: item.unavailableReason,
          notes: item.notes,
          pickedAt: item.pickedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get order items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order items'
    });
  }
};

// Mark item as picked
exports.pickItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { quantity } = req.body;

    const session = await PickingSession.findOne({ order: orderId, picker: req.user.id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Picking session not found'
      });
    }

    const item = session.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in session'
      });
    }

    item.quantityPicked = quantity || item.quantityOrdered;
    item.status = 'picked';
    item.pickedAt = new Date();

    await session.save();

    res.json({
      success: true,
      message: 'Item marked as picked',
      data: {
        itemId: item._id,
        quantityPicked: item.quantityPicked,
        status: item.status
      }
    });
  } catch (error) {
    console.error('Pick item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking item as picked'
    });
  }
};

// Report item issue (unavailable or needs replacement)
exports.reportItemIssue = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { issueType, reason, replacementProductId } = req.body;

    const session = await PickingSession.findOne({ order: orderId, picker: req.user.id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Picking session not found'
      });
    }

    const item = session.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in session'
      });
    }

    if (issueType === 'unavailable') {
      item.status = 'unavailable';
      item.unavailableReason = reason;
      item.quantityPicked = 0;
    } else if (issueType === 'replace') {
      if (!replacementProductId) {
        return res.status(400).json({
          success: false,
          message: 'Replacement product required'
        });
      }

      item.status = 'replaced';
      item.replacementProduct = replacementProductId;
      item.replacementReason = reason;
    }

    await session.save();

    res.json({
      success: true,
      message: 'Item issue reported',
      data: {
        itemId: item._id,
        status: item.status,
        reason
      }
    });
  } catch (error) {
    console.error('Report item issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reporting item issue'
    });
  }
};

// Suggest substitute product
exports.suggestSubstitute = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { itemId, substituteProductId, reason } = req.body;

    const session = await PickingSession.findOne({ order: orderId, picker: req.user.id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Picking session not found'
      });
    }

    const item = session.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in session'
      });
    }

    item.replacementProduct = substituteProductId;
    item.replacementReason = reason;
    item.status = 'replaced';

    await session.save();

    res.json({
      success: true,
      message: 'Substitute product suggested',
      data: {
        itemId: item._id,
        substituteProductId,
        reason
      }
    });
  } catch (error) {
    console.error('Suggest substitute error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error suggesting substitute'
    });
  }
};

// Mark all items picked (ready for packing)
exports.readyForPacking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const session = await PickingSession.findOne({ order: orderId, picker: req.user.id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Picking session not found'
      });
    }

    // Check if all items are picked/replaced/unavailable
    const allItemsProcessed = session.items.every(
      item => ['picked', 'replaced', 'unavailable'].includes(item.status)
    );

    if (!allItemsProcessed) {
      return res.status(400).json({
        success: false,
        message: 'Not all items have been processed'
      });
    }

    session.status = 'completed';
    session.completedAt = new Date();
    session.calculateDuration();
    session.calculateAccuracy();

    await session.save();

    res.json({
      success: true,
      message: 'All items picked, ready for packing',
      data: {
        sessionId: session._id,
        totalDuration: session.totalDuration,
        accuracy: session.accuracy
      }
    });
  } catch (error) {
    console.error('Ready for packing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking ready for packing'
    });
  }
};

// Start packing order
exports.startPacking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const session = await PickingSession.findOne({ order: orderId, picker: req.user.id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Picking session not found'
      });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be fully picked before packing'
      });
    }

    session.packingStarted = new Date();

    await session.save();

    res.json({
      success: true,
      message: 'Packing started',
      data: {
        sessionId: session._id
      }
    });
  } catch (error) {
    console.error('Start packing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting packing'
    });
  }
};

// Upload packing photos
exports.uploadPackingPhotos = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { photos } = req.body;

    const session = await PickingSession.findOne({ order: orderId, picker: req.user.id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Picking session not found'
      });
    }

    if (!session.packingPhotos) {
      session.packingPhotos = [];
    }

    session.packingPhotos.push(...photos);

    await session.save();

    res.json({
      success: true,
      message: 'Packing photos uploaded',
      data: {
        photos: session.packingPhotos
      }
    });
  } catch (error) {
    console.error('Upload packing photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading photos'
    });
  }
};

// Complete packing (ready for rider)
exports.completePacking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { numberOfBags, notes } = req.body;

    const session = await PickingSession.findOne({ order: orderId, picker: req.user.id });
    const order = await Order.findById(orderId);

    if (!session || !order) {
      return res.status(404).json({
        success: false,
        message: 'Session or order not found'
      });
    }

    session.packingCompleted = true;
    session.packingCompletedAt = new Date();
    session.numberOfBags = numberOfBags || 1;
    if (notes) session.notes = notes;

    // Calculate picker earnings (example: £2 per order)
    session.earnings = 2.00;

    await session.save();

    // Update order status
    order.status = 'packed';
    order.timestamps.packed = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Packing completed. Order ready for rider pickup.',
      data: {
        sessionId: session._id,
        orderId: order._id,
        earnings: session.earnings,
        numberOfBags: session.numberOfBags
      }
    });
  } catch (error) {
    console.error('Complete packing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing packing'
    });
  }
};

// Get picking history
exports.getHistory = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;

    const query = {
      picker: req.user.id,
      status: 'completed'
    };

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    const sessions = await PickingSession.find(query)
      .populate('order', 'orderNumber totalAmount')
      .populate('vendor', 'storeName')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        sessions: sessions.map(s => ({
          id: s._id,
          order: s.order,
          vendor: s.vendor,
          totalDuration: s.totalDuration,
          accuracy: s.accuracy,
          earnings: s.earnings,
          completedAt: s.completedAt
        })),
        total: sessions.length
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching history'
    });
  }
};

// Get earnings
exports.getEarnings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      picker: req.user.id,
      status: 'completed'
    };

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    const sessions = await PickingSession.find(query)
      .populate('vendor', 'storeName')
      .sort({ completedAt: -1 });

    const totalEarnings = sessions.reduce((sum, s) => sum + (s.earnings || 0), 0);
    const totalOrders = sessions.length;

    const earningsByDate = sessions.reduce((acc, s) => {
      const date = s.completedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, earnings: 0, orders: 0 };
      }
      acc[date].earnings += s.earnings || 0;
      acc[date].orders += 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalEarnings: totalEarnings.toFixed(2),
          totalOrders,
          averageEarningsPerOrder: totalOrders > 0 ? (totalEarnings / totalOrders).toFixed(2) : '0.00'
        },
        earningsByDate: Object.values(earningsByDate),
        sessions: sessions.map(s => ({
          id: s._id,
          vendor: s.vendor ? s.vendor.storeName : null,
          earnings: s.earnings,
          completedAt: s.completedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching earnings'
    });
  }
};

// Get performance stats
exports.getStats = async (req, res) => {
  try {
    const sessions = await PickingSession.find({
      picker: req.user.id,
      status: 'completed'
    });

    const totalOrders = sessions.length;
    const totalEarnings = sessions.reduce((sum, s) => sum + (s.earnings || 0), 0);
    const avgAccuracy = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.accuracy || 100), 0) / sessions.length
      : 100;

    const totalDuration = sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
    const avgTimePerOrder = totalOrders > 0 ? totalDuration / totalOrders : 0;

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = sessions.filter(s => s.completedAt >= today);
    const todayOrders = todaySessions.length;
    const todayEarnings = todaySessions.reduce((sum, s) => sum + (s.earnings || 0), 0);

    res.json({
      success: true,
      data: {
        overall: {
          totalOrders,
          totalEarnings: totalEarnings.toFixed(2),
          averageAccuracy: avgAccuracy.toFixed(1),
          averageTimePerOrder: avgTimePerOrder.toFixed(0)
        },
        today: {
          orders: todayOrders,
          earnings: todayEarnings.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching stats'
    });
  }
};

// Helper function to format order
function formatOrder(order) {
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    vendor: order.vendor,
    customer: order.customer,
    items: order.items,
    totalAmount: order.totalAmount,
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    createdAt: order.createdAt
  };
}
