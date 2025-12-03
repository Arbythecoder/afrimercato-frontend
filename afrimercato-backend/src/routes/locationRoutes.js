// =================================================================
// LOCATION SEARCH ROUTES - Uber Eats/Just Eat Style
// =================================================================

const express = require('express');
const router = express.Router();
const locationSearchController = require('../controllers/locationSearchController');

// =================================================================
// PUBLIC ROUTES (No authentication required)
// =================================================================

/**
 * @route   GET /api/location/search-vendors
 * @desc    Search vendors by location (city, postcode, address, or coordinates)
 * @query   location - Text location (e.g., "Bristol UK", "SW1A 1AA")
 * @query   latitude - User's latitude (alternative to location)
 * @query   longitude - User's longitude (alternative to location)
 * @query   radius - Search radius in km (default: 10)
 * @query   category - Filter by category (optional)
 * @query   minRating - Minimum rating filter (optional)
 * @query   maxDeliveryFee - Max delivery fee filter (optional)
 * @query   isOpen - Filter by currently open stores (true/false)
 * @query   sort - Sort by: distance, rating, deliveryFee, popular
 * @query   page - Page number (default: 1)
 * @query   limit - Results per page (default: 20)
 * @access  Public
 *
 * @example
 * GET /api/location/search-vendors?location=Bristol%20UK&radius=15&category=groceries&sort=distance
 * GET /api/location/search-vendors?latitude=51.4545&longitude=-2.5879&radius=10&isOpen=true
 */
router.get('/search-vendors', locationSearchController.searchVendorsByLocation);

/**
 * @route   GET /api/location/geocode
 * @desc    Convert address/postcode to coordinates
 * @query   query - Address or postcode to geocode
 * @access  Public
 *
 * @example
 * GET /api/location/geocode?query=Bristol%20UK
 * GET /api/location/geocode?query=SW1A%201AA
 */
router.get('/geocode', locationSearchController.geocodeLocation);

/**
 * @route   GET /api/location/detect
 * @desc    Detect user's location from IP address
 * @access  Public
 *
 * @example
 * GET /api/location/detect
 */
router.get('/detect', locationSearchController.detectUserLocation);

/**
 * @route   GET /api/location/vendor/:storeId
 * @desc    Get individual vendor storefront by ID or slug
 * @param   storeId - Vendor store ID or custom slug
 * @query   userLat - User's latitude (optional, for distance calculation)
 * @query   userLng - User's longitude (optional, for distance calculation)
 * @access  Public
 *
 * @example
 * GET /api/location/vendor/fresh-valley-farms
 * GET /api/location/vendor/68f1234567890abcdef?userLat=51.4545&userLng=-2.5879
 */
router.get('/vendor/:storeId', locationSearchController.getVendorStorefront);

/**
 * @route   GET /api/location/categories
 * @desc    Get all categories with vendor counts
 * @query   latitude - User's latitude (optional)
 * @query   longitude - User's longitude (optional)
 * @query   radius - Search radius in km (default: 20)
 * @access  Public
 *
 * @example
 * GET /api/location/categories
 * GET /api/location/categories?latitude=51.4545&longitude=-2.5879&radius=15
 */
router.get('/categories', locationSearchController.getCategoriesWithCounts);

// =================================================================
// EXPORTS
// =================================================================

module.exports = router;
