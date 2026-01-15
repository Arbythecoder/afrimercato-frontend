// =================================================================
// PICKER ORDER ROUTES
// =================================================================
// Routes for picker order fulfillment and picking workflow

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes require picker authentication
router.use(protect, authorize('picker'));

// Order management
router.get('/available', (req, res) => res.status(501).json({ message: 'Get available orders' }));
router.get('/my-orders', (req, res) => res.status(501).json({ message: 'Get my orders' }));
router.post('/:orderId/claim', (req, res) => res.status(501).json({ message: 'Claim order for picking' }));
router.post('/:orderId/start', (req, res) => res.status(501).json({ message: 'Start picking order' }));

// Item picking workflow
router.get('/:orderId/items', (req, res) => res.status(501).json({ message: 'Get order items to pick' }));
router.post('/:orderId/items/:itemId/pick', (req, res) => res.status(501).json({ message: 'Mark item as picked' }));
router.post('/:orderId/items/:itemId/issue', (req, res) => res.status(501).json({ message: 'Report item issue' }));
router.post('/:orderId/substitute', (req, res) => res.status(501).json({ message: 'Suggest substitute product' }));

// Packing workflow
router.post('/:orderId/ready-for-packing', (req, res) => res.status(501).json({ message: 'Mark all items picked' }));
router.post('/:orderId/start-packing', (req, res) => res.status(501).json({ message: 'Start packing order' }));
router.post('/:orderId/upload-photos', (req, res) => res.status(501).json({ message: 'Upload packing photos' }));
router.post('/:orderId/complete-packing', (req, res) => res.status(501).json({ message: 'Complete packing for rider' }));

// History and earnings
router.get('/history', (req, res) => res.status(501).json({ message: 'Get picking history' }));
router.get('/earnings', (req, res) => res.status(501).json({ message: 'Get earnings' }));
router.get('/stats', (req, res) => res.status(501).json({ message: 'Get performance stats' }));

module.exports = router;
