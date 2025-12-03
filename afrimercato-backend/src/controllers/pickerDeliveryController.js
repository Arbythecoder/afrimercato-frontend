/**
 * Picker/Rider Delivery Management Controller
 * Handles active deliveries for riders/pickers
 * - View assigned deliveries
 * - Update delivery status
 * - GPS location updates (via WebSocket)
 * - Proof of delivery
 * - Earnings tracking
 */

const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Rider = require('../models/Rider');
const { emitToUser } = require('../config/socket');

/**
 * Get rider's active deliveries
 * GET /api/picker/deliveries/active
 */
exports.getActiveDeliveries = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user._id });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found'
      });
    }

    const deliveries = await Delivery.find({
      rider: rider._id,
      status: { $in: ['assigned', 'accepted', 'picked_up', 'in_transit'] }
    })
      .populate('order', 'orderNumber items pricing')
      .populate('customer', 'profile')
      .populate('vendor', 'businessName address phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        deliveries,
        total: deliveries.length
      }
    });
  } catch (error) {
    console.error('Get active deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active deliveries',
      error: error.message
    });
  }
};

/**
 * Get all rider's deliveries (history)
 * GET /api/picker/deliveries?page=1&limit=20&status=completed
 */
exports.getAllDeliveries = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const rider = await Rider.findOne({ user: req.user._id });
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found'
      });
    }

    const filter = { rider: rider._id };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const deliveries = await Delivery.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('order', 'orderNumber pricing')
      .populate('customer', 'profile')
      .populate('vendor', 'businessName');

    const total = await Delivery.countDocuments(filter);

    res.json({
      success: true,
      data: {
        deliveries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalDeliveries: total
        }
      }
    });
  } catch (error) {
    console.error('Get all deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries',
      error: error.message
    });
  }
};

/**
 * Get single delivery details
 * GET /api/picker/deliveries/:deliveryId
 */
exports.getDeliveryDetails = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const rider = await Rider.findOne({ user: req.user._id });
    const delivery = await Delivery.findOne({ _id: deliveryId, rider: rider._id })
      .populate('order', 'orderNumber items pricing')
      .populate('customer', 'profile user')
      .populate('vendor', 'businessName address phone')
      .populate({
        path: 'order',
        populate: {
          path: 'items.product',
          select: 'name images unit'
        }
      });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    res.json({
      success: true,
      data: {
        delivery
      }
    });
  } catch (error) {
    console.error('Get delivery details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery details',
      error: error.message
    });
  }
};

/**
 * Accept delivery
 * POST /api/picker/deliveries/:deliveryId/accept
 */
