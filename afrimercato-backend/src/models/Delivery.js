// =================================================================
// DELIVERY MODEL - MongoDB Schema for Delivery Tracking
// =================================================================

const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  },

  // Real-time location tracking
  currentLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date
  },

  // Location history for tracking
  locationHistory: [{
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: { type: Date, default: Date.now }
  }],

  // Delivery addresses
  pickupAddress: {
    address: String,
    postcode: String,
    latitude: Number,
    longitude: Number
  },

  dropoffAddress: {
    address: String,
    postcode: String,
    latitude: Number,
    longitude: Number
  },

  // Estimated and actual times
  estimatedPickupTime: Date,
  estimatedDeliveryTime: Date,
  actualPickupTime: Date,
  actualDeliveryTime: Date,

  // Distance and duration
  distance: Number, // in kilometers
  duration: Number, // in minutes

  // Delivery fee and earnings
  deliveryFee: { type: Number, default: 0 },
  riderEarnings: { type: Number, default: 0 },

  // Notes and instructions
  deliveryInstructions: String,
  deliveryNotes: String,

  // Proof of delivery
  proofOfDelivery: {
    signature: String,
    photo: String,
    notes: String,
    timestamp: Date
  },

  // Ratings
  riderRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    ratedAt: Date
  },

  vendorRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    ratedAt: Date
  },

  // Cancellation
  cancellationReason: String,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: Date,

  // Failure reason
  failureReason: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
deliverySchema.index({ rider: 1, status: 1 });
deliverySchema.index({ order: 1 });
deliverySchema.index({ vendor: 1, createdAt: -1 });
deliverySchema.index({ customer: 1, createdAt: -1 });

// Update the updatedAt timestamp before saving
deliverySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Delivery', deliverySchema);
