// =================================================================
// PICKING SESSION MODEL - MongoDB Schema for Order Fulfillment
// =================================================================

const mongoose = require('mongoose');

const pickingSessionSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  picker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },

  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'paused', 'completed', 'cancelled'],
    default: 'assigned'
  },

  // Item picking details
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantityOrdered: { type: Number, required: true },
    quantityPicked: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'picked', 'replaced', 'unavailable'],
      default: 'pending'
    },

    // Replacement item if original unavailable
    replacementProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    replacementReason: String,

    // Unavailability reason
    unavailableReason: String,

    // Notes from picker
    notes: String,

    // Timestamps for each item
    pickedAt: Date
  }],

  // Session times
  startedAt: Date,
  pausedAt: Date,
  resumedAt: Date,
  completedAt: Date,

  // Total time spent (in minutes)
  totalDuration: { type: Number, default: 0 },

  // Packing information
  packingCompleted: { type: Boolean, default: false },
  packingCompletedAt: Date,
  numberOfBags: { type: Number, default: 1 },

  // Quality control
  qualityCheck: {
    passed: Boolean,
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkedAt: Date,
    notes: String
  },

  // Picker earnings for this session
  earnings: { type: Number, default: 0 },

  // Performance metrics
  accuracy: { type: Number, default: 100 }, // percentage
  itemsPerMinute: Number,

  // General notes
  notes: String,

  // Cancellation
  cancellationReason: String,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: Date,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
pickingSessionSchema.index({ picker: 1, status: 1 });
pickingSessionSchema.index({ order: 1 });
pickingSessionSchema.index({ vendor: 1, createdAt: -1 });

// Update the updatedAt timestamp before saving
pickingSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total duration when completing
pickingSessionSchema.methods.calculateDuration = function() {
  if (this.startedAt && this.completedAt) {
    this.totalDuration = Math.round((this.completedAt - this.startedAt) / (1000 * 60));
  }
  return this.totalDuration;
};

// Calculate accuracy based on items picked vs ordered
pickingSessionSchema.methods.calculateAccuracy = function() {
  const totalItems = this.items.length;
  if (totalItems === 0) return 100;

  const correctItems = this.items.filter(item =>
    item.status === 'picked' && item.quantityPicked === item.quantityOrdered
  ).length;

  this.accuracy = Math.round((correctItems / totalItems) * 100);
  return this.accuracy;
};

module.exports = mongoose.model('PickingSession', pickingSessionSchema);
