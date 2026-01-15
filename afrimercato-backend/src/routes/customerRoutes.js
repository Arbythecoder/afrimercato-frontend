// =================================================================
// CUSTOMER ROUTES
// =================================================================
// Routes for customer operations: profile, orders, tracking, reviews

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All customer routes require authentication
router.use(protect, authorize('customer'));

// Profile routes
router.post('/register', (req, res) => res.status(501).json({ message: 'Customer registration' }));
router.get('/profile', (req, res) => res.status(501).json({ message: 'Get customer profile' }));
router.put('/profile', (req, res) => res.status(501).json({ message: 'Update customer profile' }));

// Order routes
router.get('/orders', (req, res) => res.status(501).json({ message: 'Get customer orders' }));
router.get('/orders/:orderId', (req, res) => res.status(501).json({ message: 'Get order details' }));
router.post('/orders/:orderId/cancel', (req, res) => res.status(501).json({ message: 'Cancel order' }));

// Wishlist routes
router.get('/wishlist', (req, res) => res.status(501).json({ message: 'Get wishlist' }));
router.post('/wishlist', (req, res) => res.status(501).json({ message: 'Add to wishlist' }));
router.delete('/wishlist/:productId', (req, res) => res.status(501).json({ message: 'Remove from wishlist' }));

// Review routes
router.post('/reviews', (req, res) => res.status(501).json({ message: 'Add review' }));
router.get('/reviews', (req, res) => res.status(501).json({ message: 'Get customer reviews' }));

// Address management
router.get('/addresses', (req, res) => res.status(501).json({ message: 'Get delivery addresses' }));
router.post('/addresses', (req, res) => res.status(501).json({ message: 'Add delivery address' }));
router.put('/addresses/:addressId', (req, res) => res.status(501).json({ message: 'Update address' }));
router.delete('/addresses/:addressId', (req, res) => res.status(501).json({ message: 'Delete address' }));

module.exports = router;
