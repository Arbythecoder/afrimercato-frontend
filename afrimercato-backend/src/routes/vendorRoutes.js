// =================================================================
// VENDOR ROUTES
// =================================================================
// All routes for vendor operations: dashboard, products, orders, profile

const express = require('express');
const router = express.Router();

// Import controllers
const {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  getDashboardStats,
  getDashboardChartData,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getOrders,
  getOrder,
  updateOrderStatus,
  rateRider,
  getRevenueAnalytics,
  bulkDeleteProducts,
  bulkUpdateStatus,
  bulkUpdatePrices,
  bulkUpdateStock,
  uploadProductImages,
  getSalesReport,
  getInventoryReport,
  getOrdersReport,
  getRevenueReport,
  getDeliverySettings,
  updateDeliverySettings,
  getOnboardingStatus,          // new import
  getVendorDashboard,
  registerVendor,
  loginVendor,
  verifyOTP,
  verifyVendorEmail,
vendorAuthController,
vendorController
} = require('../controllers/vendorController');

// Import middleware
const { protect, authorize, verifyVendor } = require('../middleware/auth');
const {
  validateProduct,
  validateVendorProfile,
  validateMongoId,
  validatePagination,
  validateBulkDelete,
  validateBulkStatus,
  validateBulkPrice,
  validateBulkStock,
   validateVendorRegistration,  // ADD THIS
  validateLogin,
  validateOTP
} = require('../middleware/validator');
const { uploadMultiple, handleUploadError, getFileUrl } = require('../middleware/upload');

/**
 * MIDDLEWARE CHAIN FOR VENDOR ROUTES:
 *
 * 1. protect → Verify user is logged in
 * 2. authorize('vendor') → Verify user role is 'vendor'
 * 3. verifyVendor → Verify vendor profile exists and is verified
 * 4. Additional validators → Validate request data
 * 5. Controller → Handle business logic
 */

// Apply protection and authorization to ALL vendor routes
router.use(protect, authorize('vendor'));

// =================================================================
// VENDOR PROFILE ROUTES
// =================================================================
// @route   POST /api/vendor/register
// @desc    Register a new vendor (PUBLIC - no login required)
// @access  Public
router.post('/register', validateVendorRegistration, registerVendor);

// @route   POST /api/vendor/profile
// @desc    Create vendor profile (first-time setup)
// @access  Private (Vendor role only)
router.post('/profile', validateVendorProfile, createVendorProfile);

// @route   GET /api/vendor/onboarding/status
// @desc    Get vendor onboarding status
// @access  Private (Vendor role only)
router.get('/onboarding/status', getOnboardingStatus); // NEW ROUTE!

// @route   GET /api/vendor/dashboard
// @desc    Get vendor dashboard with onboarding check
// @access  Private (Vendor role only)
router.get('/dashboard', getVendorDashboard); // NEW ROUTE!


// Routes below require verified vendor profile
router.use(verifyVendor);

// @route   GET /api/vendor/profile
// @desc    Get own vendor profile
// @access  Private (Verified Vendor)
router.get('/profile', getVendorProfile);

// @route   PUT /api/vendor/profile
// @desc    Update vendor profile
// @access  Private (Verified Vendor)
router.put('/profile', updateVendorProfile);

// @route   GET /api/vendor/delivery-settings
// @desc    Get vendor delivery settings (Premium feature)
// @access  Private (Verified Vendor)
router.get('/delivery-settings', getDeliverySettings);

// @route   PUT /api/vendor/delivery-settings
// @desc    Update vendor delivery settings (Premium feature)
// @access  Private (Verified Vendor)
router.put('/delivery-settings', updateDeliverySettings);

// =================================================================
// DASHBOARD ROUTES
// =================================================================

// @route   GET /api/vendor/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Verified Vendor)
router.get('/dashboard/stats', getDashboardStats);

// @route   GET /api/vendor/dashboard/chart-data
// @desc    Get dashboard chart data for analytics
// @access  Private (Verified Vendor)
router.get('/dashboard/chart-data', getDashboardChartData);

// =================================================================
// PRODUCT ROUTES
// =================================================================

// @route   GET /api/vendor/products
// @desc    Get all vendor products (with pagination & filters)
// @access  Private (Verified Vendor)
router.get('/products', validatePagination, getProducts);

// @route   POST /api/vendor/products
// @desc    Create new product
// @access  Private (Verified Vendor)
router.post('/products', 
  uploadMultiple('images', 5),    // ← NEW: Handle file uploads (max 5)
  handleUploadError,               // ← NEW: Handle upload errors
  validateProduct,                 // Existing: Validate form data
  createProduct
);

// @route   GET /api/vendor/products/:id
// @desc    Get single product details
// @access  Private (Verified Vendor)
router.get('/products/:id', validateMongoId('id'), getProduct);

