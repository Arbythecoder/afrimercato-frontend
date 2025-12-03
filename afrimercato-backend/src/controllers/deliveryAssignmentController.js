/**
 * Delivery Assignment Controller
 * Auto-assigns riders/pickers to deliveries based on:
 * - Proximity to vendor
 * - Rider availability
 * - Vehicle type
 * - Rider ratings
 * - Connected stores
 */

const Order = require('../models/Order');
const Delivery = require('../models/Delivery');
const Rider = require('../models/Rider');
const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');
const { emitToUser, emitToRole } = require('../config/socket');

/**
 * Auto-assign rider to delivery
 * POST /api/delivery-assignment/auto-assign/:orderId
 */
exports.autoAssignRider = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { vehicleType } = req.body;

    // Get order details
    const order = await Order.findById(orderId)
      .populate('vendor', 'businessName address coordinates')
      .populate('customer');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be confirmed before assigning rider'
      });
    }

    // Check if already assigned
    if (order.delivery.rider) {
      return res.status(400).json({
        success: false,
        message: 'Order already has an assigned rider'
      });
    }

    // Get vendor coordinates
    const vendorCoords = order.vendor.address?.coordinates?.coordinates;
    if (!vendorCoords) {
      return res.status(400).json({
        success: false,
        message: 'Vendor address coordinates not found'
      });
    }

    const [vendorLon, vendorLat] = vendorCoords;

    // Find available riders
    const riderFilter = {
      isActive: true,
      'availability.isAvailable': true,
      'verification.status': 'verified'
    };

    if (vehicleType) {
      riderFilter['vehicle.type'] = vehicleType;
    }

    const availableRiders = await Rider.find(riderFilter)
      .populate('user', 'name');

    if (availableRiders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available riders found',
        suggestion: 'Try again in a few minutes or contact support'
      });
    }

    // Calculate distance and score for each rider
    const scoredRiders = availableRiders.map(rider => {
      const riderLat = rider.currentLocation?.coordinates?.coordinates[1];
      const riderLon = rider.currentLocation?.coordinates?.coordinates[0];

      let distance = 999; // Default high value if no location
      if (riderLat && riderLon) {
        distance = calculateDistance(vendorLat, vendorLon, riderLat, riderLon);
      }

      // Scoring algorithm
      let score = 100;
      score -= distance * 2; // Closer is better (-2 points per km)
      score += rider.stats.rating * 10; // Higher rating is better (+10 points per star)
      score -= rider.stats.activeDeliveries * 5; // Fewer active deliveries is better
      score += rider.stats.completedDeliveries * 0.1; // Experience bonus

      // Check if rider is connected to this vendor's store
      const isConnected = rider.connectedStores.some(
        store => store.vendorId.toString() === order.vendor._id.toString()
      );
      if (isConnected) {
        score += 20; // Bonus for connected stores
      }

      return {
        rider,
        distance,
        score,
        isConnected
      };
    });

    // Sort by score (highest first)
    scoredRiders.sort((a, b) => b.score - a.score);

    // Select top 3 riders
    const topRiders = scoredRiders.slice(0, 3);

    // Try to assign to best rider
    let assignedRider = null;
    let deliveryDoc = null;

    for (const { rider, distance, isConnected } of topRiders) {
      // Create delivery document
      const delivery = new Delivery({
        order: order._id,
        customer: order.customer._id,
        vendor: order.vendor._id,
        rider: rider._id,
        pickup: {
          address: {
            street: order.vendor.address.street,
            city: order.vendor.address.city,
            postcode: order.vendor.address.postcode,
            country: order.vendor.address.country
          },
          coordinates: order.vendor.address.coordinates,
          contactName: order.vendor.businessName,
          contactPhone: order.vendor.phone
        },
        dropoff: {
          address: {
            street: order.deliveryAddress.street,
            apartment: order.deliveryAddress.apartment,
            city: order.deliveryAddress.city,
            postcode: order.deliveryAddress.postcode,
            country: order.deliveryAddress.country
          },
          coordinates: order.deliveryAddress.coordinates,
          contactName: order.customer.profile?.firstName || 'Customer',
          contactPhone: order.customer.profile?.phone,
          instructions: order.deliveryAddress.deliveryInstructions
        },
        pricing: {
          baseFee: order.pricing.deliveryFee,
          riderEarnings: order.pricing.deliveryFee * 0.8, // 80% to rider
          platformFee: order.pricing.deliveryFee * 0.2 // 20% platform fee
        },
        metadata: {
          vehicleType: rider.vehicle.type,
          estimatedDistance: distance,
          assignmentMethod: 'auto',
          assignmentScore: topRiders[0].score
        },
        status: 'assigned',
        timeline: [{
          status: 'assigned',
          timestamp: new Date(),
          note: `Auto-assigned to ${rider.user.name} (${distance.toFixed(1)}km away)`,
          location: rider.currentLocation?.coordinates
        }]
      });

      await delivery.save();

      // Update order with delivery info
      order.delivery.rider = rider._id;
      order.delivery.assignedAt = new Date();
      order.delivery.estimatedPickupTime = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      order.delivery.estimatedDeliveryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      order.status = 'preparing';
      order.timeline.push({
        status: 'preparing',
        timestamp: new Date(),
        note: `Rider assigned: ${rider.user.name}`,
        actor: rider._id
      });

      await order.save();

      // Update rider stats
      rider.stats.activeDeliveries += 1;
      rider.availability.isAvailable = false; // Mark as busy
      await rider.save();

      assignedRider = rider;
      deliveryDoc = delivery;

      // Send notification to rider via WebSocket
      emitToUser(rider.user._id, 'new_delivery_assignment', {
        deliveryId: delivery._id,
        orderId: order._id,
        pickup: delivery.pickup,
        dropoff: delivery.dropoff,
        earnings: delivery.pricing.riderEarnings,
        distance: distance,
        message: `New delivery assigned! Pick up from ${order.vendor.businessName}`
      });

      // Send notification to customer
      emitToUser(order.customer._id, 'rider_assigned', {
        orderId: order._id,
        riderName: rider.user.name,
        estimatedDeliveryTime: order.delivery.estimatedDeliveryTime,
        message: `Your rider ${rider.user.name} is on the way!`
      });

      // Send notification to vendor
      emitToUser(order.vendor._id, 'rider_assigned', {
        orderId: order._id,
        riderName: rider.user.name,
        estimatedPickupTime: order.delivery.estimatedPickupTime,
        message: `Rider ${rider.user.name} will pick up the order soon`
      });

      break; // Successfully assigned, exit loop
    }

    if (!assignedRider) {
      return res.status(500).json({
        success: false,
        message: 'Failed to assign rider'
      });
    }

    res.json({
      success: true,
      message: 'Rider assigned successfully',
      data: {
        rider: {
          id: assignedRider._id,
          name: assignedRider.user.name,
          rating: assignedRider.stats.rating,
          vehicleType: assignedRider.vehicle.type,
          distance: topRiders[0].distance.toFixed(1)
        },
        delivery: {
          id: deliveryDoc._id,
          estimatedPickupTime: order.delivery.estimatedPickupTime,
          estimatedDeliveryTime: order.delivery.estimatedDeliveryTime,
          riderEarnings: deliveryDoc.pricing.riderEarnings
        },
        alternativeRiders: topRiders.slice(1, 3).map(r => ({
          id: r.rider._id,
          name: r.rider.user.name,
          distance: r.distance.toFixed(1),
          score: r.score.toFixed(1)
        }))
      }
    });

    console.log(`🏍️ Rider ${assignedRider.user.name} assigned to order ${order.orderNumber}`);
  } catch (error) {
    console.error('Auto-assign rider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign rider',
      error: error.message
    });
  }
};

