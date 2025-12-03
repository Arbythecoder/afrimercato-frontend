/**
 * Shopping Cart Routes
 * Multi-vendor cart like Jumia/Konga
 * - Add/update/remove items
 * - Apply coupons
 * - Calculate delivery fees
 * - Checkout preparation
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// All cart routes require authentication
router.use(protect);

// ======================
// CART MANAGEMENT
// ======================

/**
 * Get customer's cart
 * GET /api/cart
 * Returns: cart items grouped by vendor + pricing summary
 */
router.get('/', cartController.getCart);

/**
 * Get cart summary for checkout
 * GET /api/cart/summary
 * Returns: detailed checkout info + stock validation
 */
router.get('/summary', cartController.getCartSummary);

/**
 * Add item to cart
 * POST /api/cart/items
 * Body: { productId, quantity }
 * Validates stock before adding
 */
router.post('/items', cartController.addToCart);

/**
 * Update item quantity
 * PUT /api/cart/items/:productId
 * Body: { quantity }
 * Set quantity to 0 to remove item
 */
router.put('/items/:productId', cartController.updateQuantity);

/**
 * Remove item from cart
 * DELETE /api/cart/items/:productId
 */
router.delete('/items/:productId', cartController.removeItem);

/**
 * Clear entire cart
 * DELETE /api/cart
 */
router.delete('/', cartController.clearCart);

// ======================
// COUPONS & DISCOUNTS
// ======================

/**
 * Apply coupon code
 * POST /api/cart/coupons
 * Body: { code: "WELCOME10" }
 * Validates and applies discount
 */
router.post('/coupons', cartController.applyCoupon);

/**
 * Remove coupon
 * DELETE /api/cart/coupons/:code
 */
router.delete('/coupons/:code', cartController.removeCoupon);

// ======================
// DELIVERY
// ======================

/**
 * Set delivery address for pricing calculation
 * PUT /api/cart/delivery-address
 * Body: { addressId } OR { postcode, city, latitude, longitude }
 * Recalculates delivery fees based on address
 */
router.put('/delivery-address', cartController.setDeliveryAddress);

module.exports = router;
