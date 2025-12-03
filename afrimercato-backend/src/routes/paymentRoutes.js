// =================================================================
// PAYMENT ROUTES - STRIPE
// =================================================================

const express = require('express');
const router = express.Router();

const {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getStripeConfig,
  processRefund
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/config', getStripeConfig);

// Webhook (raw body needed for signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes (Customer)
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);

// Protected routes (Admin/Vendor)
router.post('/refund', protect, authorize('admin', 'vendor'), processRefund);

module.exports = router;
