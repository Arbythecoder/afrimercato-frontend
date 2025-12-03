// =================================================================
// REAL-TIME ORDER TRACKING CONTROLLER
// =================================================================
// Live order status updates and rider location tracking
// Like UberEats, Chowdeck, JustEat, Deliveroo

const Order = require('../models/Order');
const User = require('../models/User');

/**
 * Get order tracking details
 * GET /api/tracking/:orderId
 * Public endpoint (authenticated users can track their orders)
 */
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customer', 'name phone')
      .populate('vendor', 'storeName address phone')
      .populate('rider', 'name phone vehicle currentLocation')
      .populate('picker', 'name phone')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization (customer, vendor, rider, or picker can view)
    const userRole = req.user?.primaryRole;
    const userId = req.user?._id.toString();
    const isAuthorized =
      order.customer?._id.toString() === userId ||
      order.vendor?._id.toString() === userId ||
      order.rider?._id.toString() === userId ||
      order.picker?._id.toString() === userId;

    if (!isAuthorized && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // Calculate estimated time remaining
    const estimatedTime = calculateEstimatedTime(order);

    // Build tracking response
    const tracking = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      statusTimeline: order.statusHistory || [],

      // Customer info
      customer: {
        name: order.customer?.name,
        phone: order.customer?.phone
      },

      // Vendor info
      vendor: {
        name: order.vendor?.storeName,
        address: order.vendor?.address,
        phone: order.vendor?.phone
      },

      // Delivery address
      deliveryAddress: order.deliveryAddress,

      // Rider info (only if assigned)
      rider: order.rider ? {
        name: order.rider.name,
        phone: order.rider.phone,
        vehicle: order.rider.vehicle,
        currentLocation: order.rider.currentLocation
      } : null,

      // Picker info (only if assigned)
      picker: order.picker ? {
        name: order.picker.name,
        phone: order.picker.phone
      } : null,

      // Time estimates
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      estimatedTimeRemaining: estimatedTime,

      // Order items summary
      items: order.items.map(item => ({
        product: item.product?.name,
        quantity: item.quantity,
        price: item.price
      })),

      // Pricing
      totalAmount: order.totalAmount,

      // Real-time updates
      lastUpdated: order.updatedAt
    };

    res.status(200).json({
      success: true,
      tracking
    });

  } catch (error) {
    console.error('Get order tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order tracking',
      error: error.message
    });
  }
};

/**
 * Update rider location (for real-time tracking)
 * POST /api/tracking/rider/location
 * Protected - Rider only
 */
exports.updateRiderLocation = async (req, res) => {
  try {
    const { orderId, latitude, longitude } = req.body;

    // Validate rider
    if (!req.user || req.user.primaryRole !== 'rider') {
      return res.status(403).json({
        success: false,
        message: 'Only riders can update location'
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify rider is assigned to this order
    if (order.rider?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not assigned to this order'
      });
    }

    // Update rider location in User model
    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: {
        type: 'Point',
        coordinates: [longitude, latitude],
        timestamp: new Date()
      }
    });

    // Emit Socket.IO event for real-time update
    if (global.io) {
      global.io.to(`order-${orderId}`).emit('riderLocationUpdate', {
        orderId,
        riderLocation: {
          latitude,
          longitude,
          timestamp: new Date()
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated'
    });

  } catch (error) {
    console.error('Update rider location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

/**
 * Update order status (triggers real-time notification)
 * POST /api/tracking/status
 * Protected - Vendor, Picker, or Rider
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, notes } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const userRole = req.user.primaryRole;
    const userId = req.user._id.toString();
    const isAuthorized =
      order.vendor?.toString() === userId ||
      order.rider?.toString() === userId ||
      order.picker?.toString() === userId;

    if (!isAuthorized && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update order status
    order.status = status;

    // Add to status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: notes || `Order status updated to ${status}`
    });

    // Update specific timestamps based on status
    switch (status) {
      case 'confirmed':
        order.confirmedAt = new Date();
        break;
      case 'preparing':
        order.preparingAt = new Date();
        break;
      case 'ready_for_pickup':
        order.readyAt = new Date();
        break;
      case 'picked_up':
        order.pickedUpAt = new Date();
        break;
      case 'out_for_delivery':
        order.outForDeliveryAt = new Date();
        break;
      case 'delivered':
        order.deliveredAt = new Date();
        order.completedAt = new Date();
        break;
      case 'cancelled':
        order.cancelledAt = new Date();
        break;
    }

    await order.save();

    // Emit Socket.IO event for real-time update
    if (global.io) {
      global.io.to(`order-${orderId}`).emit('orderStatusUpdate', {
        orderId,
        status,
        timestamp: new Date(),
        notes,
        updatedBy: {
          name: req.user.name,
          role: userRole
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order: {
        id: order._id,
        status: order.status,
        statusHistory: order.statusHistory
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

/**
 * Calculate estimated time remaining for delivery
 * @param {object} order - Order object
 * @returns {number} Minutes remaining
 */
function calculateEstimatedTime(order) {
  if (!order.estimatedDeliveryTime) return null;

  const now = new Date();
  const deliveryTime = new Date(order.estimatedDeliveryTime);
  const diffMs = deliveryTime - now;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  return diffMinutes;
}

module.exports = exports;
