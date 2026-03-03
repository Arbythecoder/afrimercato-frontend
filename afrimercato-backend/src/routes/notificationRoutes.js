// =================================================================
// NOTIFICATION ROUTES — real Notification model
// =================================================================
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

router.use(protect);

// GET /api/notifications — last 20 for the logged-in user
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const total = await Notification.countDocuments({ userId: req.user.id });

    res.json({ success: true, data: { notifications, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count  (also /unread for legacy)
const unreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get unread count' });
  }
};
router.get('/unread-count', unreadCount);
router.get('/unread', unreadCount);

// POST /api/notifications/all/read — mark all as read
router.post('/all/read', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
});

// DELETE /api/notifications/all
router.delete('/all', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: 'All notifications deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete notifications' });
  }
});

// GET /api/notifications/:id
router.get('/:notificationId', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      userId: req.user.id
    }).lean();

    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: { notification } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notification' });
  }
});

// POST /api/notifications/:id/read
router.post('/:notificationId/read', async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, userId: req.user.id },
      { read: true }
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:notificationId', async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.notificationId, userId: req.user.id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

module.exports = router;