/**
 * Manually assign rider to delivery
 * POST /api/delivery-assignment/manual-assign/:orderId
 */
exports.manualAssignRider = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('vendor', 'businessName address')
      .populate('customer');

    const rider = await Rider.findById(riderId)
      .populate('user', 'name');

    if (!order || !rider) {
      return res.status(404).json({
        success: false,
        message: 'Order or rider not found'
      });
    }

    if (order.delivery.rider) {
      return res.status(400).json({
        success: false,
        message: 'Order already has an assigned rider'
      });
    }

    if (!rider.isActive || !rider.availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Rider is not available'
      });
    }

    // Create delivery document
    const delivery = new Delivery({
      order: order._id,
      customer: order.customer._id,
      vendor: order.vendor._id,
      rider: rider._id,
      pickup: {
        address: {
          street: order.vendor.address.street,
          city: order.vendor.address.city,
          postcode: order.vendor.address.postcode
        },
        coordinates: order.vendor.address.coordinates
      },
      dropoff: {
        address: {
          street: order.deliveryAddress.street,
          city: order.deliveryAddress.city,
          postcode: order.deliveryAddress.postcode
        },
        coordinates: order.deliveryAddress.coordinates
      },
      pricing: {
        baseFee: order.pricing.deliveryFee,
        riderEarnings: order.pricing.deliveryFee * 0.8,
        platformFee: order.pricing.deliveryFee * 0.2
      },
      metadata: {
        vehicleType: rider.vehicle.type,
        assignmentMethod: 'manual'
      },
      status: 'assigned',
      timeline: [{
        status: 'assigned',
        timestamp: new Date(),
        note: `Manually assigned to ${rider.user.name}`,
        actor: req.user._id
      }]
    });

    await delivery.save();

    // Update order
    order.delivery.rider = rider._id;
    order.delivery.assignedAt = new Date();
    order.status = 'preparing';
    order.timeline.push({
      status: 'preparing',
      timestamp: new Date(),
      note: `Manually assigned to rider: ${rider.user.name}`,
      actor: req.user._id
    });

    await order.save();

    // Update rider
    rider.stats.activeDeliveries += 1;
    rider.availability.isAvailable = false;
    await rider.save();

    // Send notifications
    emitToUser(rider.user._id, 'new_delivery_assignment', {
      deliveryId: delivery._id,
      orderId: order._id,
      message: `New delivery assigned by vendor!`
    });

    res.json({
      success: true,
      message: 'Rider assigned successfully',
      data: {
        delivery,
        rider: {
          id: rider._id,
          name: rider.user.name
        }
      }
    });

    console.log(`🏍️ Rider ${rider.user.name} manually assigned to order ${order.orderNumber}`);
  } catch (error) {
    console.error('Manual assign rider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign rider',
      error: error.message
    });
  }
};

