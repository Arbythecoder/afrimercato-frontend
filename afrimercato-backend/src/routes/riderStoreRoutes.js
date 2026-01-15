// =================================================================
// RIDER STORE ROUTES
// =================================================================
// Routes for rider-store connections and delivery management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes require rider authentication
router.use(protect, authorize('rider'));

// Connection management
router.post('/request/:storeId', (req, res) => res.status(501).json({ message: 'Request connection with store' }));
router.get('/my-stores', (req, res) => res.status(501).json({ message: 'Get connected stores' }));
router.get('/requests', (req, res) => res.status(501).json({ message: 'Get connection requests' }));

// Delivery management
router.get('/deliveries', (req, res) => res.status(501).json({ message: 'Get available deliveries' }));
router.get('/deliveries/active', (req, res) => res.status(501).json({ message: 'Get active deliveries' }));
router.post('/deliveries/:deliveryId/accept', (req, res) => res.status(501).json({ message: 'Accept delivery' }));
router.post('/deliveries/:deliveryId/reject', (req, res) => res.status(501).json({ message: 'Reject delivery' }));
router.post('/deliveries/:deliveryId/start', (req, res) => res.status(501).json({ message: 'Start delivery' }));
router.post('/deliveries/:deliveryId/complete', (req, res) => res.status(501).json({ message: 'Complete delivery' }));

// Location tracking
router.post('/location/update', (req, res) => res.status(501).json({ message: 'Update current location' }));
router.get('/deliveries/:deliveryId/track', (req, res) => res.status(501).json({ message: 'Get delivery tracking' }));

// Earnings and ratings
router.get('/earnings', (req, res) => res.status(501).json({ message: 'Get earnings' }));
router.get('/ratings', (req, res) => res.status(501).json({ message: 'Get rider ratings' }));
router.post('/store/:storeId/rate', (req, res) => res.status(501).json({ message: 'Rate store' }));

module.exports = router;
