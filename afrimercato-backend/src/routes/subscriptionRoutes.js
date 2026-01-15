// =================================================================
// SUBSCRIPTION ROUTES
// =================================================================
// Routes for vendor subscription and premium features

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Vendor subscription routes
router.use(protect, authorize('vendor'));

// Subscription management
router.get('/plans', (req, res) => res.status(501).json({ message: 'Get subscription plans' }));
router.get('/my-subscription', (req, res) => res.status(501).json({ message: 'Get current subscription' }));
router.post('/subscribe/:planId', (req, res) => res.status(501).json({ message: 'Subscribe to plan' }));
router.post('/upgrade/:planId', (req, res) => res.status(501).json({ message: 'Upgrade subscription' }));
router.post('/cancel', (req, res) => res.status(501).json({ message: 'Cancel subscription' }));

// Billing
router.get('/invoices', (req, res) => res.status(501).json({ message: 'Get invoices' }));
router.get('/invoices/:invoiceId', (req, res) => res.status(501).json({ message: 'Get invoice details' }));
router.post('/payment-method', (req, res) => res.status(501).json({ message: 'Update payment method' }));

// Features
router.get('/features', (req, res) => res.status(501).json({ message: 'Get subscription features' }));

module.exports = router;
