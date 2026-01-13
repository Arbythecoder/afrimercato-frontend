// File: src/routes/payoutRoutes.js
// Routes for payout management

const express = require('express');
const router = express.Router();
const {
  getVendorPayouts,
  getPayoutById,
  getPayoutSummary,
  requestPayout,
  getAllPayouts,
  approvePayout,
  completePayout,
  rejectPayout
} = require('../controllers/payoutController');

const { protect, authorize } = require('../middleware/auth');

// =================================================================
// VENDOR ROUTES
// =================================================================
router.get('/vendor/payouts', protect, authorize('vendor'), getVendorPayouts);
router.get('/vendor/payouts/summary', protect, authorize('vendor'), getPayoutSummary);
router.get('/vendor/payouts/:id', protect, authorize('vendor'), getPayoutById);
router.post('/vendor/payouts/request', protect, authorize('vendor'), requestPayout);

// =================================================================
// ADMIN ROUTES
// =================================================================
router.get('/admin/payouts', protect, authorize('admin'), getAllPayouts);
router.patch('/admin/payouts/:id/approve', protect, authorize('admin'), approvePayout);
router.patch('/admin/payouts/:id/complete', protect, authorize('admin'), completePayout);
router.patch('/admin/payouts/:id/reject', protect, authorize('admin'), rejectPayout);

module.exports = router;
