// =================================================================
// PAYOUT ROUTES
// =================================================================
// Routes for vendor payouts and financial management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes require vendor authentication
router.use(protect, authorize('vendor'));

// Payout management
router.get('/', (req, res) => res.status(501).json({ message: 'Get payout history' }));
router.get('/:payoutId', (req, res) => res.status(501).json({ message: 'Get payout details' }));
router.post('/request', (req, res) => res.status(501).json({ message: 'Request payout' }));

// Bank details
router.get('/bank-details', (req, res) => res.status(501).json({ message: 'Get bank details' }));
router.put('/bank-details', (req, res) => res.status(501).json({ message: 'Update bank details' }));
router.post('/bank-details/verify', (req, res) => res.status(501).json({ message: 'Verify bank account' }));

// Earnings and balance
router.get('/balance', (req, res) => res.status(501).json({ message: 'Get account balance' }));
router.get('/earnings', (req, res) => res.status(501).json({ message: 'Get earnings breakdown' }));
router.get('/transactions', (req, res) => res.status(501).json({ message: 'Get transactions' }));

// Taxes
router.get('/tax-summary', (req, res) => res.status(501).json({ message: 'Get tax summary' }));
router.get('/tax-documents', (req, res) => res.status(501).json({ message: 'Get tax documents' }));

module.exports = router;
