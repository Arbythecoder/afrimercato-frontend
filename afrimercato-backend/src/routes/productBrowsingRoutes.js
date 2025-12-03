/**
 * Product Browsing Routes
 * Premium e-commerce features like Jumia/Konga
 * - Advanced search and filtering
 * - Category browsing
 * - Featured products, deals, new arrivals
 * - Personalized recommendations
 */

const express = require('express');
const router = express.Router();
const productBrowsingController = require('../controllers/productBrowsingController');
const { protect } = require('../middleware/auth');

// ======================
// PUBLIC ROUTES
// ======================

/**
 * Get all products with advanced filtering
 * GET /api/products?page=1&limit=20&category=vegetables&minPrice=0&maxPrice=100&inStock=true&sort=newest
 * Query params: page, limit, category, vendor, minPrice, maxPrice, inStock, sort, search
 */
router.get('/', productBrowsingController.getAllProducts);

/**
 * Search products with autocomplete suggestions
 * GET /api/products/search?q=tomato&limit=10&category=vegetables
 * Returns: products + search suggestions
 */
router.get('/search', productBrowsingController.searchProducts);

/**
 * Get products by category
 * GET /api/products/category/vegetables?page=1&limit=20
 */
router.get('/category/:category', productBrowsingController.getProductsByCategory);

/**
 * Get all categories with product counts
 * GET /api/products/categories/all
 * Returns: [{ name: 'vegetables', count: 45, image: '...' }]
 */
router.get('/categories/all', productBrowsingController.getCategories);

/**
 * Get price range for filters
 * GET /api/products/price-range?category=vegetables
 * Returns: { min: 0, max: 500 }
 */
router.get('/price-range', productBrowsingController.getPriceRange);

/**
 * Get featured products (homepage)
 * GET /api/products/featured?limit=12
 */
router.get('/featured', productBrowsingController.getFeaturedProducts);

/**
 * Get deals and discounts
 * GET /api/products/deals?page=1&limit=20
 */
router.get('/deals', productBrowsingController.getDeals);

/**
 * Get new arrivals
 * GET /api/products/new-arrivals?limit=20
 */
router.get('/new-arrivals', productBrowsingController.getNewArrivals);

/**
 * Get single product details
 * GET /api/products/:productId
 * Returns: product + related products + vendor info
 */
router.get('/:productId', productBrowsingController.getProductDetails);

/**
 * Get all products from a specific vendor
 * GET /api/products/vendor/:vendorId?page=1&limit=20
 */
router.get('/vendor/:vendorId', productBrowsingController.getVendorProducts);

// ======================
// PROTECTED ROUTES (Customer must be logged in)
// ======================

/**
 * Get personalized product recommendations
 * GET /api/products/recommendations/for-you?limit=12
 * Based on favorites, order history, browsing behavior
 */
router.get('/recommendations/for-you', protect, productBrowsingController.getRecommendations);

module.exports = router;
