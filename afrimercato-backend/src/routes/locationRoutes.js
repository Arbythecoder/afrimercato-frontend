// =================================================================
// LOCATION ROUTES
// =================================================================
// Routes for geolocation and store discovery with geocoding support

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// =================================================================
// PUBLIC ROUTES - No authentication required
// =================================================================

/**
 * @route   GET /api/location/search-vendors
 * @desc    Search vendors by postcode or location text with geocoding
 * @access  Public
 * @params  postcode, locationText, radiusKm (default 25), limit, category
 */
router.get('/search-vendors', locationController.searchVendors);

/**
 * @route   GET /api/location/browse-all
 * @desc    Browse all vendors (not location-based)
 * @access  Public
 */
router.get('/browse-all', locationController.browseAllVendors);

/**
 * @route   POST /api/location/notify
 * @desc    Request notification when service launches in area
 * @access  Public
 */
router.post('/notify', locationController.notifyWhenAvailable);

module.exports = router;
