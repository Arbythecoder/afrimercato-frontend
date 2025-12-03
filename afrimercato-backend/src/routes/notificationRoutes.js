const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// @route   GET /api/notifications
// @desc    Get all notifications for current user
// @access  Private
router.get('/', getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', getUnreadCount);

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', markAllAsRead);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', validateMongoId('id'), markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', validateMongoId('id'), deleteNotification);

// @route   DELETE /api/notifications
// @desc    Delete all read notifications
// @access  Private
router.delete('/', deleteAllRead);

module.exports = router;
