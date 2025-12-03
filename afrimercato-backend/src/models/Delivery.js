/**
 * Delivery Model with GPS Tracking
 * Tracks real-time location and status of deliveries
 *
 * Features:
 * - Live GPS coordinates
 * - Route tracking
 * - ETA calculations
 * - Status updates
 * - Delivery proof (photos, signatures)
 */

const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  // Order reference
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },

  // Rider assigned to delivery
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true,
    index: true
  },

  // Vendor/Store
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },

  // Customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Delivery status
  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'arrived', 'delivered', 'failed', 'cancelled'],
    default: 'pending',
    required: true,
    index: true
  },

  // Pickup location (vendor store)
  pickup: {
    address: {
      street: String,
      city: String,
      state: String,
      postcode: String,
      country: { type: String, default: 'Ireland' }
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    contactName: String,
    contactPhone: String
  },

  // Dropoff location (customer)
  dropoff: {
    address: {
      street: String,
      city: String,
      state: String,
      postcode: String,
      country: { type: String, default: 'Ireland' }
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    contactName: String,
    contactPhone: String,
    deliveryInstructions: String
  },

  // Real-time GPS tracking
  tracking: {
    // Current location of rider
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      },
      accuracy: Number, // GPS accuracy in meters
      heading: Number, // Direction in degrees (0-360)
      speed: Number, // Speed in km/h
      timestamp: {
        type: Date,
        default: Date.now
      }
    },

    // Route history (breadcrumb trail)
    route: [{
      coordinates: {
        type: [Number] // [longitude, latitude]
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      accuracy: Number
    }],

    // Distance tracking
    distance: {
      total: Number, // Total distance in km
      remaining: Number, // Distance remaining in km
      traveled: Number // Distance already traveled in km
    },

    // ETA (Estimated Time of Arrival)
    eta: {
      minutes: Number, // ETA in minutes
      timestamp: Date, // When ETA was calculated
      arrivalTime: Date // Estimated arrival time
    },

    // Last update
    lastUpdate: {
      type: Date,
      default: Date.now,
      index: true
    }
  },

  // Timeline events
  timeline: [{
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'rejected', 'picked_up', 'in_transit', 'arrived', 'delivered', 'failed', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: [Number] // [longitude, latitude]
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Delivery proof
  proof: {
    // Photo evidence
    photos: [{
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],

    // Signature (if required)
    signature: {
      imageUrl: String, // Base64 or URL to signature image
      signedBy: String, // Name of person who signed
      signedAt: Date
    },

    // Delivery code (verification)
    deliveryCode: {
      code: String, // 4-6 digit code
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date
    },

    // Notes from rider
    notes: String
  },

  // Timing
  times: {
    assigned: Date,
    accepted: Date,
    pickedUp: Date,
    inTransit: Date,
    arrived: Date,
    delivered: Date,
    failed: Date,
    cancelled: Date
  },

  // Duration tracking (in minutes)
  duration: {
    pickup: Number, // Time from assignment to pickup
    delivery: Number, // Time from pickup to delivery
    total: Number // Total delivery time
  },

  // Delivery fee
  fee: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    breakdown: {
      baseFee: Number,
      distanceFee: Number,
      serviceFee: Number,
      tip: Number
    }
  },

  // Issues/problems
  issues: [{
    type: {
      type: String,
      enum: ['customer_unavailable', 'address_incorrect', 'access_denied', 'item_damaged', 'delay', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date,
    resolution: String
  }],

  // Ratings
  rating: {
    // Customer rates rider
    customerRating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      ratedAt: Date
    },

    // Rider rates customer
    riderRating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      ratedAt: Date
    }
  },

  // Metadata
  metadata: {
    priority: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal'
    },
    vehicleType: {
      type: String,
      enum: ['bicycle', 'motorcycle', 'car', 'van']
    },
    weatherConditions: String,
    trafficConditions: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
deliverySchema.index({ order: 1 });
deliverySchema.index({ rider: 1, status: 1 });
deliverySchema.index({ customer: 1, status: 1 });
deliverySchema.index({ status: 1, createdAt: -1 });
deliverySchema.index({ 'tracking.currentLocation': '2dsphere' });
deliverySchema.index({ 'tracking.lastUpdate': 1 });

/**
 * Update current location (called from WebSocket)
 */
deliverySchema.methods.updateLocation = async function(latitude, longitude, accuracy = null, heading = null, speed = null) {
  // Update current location
  this.tracking.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
    accuracy,
    heading,
    speed,
    timestamp: new Date()
  };

  // Add to route history (breadcrumb)
  this.tracking.route.push({
    coordinates: [longitude, latitude],
    timestamp: new Date(),
    accuracy
  });

  // Keep only last 500 points to avoid huge documents
  if (this.tracking.route.length > 500) {
    this.tracking.route = this.tracking.route.slice(-500);
  }

  // Update last update time
  this.tracking.lastUpdate = new Date();

  await this.save();
  return this;
};

/**
 * Calculate distance between two points (Haversine formula)
 */
deliverySchema.methods.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Update ETA based on current location
 */
deliverySchema.methods.updateETA = async function() {
  if (!this.tracking.currentLocation || !this.dropoff.coordinates) {
    return;
  }

  const [currentLon, currentLat] = this.tracking.currentLocation.coordinates;
  const [dropoffLon, dropoffLat] = this.dropoff.coordinates.coordinates;

  // Calculate remaining distance
  const remainingDistance = this.calculateDistance(currentLat, currentLon, dropoffLat, dropoffLon);

  // Average delivery speed in km/h (varies by vehicle type)
  const speeds = {
    bicycle: 15,
    motorcycle: 30,
    car: 25,
    van: 20
  };

  const averageSpeed = speeds[this.metadata.vehicleType] || 20;

  // Calculate ETA in minutes
  const etaMinutes = Math.round((remainingDistance / averageSpeed) * 60);

  // Calculate arrival time
  const arrivalTime = new Date(Date.now() + etaMinutes * 60 * 1000);

  this.tracking.eta = {
    minutes: etaMinutes,
    timestamp: new Date(),
    arrivalTime
  };

  this.tracking.distance.remaining = remainingDistance;

  await this.save();
  return this.tracking.eta;
};

/**
 * Update delivery status with timeline event
 */
deliverySchema.methods.updateStatus = async function(newStatus, location = null, note = null, updatedBy = null) {
  const oldStatus = this.status;
  this.status = newStatus;

  // Update timing
  this.times[this.getTimingKey(newStatus)] = new Date();

  // Add timeline event
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    location: location ? [location.longitude, location.latitude] : null,
    note,
    updatedBy
  });

  // Calculate durations
  if (newStatus === 'picked_up' && this.times.assigned) {
    this.duration.pickup = Math.round((this.times.pickedUp - this.times.assigned) / (1000 * 60));
  }

  if (newStatus === 'delivered' && this.times.pickedUp) {
    this.duration.delivery = Math.round((this.times.delivered - this.times.pickedUp) / (1000 * 60));
    this.duration.total = Math.round((this.times.delivered - this.times.assigned) / (1000 * 60));
  }

  await this.save();
  return this;
};

