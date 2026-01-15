// =================================================================
// CUSTOMER ROUTES - COMPLETE IMPLEMENTATION
// =================================================================
// Customer operations: profile, addresses, orders, reviews, wishlists

const express = require('express');
const { body, validationResult, param } = require('express-validator');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// All customer routes require authentication
router.use(protect);

// ==============================================
// GET /api/customers/profile - Get customer profile
// ==============================================
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      profile: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roles: user.roles
      }
    }
  });
}));

// ==============================================
// PUT /api/customers/profile - Update customer profile
// ==============================================
router.put(
  '/profile',
  [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phone').optional().trim()
  ],
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated',
      data: { user }
    });
  })
);

// ==============================================
// POST /api/customers/addresses - Add delivery address
// ==============================================
router.post(
  '/addresses',
  [
    body('label').trim().notEmpty().withMessage('Address label required'),
    body('street').trim().notEmpty().withMessage('Street required'),
    body('city').trim().notEmpty().withMessage('City required'),
    body('postcode').trim().notEmpty().withMessage('Postcode required'),
    body('country').trim().notEmpty().withMessage('Country required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    
    const address = {
      label: req.body.label,
      street: req.body.street,
      apartment: req.body.apartment || '',
      city: req.body.city,
      postcode: req.body.postcode,
      country: req.body.country,
      deliveryInstructions: req.body.deliveryInstructions || '',
      isDefault: req.body.isDefault || user.addresses.length === 0
    };

    user.addresses.push(address);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added',
      data: { address: user.addresses[user.addresses.length - 1] }
    });
  })
);

// ==============================================
// GET /api/customers/addresses - Get all addresses
// ==============================================
router.get('/addresses', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: { addresses: user.addresses }
  });
}));

// ==============================================
// PUT /api/customers/addresses/:addressId - Update address
// ==============================================
router.put(
  '/addresses/:addressId',
  param('addressId').isMongoId().withMessage('Invalid address ID'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    Object.assign(address, req.body);
    await user.save();

    res.json({
      success: true,
      message: 'Address updated',
      data: { address }
    });
  })
);

// ==============================================
// DELETE /api/customers/addresses/:addressId - Delete address
// ==============================================
router.delete(
  '/addresses/:addressId',
  param('addressId').isMongoId(),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);
    
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    address.deleteOne();
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted'
    });
  })
);

// ==============================================
// GET /api/customers/orders - Get customer orders
// ==============================================
router.get('/orders', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ customer: req.user.id })
    .populate('vendor', 'storeName')
    .populate('items.product', 'name price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ customer: req.user.id });

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// ==============================================
// GET /api/customers/orders/:orderId - Get order details
// ==============================================
router.get(
  '/orders/:orderId',
  param('orderId').isMongoId(),
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customer: req.user.id
    })
      .populate('vendor', 'storeName address')
      .populate('items.product')
      .populate('rider', 'firstName lastName phone')
      .populate('picker', 'firstName lastName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: { order }
    });
  })
);

// ==============================================
// POST /api/customers/orders/:orderId/cancel - Cancel order
// ==============================================
router.post(
  '/orders/:orderId/cancel',
  param('orderId').isMongoId(),
  [body('reason').optional().trim()],
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customer: req.user.id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order in this status' });
    }

    order.status = 'cancelled';
    order.cancellationReason = req.body.reason || 'Customer requested';
    order.cancelledAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled',
      data: { order }
    });
  })
);

// ==============================================
// GET /api/customers/reviews - Get customer reviews
// ==============================================
router.get('/reviews', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find({
    'reviews.customerId': req.user.id
  })
    .select('name reviews')
    .skip(skip)
    .limit(limit);

  const reviews = products.flatMap(p => 
    p.reviews
      .filter(r => r.customerId.toString() === req.user.id.toString())
      .map(r => ({ ...r.toObject(), productId: p._id, productName: p.name }))
  );

  res.json({
    success: true,
    data: { reviews, total: reviews.length }
  });
}));

// ==============================================
// POST /api/customers/reviews - Add review
// ==============================================
router.post(
  '/reviews',
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('orderId').isMongoId().withMessage('Invalid order ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').trim().notEmpty().withMessage('Comment required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Verify order belongs to customer
    const order = await Order.findOne({
      _id: req.body.orderId,
      customer: req.user.id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Add review
    const review = {
      customerId: req.user.id,
      orderId: req.body.orderId,
      rating: req.body.rating,
      comment: req.body.comment,
      createdAt: new Date()
    };

    product.reviews.push(review);

    // Update average rating
    const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    product.rating = avgRating;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added',
      data: { review }
    });
  })
);

// ==============================================
// GET /api/customers/wishlist - Get wishlist
// ==============================================
router.get('/wishlist', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist');

  res.json({
    success: true,
    data: { wishlist: user.wishlist || [] }
  });
}));

// ==============================================
// POST /api/customers/wishlist - Add to wishlist
// ==============================================
router.post(
  '/wishlist',
  [body('productId').isMongoId().withMessage('Invalid product ID')],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(req.body.productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!user.wishlist.includes(req.body.productId)) {
      user.wishlist.push(req.body.productId);
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Added to wishlist'
    });
  })
);

// ==============================================
// DELETE /api/customers/wishlist/:productId - Remove from wishlist
// ==============================================
router.delete(
  '/wishlist/:productId',
  param('productId').isMongoId(),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => !id.equals(req.params.productId));
    await user.save();

    res.json({
      success: true,
      message: 'Removed from wishlist'
    });
  })
);

module.exports = router;
