// =================================================================
// VENDOR DASHBOARD ROUTES - PRODUCTION GRADE
// =================================================================
// File: src/routes/vendorDashboardRoutes.js
// UK Standard | Industry Best Practices
// 
// Routes for vendor dashboard, analytics, and reporting

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard,
  getAnalytics,
  getSalesReport,
  getInventoryStatus,
  getOrdersByStatus,
  getPayoutHistory,
  getPerformanceMetrics
} = require('../controllers/vendorDashboardController');

// All dashboard routes require vendor authentication
router.use(protect, authorize('vendor'));

// =================================================================
// MAIN DASHBOARD
// =================================================================

/**
 * @route   GET /api/vendor/dashboard
 * @desc    Get complete vendor dashboard with KPIs
 * @access  Private (Vendor)
 */
router.get('/', getDashboard);

// =================================================================
// ANALYTICS & REPORTING
// =================================================================

/**
 * @route   GET /api/vendor/dashboard/analytics
 * @desc    Detailed analytics with custom date range
 * @access  Private (Vendor)
 * @query   startDate, endDate, period (day|week|month)
 */
router.get('/analytics', getAnalytics);

/**
 * @route   GET /api/vendor/dashboard/sales
 * @desc    Sales report with category breakdown
 * @access  Private (Vendor)
 * @query   month, year
 */
router.get('/sales', getSalesReport);

/**
 * @route   GET /api/vendor/dashboard/inventory
 * @desc    Inventory status and alerts
 * @access  Private (Vendor)
 */
router.get('/inventory', getInventoryStatus);

/**
 * @route   GET /api/vendor/dashboard/performance
 * @desc    Performance metrics and KPIs
 * @access  Private (Vendor)
 */
router.get('/performance', getPerformanceMetrics);

/**
 * @route   GET /api/vendor/dashboard/payouts
 * @desc    Payout history and pending amounts
 * @access  Private (Vendor)
 * @query   page, limit
 */
router.get('/payouts', getPayoutHistory);

// =================================================================
// ORDER MANAGEMENT BY STATUS
// =================================================================

/**
 * @route   GET /api/vendor/dashboard/orders/:status
 * @desc    Get orders filtered by status
 * @access  Private (Vendor)
 * @params  status: pending|processing|picker_assigned|completed|cancelled
 * @query   page, limit
 */
router.get('/orders/:status', getOrdersByStatus);

module.exports = router;
