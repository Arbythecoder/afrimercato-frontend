// =================================================================
// VENDOR RIDER ROUTES\n// =================================================================
// Routes for vendors to manage connected riders

const express = require('express');
const router = express.Router();
const { protect, authorize, requireEmailVerified } = require('../middleware/auth');

// All routes require vendor authentication
router.use(protect, authorize('vendor'), requireEmailVerified);

// Rider requests
router.get('/requests', (req, res) => res.status(501).json({ message: 'Get pending rider requests' }));
router.post('/:riderId/approve', (req, res) => res.status(501).json({ message: 'Approve rider connection' }));
router.post('/:riderId/reject', (req, res) => res.status(501).json({ message: 'Reject rider connection' }));

// Connected riders management
router.get('/connected', (req, res) => res.status(501).json({ message: 'Get connected riders' }));
router.get('/available', (req, res) => res.status(501).json({ message: 'Get available (online) riders' }));
router.get('/:riderId', (req, res) => res.status(501).json({ message: 'Get rider details' }));
router.post('/:riderId/assign/:orderId', (req, res) => res.status(501).json({ message: 'Assign order to rider' }));
router.delete('/:riderId/remove', (req, res) => res.status(501).json({ message: 'Disconnect rider' }));

// Ratings and performance
router.get('/:riderId/stats', (req, res) => res.status(501).json({ message: 'Get rider performance stats' }));
router.post('/:riderId/rate', (req, res) => res.status(501).json({ message: 'Rate rider' }));

module.exports = router;
