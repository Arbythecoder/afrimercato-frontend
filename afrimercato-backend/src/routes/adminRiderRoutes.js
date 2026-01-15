// =================================================================
// ADMIN RIDER ROUTES
// =================================================================
// Routes for admin to manage riders

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Rider management
router.get('/', (req, res) => res.status(501).json({ message: 'Get all riders' }));
router.get('/:riderId', (req, res) => res.status(501).json({ message: 'Get rider details' }));
router.post('/:riderId/approve', (req, res) => res.status(501).json({ message: 'Approve rider' }));
router.post('/:riderId/reject', (req, res) => res.status(501).json({ message: 'Reject rider' }));
router.post('/:riderId/suspend', (req, res) => res.status(501).json({ message: 'Suspend rider' }));
router.post('/:riderId/reactivate', (req, res) => res.status(501).json({ message: 'Reactivate rider' }));
router.delete('/:riderId', (req, res) => res.status(501).json({ message: 'Delete rider account' }));

// Document verification
router.get('/:riderId/documents', (req, res) => res.status(501).json({ message: 'Get rider documents' }));
router.post('/:riderId/documents/:docId/approve', (req, res) => res.status(501).json({ message: 'Approve document' }));
router.post('/:riderId/documents/:docId/reject', (req, res) => res.status(501).json({ message: 'Reject document' }));

// Communications
router.post('/:riderId/notify', (req, res) => res.status(501).json({ message: 'Send notification' }));
router.post('/:riderId/message', (req, res) => res.status(501).json({ message: 'Send message' }));

// Performance
router.get('/:riderId/performance', (req, res) => res.status(501).json({ message: 'Get performance metrics' }));
router.get('/:riderId/deliveries', (req, res) => res.status(501).json({ message: 'Get delivery history' }));

module.exports = router;
