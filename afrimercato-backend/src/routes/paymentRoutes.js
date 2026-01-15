// =================================================================
// PAYMENT ROUTES
// =================================================================
// Routes for payment processing and transaction management

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/process', protect, (req, res) => res.status(501).json({ message: 'Process payment' }));
router.get('/methods', protect, (req, res) => res.status(501).json({ message: 'Get payment methods' }));
router.post('/methods/add', protect, (req, res) => res.status(501).json({ message: 'Add payment method' }));
router.get('/status/:transactionId', protect, (req, res) => res.status(501).json({ message: 'Get payment status' }));
router.post('/refund/:orderId', protect, (req, res) => res.status(501).json({ message: 'Request refund' }));
router.post('/webhook', (req, res) => res.status(501).json({ message: 'Payment gateway webhook' }));

module.exports = router;