exports.acceptDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const rider = await Rider.findOne({ user: req.user._id });
    const delivery = await Delivery.findOne({ _id: deliveryId, rider: rider._id })
      .populate('order')
      .populate('customer')
      .populate('vendor');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (delivery.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept delivery with status: ${delivery.status}`
      });
    }

    // Update delivery status
    delivery.status = 'accepted';
    delivery.timeline.push({
      status: 'accepted',
      timestamp: new Date(),
      note: 'Delivery accepted by rider',
      actor: req.user._id
    });

    await delivery.save();

    // Update order status
    const order = await Order.findById(delivery.order._id);
    order.status = 'preparing';
    order.timeline.push({
      status: 'preparing',
      timestamp: new Date(),
      note: 'Rider accepted delivery',
      actor: req.user._id
    });

    await order.save();

    // Notify customer
    emitToUser(delivery.customer._id, 'delivery_accepted', {
      deliveryId: delivery._id,
      orderId: order._id,
      message: 'Your rider has accepted the delivery!'
    });

    // Notify vendor
    emitToUser(delivery.vendor._id, 'delivery_accepted', {
      deliveryId: delivery._id,
      orderId: order._id,
      message: 'Rider has accepted the delivery and is on the way'
    });

    res.json({
      success: true,
      message: 'Delivery accepted',
      data: {
        delivery
      }
    });

    console.log(`✅ Delivery ${deliveryId} accepted by rider ${rider._id}`);
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept delivery',
      error: error.message
    });
  }
};

/**
 * Reject delivery
 * POST /api/picker/deliveries/:deliveryId/reject
 */
exports.rejectDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { reason } = req.body;

    const rider = await Rider.findOne({ user: req.user._id });
    const delivery = await Delivery.findOne({ _id: deliveryId, rider: rider._id });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (delivery.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject assigned deliveries'
      });
    }

    // Update delivery
    delivery.status = 'rejected';
    delivery.timeline.push({
      status: 'rejected',
      timestamp: new Date(),
      note: `Rejected by rider: ${reason || 'No reason provided'}`,
      actor: req.user._id
    });

    // Clear rider assignment
    delivery.rider = null;
    await delivery.save();

    // Update rider stats
    rider.stats.activeDeliveries = Math.max(0, rider.stats.activeDeliveries - 1);
    rider.availability.isAvailable = true;
    await rider.save();

    // Update order
    const order = await Order.findById(delivery.order);
    order.delivery.rider = null;
    order.status = 'confirmed'; // Back to confirmed, needs new rider
    order.timeline.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: `Rider rejected delivery: ${reason}`,
      actor: req.user._id
    });

    await order.save();

    // TODO: Trigger auto-assignment to find another rider

    res.json({
      success: true,
      message: 'Delivery rejected',
      data: {
        delivery
      }
    });

    console.log(`❌ Delivery ${deliveryId} rejected by rider ${rider._id}`);
  } catch (error) {
    console.error('Reject delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject delivery',
      error: error.message
    });
  }
};

/**
 * Mark as picked up from vendor
 * POST /api/picker/deliveries/:deliveryId/pickup
 */
exports.markPickedUp = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { latitude, longitude, note, photos } = req.body;

    const rider = await Rider.findOne({ user: req.user._id });
    const delivery = await Delivery.findOne({ _id: deliveryId, rider: rider._id })
      .populate('order')
      .populate('customer')
      .populate('vendor');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (delivery.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Delivery must be accepted first'
      });
    }

    // Update delivery
    delivery.status = 'picked_up';
    delivery.timeline.push({
      status: 'picked_up',
      timestamp: new Date(),
      note: note || 'Order picked up from vendor',
      location: latitude && longitude ? {
        type: 'Point',
        coordinates: [longitude, latitude]
      } : null,
      actor: req.user._id
    });

    if (photos && photos.length > 0) {
      delivery.proof.pickupPhotos = photos;
    }

    await delivery.save();

    // Update order
    const order = await Order.findById(delivery.order._id);
    order.status = 'picked_up';
    order.timeline.push({
      status: 'picked_up',
      timestamp: new Date(),
      note: 'Order picked up by rider',
      actor: req.user._id
    });

    await order.save();

    // Notify customer
    emitToUser(delivery.customer._id, 'order_picked_up', {
      deliveryId: delivery._id,
      orderId: order._id,
      eta: delivery.tracking.eta,
      message: 'Your order has been picked up and is on the way!'
    });

    // Notify vendor
    emitToUser(delivery.vendor._id, 'order_picked_up', {
      deliveryId: delivery._id,
      orderId: order._id,
      message: 'Rider has picked up the order'
    });

    res.json({
      success: true,
      message: 'Order marked as picked up',
      data: {
        delivery
      }
    });

    console.log(`📦 Delivery ${deliveryId} picked up by rider ${rider._id}`);
  } catch (error) {
    console.error('Mark picked up error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as picked up',
      error: error.message
    });
  }
};

/**
 * Mark as in transit to customer
 * POST /api/picker/deliveries/:deliveryId/in-transit
 */
exports.markInTransit = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const rider = await Rider.findOne({ user: req.user._id });
    const delivery = await Delivery.findOne({ _id: deliveryId, rider: rider._id })
      .populate('order')
      .populate('customer');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (delivery.status !== 'picked_up') {
      return res.status(400).json({
        success: false,
        message: 'Order must be picked up first'
      });
    }

    // Update delivery
    delivery.status = 'in_transit';
    delivery.timeline.push({
      status: 'in_transit',
      timestamp: new Date(),
      note: 'On the way to customer',
      actor: req.user._id
    });

    await delivery.save();

    // Update order
    const order = await Order.findById(delivery.order._id);
    order.status = 'in_transit';
    order.timeline.push({
      status: 'in_transit',
      timestamp: new Date(),
      note: 'Order is on the way',
      actor: req.user._id
    });

    await order.save();

    // Notify customer
    emitToUser(delivery.customer._id, 'order_in_transit', {
      deliveryId: delivery._id,
      orderId: order._id,
      eta: delivery.tracking.eta,
      message: 'Your order is on the way!'
    });

    res.json({
      success: true,
      message: 'Order marked as in transit',
      data: {
        delivery
      }
    });

    console.log(`🚚 Delivery ${deliveryId} in transit`);
  } catch (error) {
    console.error('Mark in transit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as in transit',
      error: error.message
    });
  }
};

/**
 * Complete delivery
 * POST /api/picker/deliveries/:deliveryId/complete
 */
exports.completeDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { latitude, longitude, photos, signature, customerName, note } = req.body;

    const rider = await Rider.findOne({ user: req.user._id });
    const delivery = await Delivery.findOne({ _id: deliveryId, rider: rider._id })
      .populate('order')
      .populate('customer')
      .populate('vendor');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (!['picked_up', 'in_transit'].includes(delivery.status)) {
      return res.status(400).json({
        success: false,
        message: 'Delivery must be picked up or in transit'
      });
    }

    // Validate proof of delivery
    if (!photos || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload proof of delivery photos'
      });
    }

    // Update delivery
    delivery.status = 'delivered';
    delivery.completedAt = new Date();
    delivery.proof = {
      photos: photos,
      signature: signature || null,
      recipientName: customerName || 'Customer',
      deliveredAt: new Date(),
      location: latitude && longitude ? {
        type: 'Point',
        coordinates: [longitude, latitude]
      } : null
    };
    delivery.timeline.push({
      status: 'delivered',
      timestamp: new Date(),
      note: note || 'Order delivered successfully',
      location: delivery.proof.location,
      actor: req.user._id
    });

    await delivery.save();

    // Update order
    const order = await Order.findById(delivery.order._id);
    order.status = 'delivered';
    order.delivery.completedAt = new Date();
    order.timeline.push({
      status: 'delivered',
      timestamp: new Date(),
      note: 'Order delivered to customer',
      actor: req.user._id
    });

    await order.save();

    // Update rider stats
    rider.stats.completedDeliveries += 1;
    rider.stats.activeDeliveries = Math.max(0, rider.stats.activeDeliveries - 1);
    rider.stats.totalEarnings += delivery.pricing.riderEarnings;
    rider.availability.isAvailable = true; // Available for new deliveries
    await rider.save();

    // Notify customer
    emitToUser(delivery.customer._id, 'order_delivered', {
      deliveryId: delivery._id,
      orderId: order._id,
      message: 'Your order has been delivered! Enjoy!'
    });

    // Notify vendor
    emitToUser(delivery.vendor._id, 'order_delivered', {
      deliveryId: delivery._id,
      orderId: order._id,
      message: 'Order delivered successfully'
    });

    res.json({
      success: true,
      message: 'Delivery completed successfully',
      data: {
        delivery,
        earnings: delivery.pricing.riderEarnings,
        totalCompletedToday: rider.stats.completedDeliveries
      }
    });

    console.log(`✅ Delivery ${deliveryId} completed by rider ${rider._id}`);
  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete delivery',
      error: error.message
    });
  }
};

/**
 * Report delivery issue
 * POST /api/picker/deliveries/:deliveryId/report-issue
 */
exports.reportIssue = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { issueType, description, photos, latitude, longitude } = req.body;

    const rider = await Rider.findOne({ user: req.user._id });
    const delivery = await Delivery.findOne({ _id: deliveryId, rider: rider._id });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Add issue to delivery
    const issue = {
      type: issueType,
      description,
      reportedBy: 'rider',
      reportedAt: new Date(),
      photos: photos || [],
      location: latitude && longitude ? {
        type: 'Point',
        coordinates: [longitude, latitude]
      } : null,
      status: 'open'
    };

    delivery.timeline.push({
      status: 'issue_reported',
      timestamp: new Date(),
      note: `Issue reported: ${issueType} - ${description}`,
      location: issue.location,
      actor: req.user._id
    });

    // TODO: Create support ticket

    await delivery.save();

    res.json({
      success: true,
      message: 'Issue reported successfully',
      data: {
        issue,
        supportMessage: 'Our support team will contact you shortly'
      }
    });

    console.log(`⚠️ Issue reported for delivery ${deliveryId}: ${issueType}`);
  } catch (error) {
    console.error('Report issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report issue',
      error: error.message
    });
  }
};

/**
 * Get rider earnings summary
 * GET /api/picker/earnings?period=today|week|month
 */
exports.getEarnings = async (req, res) => {
  try {
    const { period = 'today' } = req.query;

    const rider = await Rider.findOne({ user: req.user._id });
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    // Get completed deliveries in period
    const deliveries = await Delivery.find({
      rider: rider._id,
      status: 'delivered',
      completedAt: { $gte: startDate }
    }).select('pricing completedAt');

    const totalEarnings = deliveries.reduce((sum, d) => sum + d.pricing.riderEarnings, 0);
    const totalDeliveries = deliveries.length;
    const avgEarningsPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

    res.json({
      success: true,
      data: {
        period,
        earnings: {
          total: parseFloat(totalEarnings.toFixed(2)),
          average: parseFloat(avgEarningsPerDelivery.toFixed(2)),
          deliveries: totalDeliveries
        },
        lifetime: {
          total: rider.stats.totalEarnings,
          deliveries: rider.stats.completedDeliveries
        }
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error.message
    });
  }
};

/**
 * Get rider statistics
 * GET /api/picker/stats
 */
exports.getRiderStats = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user._id })
      .populate('user', 'name email');

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found'
      });
    }

    // Get today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDeliveries = await Delivery.countDocuments({
      rider: rider._id,
      status: 'delivered',
      completedAt: { $gte: today }
    });

    res.json({
      success: true,
      data: {
        rider: {
          name: rider.user.name,
          rating: rider.stats.rating,
          isAvailable: rider.availability.isAvailable
        },
        stats: {
          ...rider.stats.toObject(),
          todayDeliveries
        },
        availability: rider.availability
      }
    });
  } catch (error) {
    console.error('Get rider stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rider stats',
      error: error.message
    });
  }
};

module.exports = exports;
