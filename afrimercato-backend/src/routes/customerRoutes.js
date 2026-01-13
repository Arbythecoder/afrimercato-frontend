/**
 * Customer Routes
 * All routes for customer authentication, profile, addresses, and payment methods
 */

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateCustomerRegistration,
  validateLogin,
  validateCustomerAddress,
  validateCustomerProfile
} = require('../middleware/validator');

// Public routes (no authentication required)
router.post('/register', validateCustomerRegistration, customerController.register);
router.post('/login', validateLogin, customerController.login);

// Checkout auth - quick signup/login at checkout (Deliveroo/Just Eat flow)
// This endpoint handles both signup and login in one request
router.post('/checkout-auth', customerController.checkoutAuth);

// Protected routes (authentication required)
router.use(protect); // All routes below require authentication
router.use(authorize('customer')); // All routes below require customer role

// Cart sync (after checkout auth, sync guest cart to authenticated user)
router.post('/sync-cart', customerController.syncCart);

// Profile routes
router.get('/profile', customerController.getProfile);
router.put('/profile', validateCustomerProfile, customerController.updateProfile);
router.get('/stats', customerController.getStats);

// Dashboard routes
router.get('/dashboard/stats', customerController.getDashboardStats);
router.get('/orders/recent', customerController.getRecentOrders);
router.get('/products/recommended', customerController.getRecommendedProducts);

// Wishlist routes
router.get('/wishlist', customerController.getWishlist);
router.post('/wishlist', customerController.addToWishlist);
router.delete('/wishlist/:productId', customerController.removeFromWishlist);

// Address routes
router.get('/addresses', customerController.getAddresses);
router.post('/addresses', validateCustomerAddress, customerController.addAddress);
router.put('/addresses/:addressId', customerController.updateAddress);
router.delete('/addresses/:addressId', customerController.deleteAddress);

// Payment method routes
router.get('/payment-methods', customerController.getPaymentMethods);
router.post('/payment-methods', customerController.addPaymentMethod);

// Favorites routes
router.post('/favorites/vendors/:vendorId', customerController.toggleFavoriteVendor);
router.post('/favorites/products/:productId', customerController.toggleFavoriteProduct);

module.exports = router;
