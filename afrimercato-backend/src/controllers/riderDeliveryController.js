// =================================================================
// RIDER DELIVERY CONTROLLER - Delivery Operations
// =================================================================

const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const User = require('../models/User');

// Get available deliveries
exports.getAvailableDeliveries = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    const query = {
      status: 'pending',
      rider: { $exists: false }
    };

    // If location provided, find nearby deliveries
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const radiusKm = parseFloat(radius);

      // Simple distance filtering (in production, use geospatial queries)
      const allDeliveries = await Delivery.find(query)
        .populate('vendor', 'storeName location')
        .populate('order', 'orderNumber totalAmount items')
        .sort({ createdAt: -1 })
        .limit(50);

      const nearbyDeliveries = allDeliveries.filter(d => {
        if (!d.pickupAddress || !d.pickupAddress.latitude || !d.pickupAddress.longitude) {
          return false;
        }

        const distance = calculateDistance(
          lat,
          lon,
          d.pickupAddress.latitude,
          d.pickupAddress.longitude
        );

        return distance <= radiusKm;
      });

      return res.json({
        success: true,
        data: {
          deliveries: nearbyDeliveries.map(formatDelivery),
          total: nearbyDeliveries.length
        }
      });
    }

    // Without location, return all available
    const deliveries = await Delivery.find(query)
      .populate('vendor', 'storeName location')
      .populate('order', 'orderNumber totalAmount items')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        deliveries: deliveries.map(formatDelivery),
        total: deliveries.length
      }
    });
  } catch (error) {
    console.error('Get available deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available deliveries'
    });
  }
};

// Get active deliveries for rider
exports.getActiveDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      rider: req.user.id,
      status: { $in: ['assigned', 'accepted', 'picked_up', 'in_transit'] }
    })
      .populate('vendor', 'storeName location')
      .populate('order', 'orderNumber totalAmount items')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        deliveries: deliveries.map(formatDelivery),
        total: deliveries.length
      }
    });
  } catch (error) {
    console.error('Get active deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching active deliveries'
    });
  }
};

// Accept delivery
exports.acceptDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId)
      .populate('order')
      .populate('vendor', 'storeName');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (delivery.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Delivery is no longer available'
      });
    }

    // Assign rider and update status
    delivery.rider = req.user.id;
    delivery.status = 'accepted';
    await delivery.save();

    // Update order status
    if (delivery.order) {
      delivery.order.status = 'rider_accepted';
      delivery.order.rider = req.user.id;
      delivery.order.timestamps.riderAccepted = new Date();
      await delivery.order.save();
    }

    res.json({
      success: true,
      message: 'Delivery accepted successfully',
      data: formatDelivery(delivery)
    });
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error accepting delivery'
    });
  }
};

// Reject delivery
exports.rejectDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { reason } = req.body;

    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (delivery.rider && delivery.rider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this delivery'
      });
    }

    // Log rejection reason (for analytics)
    if (!delivery.rejectionHistory) {
      delivery.rejectionHistory = [];
    }

    delivery.rejectionHistory.push({
      rider: req.user.id,
      reason,
      rejectedAt: new Date()
    });

    // Reset to pending if was assigned to this rider
    if (delivery.rider && delivery.rider.toString() === req.user.id) {
      delivery.rider = null;
      delivery.status = 'pending';
    }

    await delivery.save();

    res.json({
      success: true,
      message: 'Delivery rejected'
    });
  } catch (error) {
    console.error('Reject delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting delivery'
    });
  }
};

// Start delivery (picked up from vendor)
exports.startDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { notes } = req.body;

    const delivery = await Delivery.findById(deliveryId).populate('order');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (delivery.rider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this delivery'
      });
    }

    if (delivery.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Delivery cannot be started from current status'
      });
    }

    delivery.status = 'picked_up';
    delivery.actualPickupTime = new Date();
    if (notes) delivery.deliveryNotes = notes;

    await delivery.save();

    // Update order status
    if (delivery.order) {
      delivery.order.status = 'picked_up_by_rider';
      delivery.order.timestamps.pickedUpByRider = new Date();
      await delivery.order.save();
    }

    res.json({
      success: true,
      message: 'Delivery started successfully',
      data: formatDelivery(delivery)
    });
  } catch (error) {
    console.error('Start delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting delivery'
    });
  }
};

