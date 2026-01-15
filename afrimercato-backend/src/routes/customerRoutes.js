// =================================================================
// CUSTOMER ROUTES
// =================================================================
// Routes for customer operations: profile, orders, tracking, reviews

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getOrders,
  getOrderDetails,
  cancelOrder,
  addReview,
  getCustomerReviews,
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/customerController');

// All customer routes require authentication
router.use(protect, authorize('customer'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Address management
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Order routes
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrderDetails);
router.post('/orders/:orderId/cancel', cancelOrder);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

// Review routes
router.post('/reviews', addReview);
router.get('/reviews', getCustomerReviews);

module.exports = router;
