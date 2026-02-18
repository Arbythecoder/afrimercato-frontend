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
  registerVendor
} = require('../controllers/vendorController');

// Import middleware
const { protect, authorize, requireEmailVerified } = require('../middleware/auth');
const { attachVendor } = require('../middleware/vendorMiddleware');
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
 * 3. Additional validators → Validate request data
 * 4. Controller → Handle business logic
 *
 * NOTE: PUBLIC routes (register, login) do NOT use protect/authorize middleware
 * PROTECTED routes (profile, products, orders, etc.) explicitly include protect, authorize('vendor')
 */

// =================================================================
// PUBLIC ROUTES (no authentication required)
// =================================================================
/**
 * @swagger
 * /api/vendor/register:
 *   post:
 *     summary: Register a new vendor account
 *     description: Create a new vendor account with store details
 *     tags: [Vendor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - storeName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: vendor@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: securePassword123
 *               storeName:
 *                 type: string
 *                 example: Joe's Fresh Market
 *               firstName:
 *                 type: string
 *                 example: Joe
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 vendor:
 *                   $ref: '#/components/schemas/Vendor'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @route   POST /api/vendor/register
// @desc    Register a new vendor (PUBLIC - no login required)
// @access  Public
router.post('/register', validateVendorRegistration, registerVendor);

// All routes below require vendor authentication + email verification + attachVendor
router.use(protect, authorize('vendor'), requireEmailVerified, attachVendor);

// Note: Vendors use /api/auth/login for authentication (shared with all user types)
// No separate vendor login endpoint needed to avoid duplicate routes

/**
 * @swagger
 * /api/vendor/profile:
 *   post:
 *     summary: Create vendor profile
 *     description: First-time vendor profile setup (requires vendor authentication)
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeName:
 *                 type: string
 *               storeDescription:
 *                 type: string
 *               address:
 *                 type: object
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get vendor profile
 *     description: Retrieve authenticated vendor's profile
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 vendor:
 *                   $ref: '#/components/schemas/Vendor'
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update vendor profile
 *     description: Update authenticated vendor's profile information
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
// @route   POST /api/vendor/profile
// @desc    Create vendor profile (first-time setup)
// @access  Private (Vendor role only)
router.post('/profile', validateVendorProfile, createVendorProfile);

// @route   GET /api/vendor/profile
// @desc    Get own vendor profile
// @access  Private (Vendor)
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
router.put('/products/:id',
  uploadMultiple('images', 5),    // Handle file uploads (max 5)
  handleUploadError,               // Handle upload errors
  validateMongoId('id'),
  updateProduct
);

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

module.exports = router;
