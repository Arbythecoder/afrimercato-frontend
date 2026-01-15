// =================================================================
// COUPON ROUTES
// =================================================================
// Routes for coupon/discount code management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public: Get available coupons
router.get('/', (req, res) => res.status(501).json({ message: 'Get active coupons' }));
router.get('/:couponCode/validate', (req, res) => res.status(501).json({ message: 'Validate coupon code' }));

// Customer coupons
router.use(protect, authorize('customer'));
router.get('/my-coupons', (req, res) => res.status(501).json({ message: 'Get my coupons' }));
router.post('/:couponCode/apply', (req, res) => res.status(501).json({ message: 'Apply coupon to cart' }));

module.exports = router;
