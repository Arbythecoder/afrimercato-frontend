// File: src/routes/couponRoutes.js
// Routes for coupon management

const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getCouponUsage,
  validateCoupon,
  removeCoupon,
  getAvailableCoupons
} = require('../controllers/couponController');

const { protect, authorize } = require('../middleware/auth');

// =================================================================
// ADMIN ROUTES
// =================================================================
router.post('/admin/coupons', protect, authorize('admin'), createCoupon);
router.get('/admin/coupons', protect, authorize('admin'), getAllCoupons);
router.get('/admin/coupons/:id', protect, authorize('admin'), getCouponById);
router.patch('/admin/coupons/:id', protect, authorize('admin'), updateCoupon);
router.delete('/admin/coupons/:id', protect, authorize('admin'), deleteCoupon);
router.get('/admin/coupons/:id/usage', protect, authorize('admin'), getCouponUsage);

// =================================================================
// CUSTOMER ROUTES
// =================================================================
router.post('/customer/coupons/validate', protect, authorize('customer'), validateCoupon);
router.delete('/customer/coupons/remove', protect, authorize('customer'), removeCoupon);
router.get('/customer/coupons/available', protect, authorize('customer'), getAvailableCoupons);

module.exports = router;