// Complete delivery
exports.completeDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { signature, photo, notes } = req.body;

    const delivery = await Delivery.findById(deliveryId).populate('order');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (delivery.rider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this delivery'
      });
    }

    if (!['picked_up', 'in_transit'].includes(delivery.status)) {
      return res.status(400).json({
        success: false,
        message: 'Delivery cannot be completed from current status'
      });
    }

    delivery.status = 'delivered';
    delivery.actualDeliveryTime = new Date();
    delivery.proofOfDelivery = {
      signature,
      photo,
      notes,
      timestamp: new Date()
    };

    // Calculate duration
    if (delivery.actualPickupTime) {
      delivery.duration = Math.round(
        (delivery.actualDeliveryTime - delivery.actualPickupTime) / (1000 * 60)
      );
    }

    await delivery.save();

    // Update order status
    if (delivery.order) {
      delivery.order.status = 'delivered';
      delivery.order.timestamps.delivered = new Date();
      await delivery.order.save();
    }

    res.json({
      success: true,
      message: 'Delivery completed successfully',
      data: formatDelivery(delivery)
    });
  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing delivery'
    });
  }
};

// Update location
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy, deliveryId } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude required'
      });
    }

    const location = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : null,
      timestamp: new Date()
    };

    // If deliveryId provided, update specific delivery
    if (deliveryId) {
      const delivery = await Delivery.findById(deliveryId);

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found'
        });
      }

      if (delivery.rider.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized for this delivery'
        });
      }

      delivery.currentLocation = location;

      if (!delivery.locationHistory) {
        delivery.locationHistory = [];
      }
      delivery.locationHistory.push(location);

      // Update status to in_transit if picked up
      if (delivery.status === 'picked_up') {
        delivery.status = 'in_transit';
      }

      await delivery.save();

      return res.json({
        success: true,
        message: 'Location updated for delivery',
        data: {
          deliveryId: delivery._id,
          location
        }
      });
    }

    // Otherwise, update rider's general location
    res.json({
      success: true,
      message: 'Location updated',
      data: { location }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating location'
    });
  }
};

// Get delivery tracking
exports.getDeliveryTracking = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId)
      .populate('vendor', 'storeName location')
      .populate('customer', 'name phone')
      .populate('rider', 'name phone')
      .populate('order', 'orderNumber items');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Only rider, customer, or vendor can track
    const isAuthorized =
      delivery.rider && delivery.rider._id.toString() === req.user.id ||
      delivery.customer && delivery.customer._id.toString() === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to track this delivery'
      });
    }

    res.json({
      success: true,
      data: {
        delivery: formatDelivery(delivery),
        tracking: {
          currentLocation: delivery.currentLocation,
          locationHistory: delivery.locationHistory || [],
          estimatedDeliveryTime: delivery.estimatedDeliveryTime,
          actualPickupTime: delivery.actualPickupTime,
          status: delivery.status
        }
      }
    });
  } catch (error) {
    console.error('Get delivery tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching delivery tracking'
    });
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Helper function to format delivery for response
function formatDelivery(delivery) {
  return {
    id: delivery._id,
    orderNumber: delivery.order ? delivery.order.orderNumber : null,
    status: delivery.status,
    vendor: delivery.vendor ? {
      id: delivery.vendor._id,
      name: delivery.vendor.storeName,
      location: delivery.vendor.location
    } : null,
    customer: delivery.customer ? {
      id: delivery.customer._id,
      name: delivery.customer.name,
      phone: delivery.customer.phone
    } : null,
    pickupAddress: delivery.pickupAddress,
    dropoffAddress: delivery.dropoffAddress,
    deliveryFee: delivery.deliveryFee,
    riderEarnings: delivery.riderEarnings,
    distance: delivery.distance,
    duration: delivery.duration,
    estimatedPickupTime: delivery.estimatedPickupTime,
    estimatedDeliveryTime: delivery.estimatedDeliveryTime,
    actualPickupTime: delivery.actualPickupTime,
    actualDeliveryTime: delivery.actualDeliveryTime,
    currentLocation: delivery.currentLocation,
    deliveryInstructions: delivery.deliveryInstructions,
    createdAt: delivery.createdAt
  };
}
