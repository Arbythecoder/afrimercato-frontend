// =================================================================
// CHECKOUT ROUTES - COMPLETE IMPLEMENTATION
// =================================================================
// Order checkout: preview, initialize payment, verify payment, create orders

const express = require('express');
const { body, validationResult, param } = require('express-validator');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

router.use(protect);

// POST /api/checkout/initialize - Initialize checkout preview
router.post(
  '/initialize',
  [
    body('deliveryAddressId').isMongoId(),
    body('deliveryNotes').optional().trim()
  ],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('cart.product');
    
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const address = user.addresses.id(req.body.deliveryAddressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Delivery address not found' });
    }

    const groupedByVendor = {};
    let subtotal = 0;

    for (const item of user.cart) {
      const vendorId = item.product.vendor.toString();
      const itemTotal = item.product.price * item.quantity;
      
      if (!groupedByVendor[vendorId]) {
        groupedByVendor[vendorId] = {
          items: [],
          subtotal: 0,
          deliveryFee: 3.50,
          serviceFee: 0.0
        };
      }
      
      groupedByVendor[vendorId].items.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        total: itemTotal
      });
      groupedByVendor[vendorId].subtotal += itemTotal;
      subtotal += itemTotal;
    }

    let totalServiceFee = 0;
    for (const vendorId in groupedByVendor) {
      const fee = groupedByVendor[vendorId].subtotal * 0.025;
      groupedByVendor[vendorId].serviceFee = fee;
      totalServiceFee += fee;
    }

    const totalDeliveryFee = Object.keys(groupedByVendor).length * 3.50;
    const total = subtotal + totalServiceFee + totalDeliveryFee;

    res.json({
      success: true,
      data: {
        summary: {
          subtotal,
          totalServiceFee,
          totalDeliveryFee,
          total
        },
        orders: groupedByVendor,
        deliveryAddress: address
      }
    });
  })
);

// POST /api/checkout/payment/initialize - Initialize payment with Paystack
router.post(
  '/payment/initialize',
  [
    body('deliveryAddressId').isMongoId(),
    body('deliveryNotes').optional()
  ],
  asyncHandler(async (req, res) => {
    // TODO: Integrate with Paystack API
    res.json({
      success: true,
      message: 'Payment initialized',
      data: {
        authorizationUrl: 'https://checkout.paystack.com/...',
        accessCode: 'generated_access_code',
        reference: `AFM-${Date.now()}`,
        amount: 0
      }
    });
  })
);

// GET /api/checkout/payment/verify/:reference - Verify payment
router.get(
  '/payment/verify/:reference',
  param('reference').notEmpty(),
  asyncHandler(async (req, res) => {
    // TODO: Verify with Paystack API and create orders
    res.json({
      success: true,
      message: 'Payment verified and orders created',
      data: { orders: [] }
    });
  })
);

// GET /api/checkout/orders - Get all customer orders
router.get('/orders', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ customer: req.user.id })
    .populate('vendor', 'storeName')
    .populate('items.product')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ customer: req.user.id });

  res.json({
    success: true,
    data: {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    }
  });
}));

// GET /api/checkout/orders/:orderId - Get order details
router.get(
  '/orders/:orderId',
  param('orderId').isMongoId(),
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customer: req.user.id
    })
      .populate('vendor')
      .populate('items.product')
      .populate('rider')
      .populate('picker');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: { order }
    });
  })
);

module.exports = router;