/**
 * Get timing key from status
 */
deliverySchema.methods.getTimingKey = function(status) {
  const mappings = {
    'assigned': 'assigned',
    'accepted': 'accepted',
    'picked_up': 'pickedUp',
    'in_transit': 'inTransit',
    'arrived': 'arrived',
    'delivered': 'delivered',
    'failed': 'failed',
    'cancelled': 'cancelled'
  };
  return mappings[status] || status;
};

/**
 * Mark as delivered with proof
 */
deliverySchema.methods.markDelivered = async function(proof) {
  this.status = 'delivered';
  this.times.delivered = new Date();
  this.proof = {
    ...this.proof,
    ...proof,
    notes: proof.notes
  };

  // Calculate total duration
  if (this.times.assigned) {
    this.duration.total = Math.round((this.times.delivered - this.times.assigned) / (1000 * 60));
  }

  await this.save();
  return this;
};

/**
 * Find nearby deliveries (for rider)
 */
deliverySchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    status: { $in: ['pending', 'assigned'] },
    'pickup.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  });
};

/**
 * Get active deliveries for rider
 */
deliverySchema.statics.getActiveForRider = function(riderId) {
  return this.find({
    rider: riderId,
    status: { $in: ['assigned', 'accepted', 'picked_up', 'in_transit', 'arrived'] }
  }).populate('order vendor customer');
};

/**
 * Get delivery analytics for rider
 */
deliverySchema.statics.getRiderStats = async function(riderId, startDate, endDate) {
  const deliveries = await this.find({
    rider: riderId,
    status: 'delivered',
    'times.delivered': { $gte: startDate, $lte: endDate }
  });

  const totalDeliveries = deliveries.length;
  const totalEarnings = deliveries.reduce((sum, d) => sum + d.fee.amount, 0);
  const avgDuration = deliveries.reduce((sum, d) => sum + (d.duration.total || 0), 0) / totalDeliveries || 0;
  const totalDistance = deliveries.reduce((sum, d) => sum + (d.tracking.distance.total || 0), 0);

  // Calculate rating
  const ratings = deliveries.filter(d => d.rating.customerRating.score).map(d => d.rating.customerRating.score);
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  return {
    totalDeliveries,
    totalEarnings,
    avgDuration,
    totalDistance,
    avgRating
  };
};

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
