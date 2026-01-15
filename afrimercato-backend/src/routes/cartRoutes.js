// =================================================================
// CART ROUTES - COMPLETE IMPLEMENTATION
// =================================================================
// Shopping cart management: add, update, remove items, pricing

const express = require('express');
const { body, validationResult, param } = require('express-validator');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const User = require('../models/User');
const Product = require('../models/Product');

router.use(protect);

// GET /api/cart - Get shopping cart
router.get('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.product');
  
  if (!user.cart || user.cart.length === 0) {
    return res.json({
      success: true,
      data: { items: [], total: 0, count: 0 }
    });
  }

  let cartTotal = 0;
  for (const item of user.cart) {
    cartTotal += item.product.price * item.quantity;
  }

  res.json({
    success: true,
    data: {
      items: user.cart,
      total: cartTotal,
      count: user.cart.length
    }
  });
}));

// POST /api/cart/items - Add item to cart
router.post(
  '/items',
  [
    body('productId').isMongoId(),
    body('quantity').isInt({ min: 1 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < req.body.quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    const user = await User.findById(req.user.id);
    const existingItem = user.cart.find(item => item.product.equals(req.body.productId));
    
    if (existingItem) {
      existingItem.quantity += req.body.quantity;
    } else {
      user.cart.push({ product: req.body.productId, quantity: req.body.quantity });
    }

    await user.save();
    await user.populate('cart.product');

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: { cart: user.cart }
    });
  })
);

// PUT /api/cart/items/:itemId - Update quantity
router.put(
  '/items/:itemId',
  [param('itemId').isMongoId(), body('quantity').isInt({ min: 1 })],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const item = user.cart.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    item.quantity = req.body.quantity;
    await user.save();
    await user.populate('cart.product');

    res.json({ success: true, message: 'Cart item updated', data: { cart: user.cart } });
  })
);

// DELETE /api/cart/items/:itemId - Remove from cart
router.delete(
  '/items/:itemId',
  param('itemId').isMongoId(),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    user.cart.id(req.params.itemId).deleteOne();
    await user.save();
    await user.populate('cart.product');

    res.json({ success: true, message: 'Item removed', data: { cart: user.cart } });
  })
);

// POST /api/cart/clear - Clear cart
router.post('/clear', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.cart = [];
  await user.save();
  res.json({ success: true, message: 'Cart cleared', data: { cart: [] } });
}));

module.exports = router;
