// =================================================================
// CHECKOUT ROUTES
// =================================================================
// Routes for order checkout and payment processing

const express = require('express');
const router = express.Router();
const { protect, authorize, requireEmailVerified } = require('../middleware/auth');
const { validateAddress } = require('../middleware/locationValidator');
const {
  previewOrder,
  processCheckout,
  getOrders,
  getOrderDetails,
  handlePaymentWebhook,
  setRepeatPurchase,
  getRepeatPurchaseSettings,
  initializePayment
} = require('../controllers/checkoutController');

// All checkout routes require customer authentication AND email verification
router.use(protect, authorize('customer'), requireEmailVerified);

router.post('/preview', validateAddress, previewOrder);
router.post('/process', validateAddress, processCheckout);
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrderDetails);
router.post('/webhook/payment', handlePaymentWebhook);

// Payment initialization (creates order + initializes Paystack)
router.post('/payment/initialize', validateAddress, initializePayment);

// Repeat purchase endpoints
router.post('/repeat-purchase/set', setRepeatPurchase);
router.get('/repeat-purchase/settings', getRepeatPurchaseSettings);

module.exports = router;
