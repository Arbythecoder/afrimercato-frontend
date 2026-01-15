// =================================================================
// ADMIN ROUTES
// =================================================================
// Routes for admin account and system management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Admin profile
router.get('/profile', (req, res) => res.status(501).json({ message: 'Get admin profile' }));
router.put('/profile', (req, res) => res.status(501).json({ message: 'Update admin profile' }));
router.post('/password/change', (req, res) => res.status(501).json({ message: 'Change password' }));

// Admin audit and logs
router.get('/audit-logs', (req, res) => res.status(501).json({ message: 'Get audit logs' }));
router.get('/login-history', (req, res) => res.status(501).json({ message: 'Get login history' }));
router.get('/activity-logs', (req, res) => res.status(501).json({ message: 'Get system activity logs' }));

// Notification preferences
router.get('/notifications/settings', (req, res) => res.status(501).json({ message: 'Get notification settings' }));
router.put('/notifications/settings', (req, res) => res.status(501).json({ message: 'Update notification settings' }));
router.get('/notifications', (req, res) => res.status(501).json({ message: 'Get notifications' }));

// Two-factor authentication
router.post('/2fa/enable', (req, res) => res.status(501).json({ message: 'Enable 2FA' }));
router.post('/2fa/disable', (req, res) => res.status(501).json({ message: 'Disable 2FA' }));
router.post('/2fa/verify', (req, res) => res.status(501).json({ message: 'Verify 2FA code' }));

module.exports = router;
