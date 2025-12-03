/**
 * Checkout Routes
 * Order creation and Paystack payment integration
 */

const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { protect } = require('../middleware/auth');

// All checkout routes require authentication
router.use(protect);

// ======================
// CHECKOUT FLOW
// ======================

/**
 * Initialize checkout session
 * POST /api/checkout/initialize
 * Body: { deliveryAddressId, paymentMethodId, deliveryNotes }
 */
router.post('/initialize', checkoutController.initializeCheckout);

/**
 * Initialize Paystack payment
 * POST /api/checkout/payment/initialize
 * Body: { deliveryAddressId, deliveryNotes }
 * Returns: Paystack payment URL and reference
 */
router.post('/payment/initialize', checkoutController.initializePayment);

/**
 * Verify Paystack payment and create orders
 * GET /api/checkout/payment/verify/:reference
 * Called after customer completes payment on Paystack
 */
router.get('/payment/verify/:reference', checkoutController.verifyPayment);

// ======================
// ORDERS
// ======================

/**
 * Get customer's orders
 * GET /api/checkout/orders?page=1&limit=10&status=pending
 */
router.get('/orders', checkoutController.getCustomerOrders);

/**
 * Get single order details
 * GET /api/checkout/orders/:orderId
 */
router.get('/orders/:orderId', checkoutController.getOrderDetails);

/**
 * Cancel order
 * POST /api/checkout/orders/:orderId/cancel
 * Body: { reason }
 */
router.post('/orders/:orderId/cancel', checkoutController.cancelOrder);

// ======================
// WEBHOOKS (No Auth Required)
// ======================

/**
 * Paystack webhook endpoint
 * POST /api/checkout/webhook/paystack
 * Receives payment notifications from Paystack
 */
router.post('/webhook/paystack', express.raw({ type: 'application/json' }), checkoutController.paystackWebhook);

module.exports = router;
