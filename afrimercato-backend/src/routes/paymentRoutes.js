// =================================================================
// PAYMENT ROUTES
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
  handlePaymentWebhook,
  getTransactionHistory
} = require('../controllers/paymentController');

router.post('/process', protect, processPayment);
router.get('/methods', protect, getPaymentMethods);
router.post('/methods/add', protect, addPaymentMethod);
router.get('/status/:transactionId', protect, getPaymentStatus);
router.post('/refund/:orderId', protect, requestRefund);
router.get('/transactions', protect, getTransactionHistory);
router.post('/webhook', handlePaymentWebhook);

module.exports = router;
