// =================================================================
// PAYMENT ROUTES - STRIPE INTEGRATION
// =================================================================

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

/**
 * @swagger
 * /api/payments/stripe/create-checkout-session:
 *   post:
 *     summary: Create Stripe Checkout Session
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Session created — redirect user to data.url
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId: { type: string }
 *                     url: { type: string }
 *       503:
 *         description: Stripe not configured
 */
router.post('/stripe/create-checkout-session', protect, createCheckoutSession);

/**
 * @swagger
 * /api/payments/stripe/verify/{sessionId}:
 *   get:
 *     summary: Verify Stripe payment after redirect
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         example: cs_test_abc123
 *     responses:
 *       200:
 *         description: Payment verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentStatus: { type: string, example: paid }
 *                     order: { $ref: '#/components/schemas/Order' }
 */
router.get('/stripe/verify/:sessionId', protect, verifyStripePayment);

/**
 * @swagger
 * /api/payments/stripe/create-payment-intent:
 *   post:
 *     summary: Create Stripe Payment Intent (inline checkout)
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, amount]
 *             properties:
 *               orderId: { type: string }
 *               amount:  { type: number, example: 45.99 }
 *     responses:
 *       200:
 *         description: Client secret returned
 */
router.post('/stripe/create-payment-intent', protect, createPaymentIntent);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Stripe webhook receiver (do not call manually)
 *     tags: [Payments]
 *     description: |
 *       Verified by `stripe-signature` header. Handles:
 *       - checkout.session.completed → marks order paid
 *       - checkout.session.expired → restores stock
 *       - payment_intent.succeeded → marks order paid
 *       - payment_intent.payment_failed → cancels order + restores stock
 *     responses:
 *       200:
 *         description: Event received
 */
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Standard payment routes
router.post('/process', protect, processPayment);
router.get('/methods', protect, getPaymentMethods);
router.post('/methods/add', protect, addPaymentMethod);
router.get('/status/:transactionId', protect, getPaymentStatus);
router.post('/refund/:orderId', protect, requestRefund);
router.get('/transactions', protect, getTransactionHistory);

module.exports = router;
