/**
 * Customer Routes
 * All routes for customer authentication, profile, addresses, and payment methods
 */

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const addressValidation = [
  body('street').notEmpty().withMessage('Street address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('postcode').notEmpty().withMessage('Postcode is required')
];

// Public routes (no authentication required)
router.post('/register', registerValidation, customerController.register);
router.post('/login', loginValidation, customerController.login);

// Protected routes (authentication required)
router.use(protect); // All routes below require authentication
router.use(authorize('customer')); // All routes below require customer role

// Profile routes
router.get('/profile', customerController.getProfile);
router.put('/profile', customerController.updateProfile);
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
router.post('/addresses', addressValidation, customerController.addAddress);
router.put('/addresses/:addressId', customerController.updateAddress);
router.delete('/addresses/:addressId', customerController.deleteAddress);

// Payment method routes
router.get('/payment-methods', customerController.getPaymentMethods);
router.post('/payment-methods', customerController.addPaymentMethod);

// Favorites routes
router.post('/favorites/vendors/:vendorId', customerController.toggleFavoriteVendor);
router.post('/favorites/products/:productId', customerController.toggleFavoriteProduct);

module.exports = router;