// @route   PUT /api/vendor/products/:id
// @desc    Update product
// @access  Private (Verified Vendor)
router.put('/products/:id', [validateMongoId('id'), validateProduct], updateProduct);

// @route   DELETE /api/vendor/products/:id
// @desc    Delete product
// @access  Private (Verified Vendor)
router.delete('/products/:id', validateMongoId('id'), deleteProduct);

// @route   PATCH /api/vendor/products/:id/stock
// @desc    Update product stock quantity
// @access  Private (Verified Vendor)
router.patch('/products/:id/stock', validateMongoId('id'), updateStock);

// Bulk operation routes
router.post('/products/bulk-delete', validateBulkDelete, bulkDeleteProducts);
router.post('/products/bulk-status', validateBulkStatus, bulkUpdateStatus);
router.post('/products/bulk-price', validateBulkPrice, bulkUpdatePrices);
router.post('/products/bulk-stock', validateBulkStock, bulkUpdateStock);

// @route   POST /api/vendor/upload/images
// @desc    Upload product images (up to 5)
// @access  Private (Verified Vendor)
router.post('/upload/images', uploadMultiple('productImages', 5), handleUploadError, uploadProductImages);

// =================================================================
// ORDER ROUTES
// =================================================================

// @route   GET /api/vendor/orders
// @desc    Get all vendor orders (with pagination & filters)
// @access  Private (Verified Vendor)
router.get('/orders', validatePagination, getOrders);

// @route   GET /api/vendor/orders/:id
// @desc    Get single order details
// @access  Private (Verified Vendor)
router.get('/orders/:id', validateMongoId('id'), getOrder);

// @route   PUT /api/vendor/orders/:id/status
// @desc    Update order status
// @access  Private (Verified Vendor)
router.put('/orders/:id/status', validateMongoId('id'), updateOrderStatus);

// @route   POST /api/vendor/orders/:id/rate-rider
// @desc    Rate delivery rider for an order
// @access  Private (Verified Vendor)
router.post('/orders/:id/rate-rider', validateMongoId('id'), rateRider);

// =================================================================
// ANALYTICS ROUTES
// =================================================================

// @route   GET /api/vendor/analytics/revenue
// @desc    Get revenue analytics
// @access  Private (Verified Vendor)
router.get('/analytics/revenue', getRevenueAnalytics);

// =================================================================
// REPORTS ROUTES
// =================================================================

// @route   GET /api/vendor/reports/sales
// @desc    Get sales report
// @access  Private (Verified Vendor)
router.get('/reports/sales', getSalesReport);

// @route   GET /api/vendor/reports/inventory
// @desc    Get inventory report
// @access  Private (Verified Vendor)
router.get('/reports/inventory', getInventoryReport);

// @route   GET /api/vendor/reports/orders
// @desc    Get orders report
// @access  Private (Verified Vendor)
router.get('/reports/orders', getOrdersReport);

// @route   GET /api/vendor/reports/revenue
// @desc    Get revenue report
// @access  Private (Verified Vendor)
router.get('/reports/revenue', getRevenueReport);
// =================================================================
// ALL OTHER ROUTES REQUIRE VERIFIED VENDOR PROFILE
// =================================================================
// Add this middleware ONLY for routes that need existing vendor profile
router.use('/products', verifyVendor);
router.use('/orders', verifyVendor);
router.use('/analytics', verifyVendor);
router.use('/reports', verifyVendor);

// Profile routes that need vendor profile
router.get('/profile', verifyVendor, getVendorProfile);
router.put('/profile', verifyVendor, updateVendorProfile);
// Apply protection and authorization to OTHER vendor routes
router.use(protect, authorize('vendor'));

// @route   GET /api/vendor/onboarding/status
// @desc    Get vendor onboarding status (Protected, but no vendor profile needed)
// @access  Private (Vendor role only)
router.get('/onboarding/status', getOnboardingStatus);

// @route   GET /api/vendor/dashboard
// @desc    Get vendor dashboard with onboarding check (Protected, but no vendor profile needed)
// @access  Private (Vendor role only)
router.get('/dashboard', getVendorDashboard);

// @route   POST /api/vendor/profile
// @desc    Create vendor profile (first-time setup)
// @access  Private (Vendor role only)
router.post('/profile', validateVendorProfile, createVendorProfile);

// =================================================================
// ALL ROUTES BELOW REQUIRE VERIFIED VENDOR PROFILE
// =================================================================
// Add verifyVendor middleware for routes that need existing vendor profile
router.use(verifyVendor);

// Profile routes (requires vendor profile)
router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);

// Dashboard stats (requires vendor profile)
router.get('/dashboard/stats', verifyVendor, getDashboardStats);
module.exports = router;
