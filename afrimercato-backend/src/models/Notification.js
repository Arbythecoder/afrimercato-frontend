// =================================================================
// NOTIFICATION MODEL
// =================================================================
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'order_placed',
      'order_confirmed',
      'order_processing',
      'order_ready',
      'order_out_for_delivery',
      'order_delivered',
      'order_cancelled',
      'new_order',         // vendor: new order received
      'rider_assigned',    // customer: rider assigned
      'system'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  // Extra data for deep linking (e.g. order number to show in notification)
  meta: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

// Compound index: per-user notifications sorted newest first
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

// Static helper to create a notification
notificationSchema.statics.create = async function(data) {
  try {
    const notif = new this(data);
    await notif.save();
    return notif;
  } catch (err) {
    // Never crash the calling code if notification fails
    console.error('[Notification] Failed to create:', err.message);
    return null;
  }
};

module.exports = mongoose.model('Notification', notificationSchema);
