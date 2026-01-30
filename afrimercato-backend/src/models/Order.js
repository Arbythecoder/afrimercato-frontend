// =================================================================
// ORDER MODEL - MongoDB Schema for Orders
// =================================================================

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,

  // Extended status with backward compatibility
  status: {
    type: String,
    enum: [
      // Legacy statuses (keep for backward compatibility)
      'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled',
      // New statuses for picker/rider workflow
      'assigned_to_picker', 'picking', 'packed', 'ready_for_delivery',
      'assigned_to_rider', 'rider_accepted', 'picked_up_by_rider', 'failed'
    ],
    default: 'pending'
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },

  deliveryAddress: String,
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  picker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryDate: Date,

  // Delivery fee
  deliveryFee: { type: Number, default: 0 },

  // Timestamps for tracking workflow
  timestamps: {
    orderPlaced: { type: Date, default: Date.now },
    confirmed: Date,
    assignedToPicker: Date,
    pickingStarted: Date,
    packed: Date,
    assignedToRider: Date,
    riderAccepted: Date,
    pickedUpByRider: Date,
    delivered: Date,
    cancelled: Date
  },

  // Cancellation info
  cancellationReason: String,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Refund info
  refundAmount: Number,
  refundReason: String,
  refundedAt: Date,

  // Repeat purchase subscription data
  repeatPurchase: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly'],
      default: null
    },
    nextRepeatDate: Date,
    active: { type: Boolean, default: true }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ vendor: 1, createdAt: -1 });
orderSchema.index({ rider: 1, status: 1 });
orderSchema.index({ picker: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Update the updatedAt timestamp before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
