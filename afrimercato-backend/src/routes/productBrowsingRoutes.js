// =================================================================
// PRODUCT BROWSING ROUTES
// =================================================================
// Routes for product search, filter, and browsing (public)

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  browseProducts,
  getProductDetails,
  searchProducts,
  getCategories,
  getFeaturedVendors,
  getVendorProducts,
  getTrendingProducts,
  getDealProducts,
  getNearbyProducts,
  getRecommendations,
  getNewProducts
} = require('../controllers/productBrowsingController');

// Public routes
router.get('/', browseProducts);
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/trending', getTrendingProducts);
router.get('/deals', getDealProducts);
router.get('/new-arrivals', getNewProducts);
router.get('/featured-vendors', getFeaturedVendors);
router.get('/nearby', getNearbyProducts);
router.get('/vendor/:vendorId', getVendorProducts);
router.get('/:productId', getProductDetails);

// Protected routes
router.get('/recommendations/for-you', protect, getRecommendations);

module.exports = router;