/**
 * Get available riders near vendor
 * GET /api/delivery-assignment/available-riders/:vendorId
 */
exports.getAvailableRiders = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { vehicleType, radius = 10 } = req.query;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const vendorCoords = vendor.address?.coordinates?.coordinates;
    if (!vendorCoords) {
      return res.status(400).json({
        success: false,
        message: 'Vendor coordinates not available'
      });
    }

    const [vendorLon, vendorLat] = vendorCoords;

    // Find available riders
    const filter = {
      isActive: true,
      'availability.isAvailable': true,
      'verification.status': 'verified'
    };

    if (vehicleType) {
      filter['vehicle.type'] = vehicleType;
    }

    const riders = await Rider.find(filter)
      .populate('user', 'name email phone');

    // Calculate distance and filter by radius
    const nearbyRiders = riders
      .map(rider => {
        const riderLat = rider.currentLocation?.coordinates?.coordinates[1];
        const riderLon = rider.currentLocation?.coordinates?.coordinates[0];

        if (!riderLat || !riderLon) return null;

        const distance = calculateDistance(vendorLat, vendorLon, riderLat, riderLon);

        if (distance > radius) return null;

        return {
          rider: {
            id: rider._id,
            name: rider.user.name,
            phone: rider.user.phone,
            rating: rider.stats.rating,
            completedDeliveries: rider.stats.completedDeliveries,
            vehicleType: rider.vehicle.type,
            vehicleModel: `${rider.vehicle.make} ${rider.vehicle.model}`,
            isConnected: rider.connectedStores.some(
              store => store.vendorId.toString() === vendorId
            )
          },
          distance: parseFloat(distance.toFixed(1)),
          estimatedArrival: Math.round(distance / 20 * 60) // minutes (assume 20 km/h avg)
        };
      })
      .filter(r => r !== null)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: {
        riders: nearbyRiders,
        total: nearbyRiders.length,
        searchRadius: radius
      }
    });
  } catch (error) {
    console.error('Get available riders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available riders',
      error: error.message
    });
  }
};

/**
 * Reassign delivery to different rider
 * POST /api/delivery-assignment/reassign/:deliveryId
 */
exports.reassignDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { newRiderId, reason } = req.body;

    const delivery = await Delivery.findById(deliveryId)
      .populate('rider', 'user stats')
      .populate('order');

    const newRider = await Rider.findById(newRiderId)
      .populate('user', 'name');

    if (!delivery || !newRider) {
      return res.status(404).json({
        success: false,
        message: 'Delivery or new rider not found'
      });
    }

    if (delivery.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: `Cannot reassign delivery with status: ${delivery.status}`
      });
    }

    const oldRider = delivery.rider;

    // Update delivery
    delivery.rider = newRider._id;
    delivery.timeline.push({
      status: 'reassigned',
      timestamp: new Date(),
      note: `Reassigned from ${oldRider.user.name} to ${newRider.user.name}. Reason: ${reason}`,
      actor: req.user._id
    });

    await delivery.save();

    // Update old rider
    await Rider.findByIdAndUpdate(oldRider._id, {
      $inc: { 'stats.activeDeliveries': -1 },
      'availability.isAvailable': true
    });

    // Update new rider
    newRider.stats.activeDeliveries += 1;
    newRider.availability.isAvailable = false;
    await newRider.save();

    // Send notifications
    emitToUser(oldRider.user._id, 'delivery_reassigned', {
      deliveryId: delivery._id,
      message: `Delivery has been reassigned to another rider`
    });

    emitToUser(newRider.user._id, 'new_delivery_assignment', {
      deliveryId: delivery._id,
      message: `New delivery assigned (reassigned from another rider)`
    });

    res.json({
      success: true,
      message: 'Delivery reassigned successfully',
      data: {
        delivery,
        newRider: {
          id: newRider._id,
          name: newRider.user.name
        }
      }
    });

    console.log(`🔄 Delivery ${deliveryId} reassigned to ${newRider.user.name}`);
  } catch (error) {
    console.error('Reassign delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reassign delivery',
      error: error.message
    });
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = exports;
