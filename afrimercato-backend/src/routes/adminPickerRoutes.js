// =================================================================
// ADMIN PICKER ROUTES
// =================================================================
// Routes for admin to manage pickers

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Picker management
router.get('/', (req, res) => res.status(501).json({ message: 'Get all pickers' }));
router.get('/:pickerId', (req, res) => res.status(501).json({ message: 'Get picker details' }));
router.post('/:pickerId/approve', (req, res) => res.status(501).json({ message: 'Approve picker' }));
router.post('/:pickerId/reject', (req, res) => res.status(501).json({ message: 'Reject picker' }));
router.post('/:pickerId/suspend', (req, res) => res.status(501).json({ message: 'Suspend picker' }));
router.post('/:pickerId/reactivate', (req, res) => res.status(501).json({ message: 'Reactivate picker' }));
router.delete('/:pickerId', (req, res) => res.status(501).json({ message: 'Delete picker account' }));

// Document verification
router.get('/:pickerId/documents', (req, res) => res.status(501).json({ message: 'Get picker documents' }));
router.post('/:pickerId/documents/:docId/approve', (req, res) => res.status(501).json({ message: 'Approve document' }));
router.post('/:pickerId/documents/:docId/reject', (req, res) => res.status(501).json({ message: 'Reject document' }));

// Communications
router.post('/:pickerId/notify', (req, res) => res.status(501).json({ message: 'Send notification' }));
router.post('/:pickerId/message', (req, res) => res.status(501).json({ message: 'Send message' }));

// Performance
router.get('/:pickerId/performance', (req, res) => res.status(501).json({ message: 'Get performance metrics' }));
router.get('/:pickerId/orders', (req, res) => res.status(501).json({ message: 'Get picking history' }));

module.exports = router;
