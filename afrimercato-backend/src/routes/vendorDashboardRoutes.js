// =================================================================
// VENDOR DASHBOARD ROUTES - PRODUCTION GRADE
// =================================================================
// File: src/routes/vendorDashboardRoutes.js
// UK Standard | Industry Best Practices
// 
// Routes for vendor dashboard, analytics, and reporting

const express = require('express');
const router = express.Router();
const { protect, authorize, requireEmailVerified } = require('../middleware/auth');
const {
  getDashboard,
  getAnalytics,
  getSalesReport,
  getInventoryStatus,
  getOrdersByStatus,
  getPayoutHistory,
  getPerformanceMetrics
} = require('../controllers/vendorDashboardController');

// All dashboard routes require vendor authentication AND email verification
router.use(protect, authorize('vendor'), requireEmailVerified);

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

/**
 * @route   GET /api/vendor/dashboard/earnings
 * @desc    Get vendor earnings breakdown with commission tracking
 * @access  Private (Vendor)
 */
router.get('/earnings', async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const Order = require('../models/Order');
    
    // Get all completed orders
    const completedOrders = await Order.find({
      vendor: vendorId,
      status: 'delivered',
      paymentStatus: 'paid'
    }).select('pricing totalAmount createdAt');
    
    // Get pending orders (not yet delivered)
    const pendingOrders = await Order.find({
      vendor: vendorId,
      status: { $in: ['pending', 'confirmed', 'preparing', 'out_for_delivery'] },
      paymentStatus: 'paid'
    }).select('pricing totalAmount createdAt');
    
    // Calculate totals
    const totalEarnings = completedOrders.reduce((sum, order) => 
      sum + (order.pricing?.vendorEarnings || (order.totalAmount * 0.88)), 0); // 88% if no pricing field
    
    const totalCommission = completedOrders.reduce((sum, order) => 
      sum + (order.pricing?.platformCommission || (order.totalAmount * 0.12)), 0);
    
    const pendingEarnings = pendingOrders.reduce((sum, order) => 
      sum + (order.pricing?.vendorEarnings || (order.totalAmount * 0.88)), 0);
    
    const totalRevenue = completedOrders.reduce((sum, order) => 
      sum + order.totalAmount, 0);
    
    res.json({
      success: true,
      data: {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalCommission: parseFloat(totalCommission.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        pendingEarnings: parseFloat(pendingEarnings.toFixed(2)),
        completedOrdersCount: completedOrders.length,
        pendingOrdersCount: pendingOrders.length,
        commissionRate: 12, // 12%
        payoutNotice: 'Payouts are processed weekly via bank transfer during beta. Ensure your bank details are updated in Settings.'
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get earnings data'
    });
  }
});

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
