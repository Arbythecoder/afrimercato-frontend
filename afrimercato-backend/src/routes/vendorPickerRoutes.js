// =================================================================
// VENDOR PICKER ROUTES
// =================================================================
// Routes for vendors to manage connected pickers

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes require vendor authentication
router.use(protect, authorize('vendor'));

// Picker requests
router.get('/requests', (req, res) => res.status(501).json({ message: 'Get pending picker requests' }));
router.post('/:pickerId/approve', (req, res) => res.status(501).json({ message: 'Approve picker connection' }));
router.post('/:pickerId/reject', (req, res) => res.status(501).json({ message: 'Reject picker connection' }));

// Connected pickers management
router.get('/connected', (req, res) => res.status(501).json({ message: 'Get connected pickers' }));
router.get('/active', (req, res) => res.status(501).json({ message: 'Get active pickers at store' }));
router.get('/:pickerId', (req, res) => res.status(501).json({ message: 'Get picker details' }));
router.post('/:pickerId/assign/:orderId', (req, res) => res.status(501).json({ message: 'Manually assign picker to order' }));
router.post('/:pickerId/suspend', (req, res) => res.status(501).json({ message: 'Suspend picker' }));
router.delete('/:pickerId/remove', (req, res) => res.status(501).json({ message: 'Remove picker' }));

// Performance and ratings
router.get('/:pickerId/stats', (req, res) => res.status(501).json({ message: 'Get picker performance' }));
router.get('/:pickerId/ratings', (req, res) => res.status(501).json({ message: 'Get picker ratings' }));

module.exports = router;
