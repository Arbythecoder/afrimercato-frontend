// =================================================================
// LOCATION ROUTES
// =================================================================
// Routes for geolocation and store discovery

const express = require('express');
const router = express.Router();

// Public routes - no authentication required
router.get('/stores/nearby', (req, res) => res.status(501).json({ message: 'Get stores near location' }));
router.get('/stores/search', (req, res) => res.status(501).json({ message: 'Search stores by location' }));
router.get('/areas', (req, res) => res.status(501).json({ message: 'Get service areas' }));
router.get('/zones', (req, res) => res.status(501).json({ message: 'Get delivery zones' }));
router.get('/postcode/:postcode/check', (req, res) => res.status(501).json({ message: 'Check if postcode is served' }));

// Geolocation validation
router.post('/validate', (req, res) => res.status(501).json({ message: 'Validate location coordinates' }));
router.get('/distance', (req, res) => res.status(501).json({ message: 'Calculate distance' }));

// Admin location management
const { protect, authorize } = require('../middleware/auth');
router.use(protect, authorize('admin'));
router.post('/zones/create', (req, res) => res.status(501).json({ message: 'Create delivery zone' }));
router.put('/zones/:zoneId', (req, res) => res.status(501).json({ message: 'Update zone' }));
router.delete('/zones/:zoneId', (req, res) => res.status(501).json({ message: 'Delete zone' }));

module.exports = router;
