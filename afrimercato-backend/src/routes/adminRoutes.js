// =================================================================
// ADMIN ROUTES
// =================================================================
// Routes for admin account and system management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const adminStatsController = require('../controllers/adminStatsController');

// Public routes (no authentication)
router.post('/login', adminController.login);

// All other routes require admin authentication
router.use(protect, authorize('admin'));

// Admin profile
router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);
router.post('/password/change', adminController.changePassword);

// Admin audit and logs
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/login-history', adminController.getLoginHistory);
router.get('/activity-logs', adminController.getActivityLogs);

// Notification preferences
router.get('/notifications/settings', adminController.getNotificationSettings);
router.put('/notifications/settings', adminController.updateNotificationSettings);
router.get('/notifications', adminController.getNotifications);

// Two-factor authentication
router.post('/2fa/enable', adminController.enable2FA);
router.post('/2fa/disable', adminController.disable2FA);
router.post('/2fa/verify', adminController.verify2FA);

// Platform statistics
router.get('/stats', adminStatsController.getPlatformStats);
router.get('/revenue', adminStatsController.getRevenueAnalytics);

module.exports = router;
