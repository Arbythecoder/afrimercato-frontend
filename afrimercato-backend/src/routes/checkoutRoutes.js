// =================================================================
// CHECKOUT ROUTES
// =================================================================
// Routes for order checkout and payment processing

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  previewOrder,
  processCheckout,
  getOrders,
  getOrderDetails,
  handlePaymentWebhook
} = require('../controllers/checkoutController');

// All checkout routes require customer authentication
router.use(protect, authorize('customer'));

router.post('/preview', previewOrder);
router.post('/process', processCheckout);
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrderDetails);
router.post('/webhook/payment', handlePaymentWebhook);

module.exports = router;
