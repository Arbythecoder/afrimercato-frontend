const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDetailedAnalytics, getSalesForecast } = require('../controllers/analyticsController');
const { validateDateRange } = require('../middleware/validator');

// All routes are protected and require vendor role
router.use(protect);
router.use(authorize('vendor'));

// @route   GET /api/vendor/analytics/detailed
// @desc    Get detailed analytics for date range
// @access  Private (Vendor)
router.get('/detailed', validateDateRange, getDetailedAnalytics);

// @route   GET /api/vendor/analytics/forecast
// @desc    Get sales forecast
// @access  Private (Vendor)
router.get('/forecast', getSalesForecast);

module.exports = router;