const { asyncHandler } = require('../middleware/errorHandler');
const Notification = require('../models/Notification');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;

  const filter = { recipient: req.user.id };

  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .populate('relatedOrder', 'orderNumber status')
    .populate('relatedProduct', 'name')
    .populate('relatedVendor', 'storeName')
    .lean();

  // Add timeAgo manually since virtuals don't work with .lean()
  const notificationsWithTime = notifications.map(notification => {
    const now = new Date();
    const diff = now - new Date(notification.createdAt);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    let timeAgo = 'Just now';
    if (minutes >= 1 && minutes < 60) timeAgo = `${minutes}m ago`;
    else if (hours >= 1 && hours < 24) timeAgo = `${hours}h ago`;
    else if (days >= 1 && days < 7) timeAgo = `${days}d ago`;
    else if (days >= 7) timeAgo = new Date(notification.createdAt).toLocaleDateString();

    return {
      ...notification,
      timeAgo
    };
  });

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.getUnreadCount(req.user.id);

  res.json({
    success: true,
    data: {
      notifications: notificationsWithTime,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    }
  });
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user.id);

  res.json({
    success: true,
    data: { count }
  });
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.markAsRead();

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification }
  });
});

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.markAllAsRead(req.user.id);

  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification deleted'
  });
});

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all read notifications
 * @access  Private
 */
exports.deleteAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    recipient: req.user.id,
    isRead: true
  });

  res.json({
    success: true,
    message: 'All read notifications deleted',
    data: {
      deletedCount: result.deletedCount
    }
  });
});

/**
 * Helper function to create notification (used internally by other controllers)
 */
exports.createNotification = async ({
  recipient,
  recipientRole,
  type,
  title,
  message,
  data = {},
  relatedOrder = null,
  relatedProduct = null,
  relatedVendor = null,
  priority = 'normal',
  actionUrl = null,
  icon = '🔔'
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      recipientRole,
      type,
      title,
      message,
      data,
      relatedOrder,
      relatedProduct,
      relatedVendor,
      priority,
      actionUrl,
      icon
    });

    // Emit socket event if socket.io is available
    if (global.io) {
      global.io.to(`user:${recipient}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
