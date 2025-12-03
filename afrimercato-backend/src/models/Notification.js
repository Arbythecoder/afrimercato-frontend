const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    recipientRole: {
      type: String,
      enum: ['vendor', 'customer', 'rider', 'picker', 'admin'],
      required: true
    },

    type: {
      type: String,
      enum: [
        'order_placed',
        'order_confirmed',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'payment_received',
        'low_stock',
        'product_review',
        'rider_assigned',
        'system_alert',
        'promotion'
      ],
      required: true
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

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Link to related entity
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },

    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },

    relatedVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    readAt: {
      type: Date
    },

    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },

    actionUrl: {
      type: String
    },

    icon: {
      type: String,
      default: '🔔'
    },

    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  return await this.create(data);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);
