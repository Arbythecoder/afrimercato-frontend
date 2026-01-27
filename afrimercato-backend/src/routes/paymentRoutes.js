// =================================================================
// PAYMENT ROUTES - STRIPE INTEGRATION
// =================================================================
// Routes for payment processing and transaction management

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  processPayment,
  getPaymentMethods,
  addPaymentMethod,
  getPaymentStatus,
  requestRefund,
  handleStripeWebhook,
  getTransactionHistory,
  createCheckoutSession,
  createPaymentIntent,
  verifyStripePayment
} = require('../controllers/paymentController');

// Standard payment routes
router.post('/process', protect, processPayment);
router.get('/methods', protect, getPaymentMethods);
router.post('/methods/add', protect, addPaymentMethod);
router.get('/status/:transactionId', protect, getPaymentStatus);
router.post('/refund/:orderId', protect, requestRefund);
router.get('/transactions', protect, getTransactionHistory);

// Stripe payment routes
router.post('/stripe/create-checkout-session', protect, createCheckoutSession);
router.post('/stripe/create-payment-intent', protect, createPaymentIntent);
router.get('/stripe/verify/:sessionId', protect, verifyStripePayment);

// Webhook (no auth - verified by Stripe signature)
// NOTE: Must use express.raw() middleware for this route
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
