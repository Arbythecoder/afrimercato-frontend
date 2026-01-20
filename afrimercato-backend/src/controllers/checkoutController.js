// =================================================================
// CHECKOUT CONTROLLER - COMPLETE MVP
// =================================================================
// File: src/controllers/checkoutController.js
// Handles checkout, order creation, and payment processing

const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { asyncHandler } = require('../middleware/errorHandler');

// Helper to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// =================================================================
// CHECKOUT OPERATIONS
// =================================================================

/**
 * @route   POST /api/checkout/preview
 * @desc    Preview order before payment
 * @access  Private (customer)
 */
exports.previewOrder = asyncHandler(async (req, res) => {
  const { addressId, couponCode } = req.body;

  // Get customer and cart
  const customer = await User.findById(req.user.id);

  if (!customer || !customer.cart || customer.cart.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  // Get delivery address
  const address = customer.addresses?.find(a => a._id.toString() === addressId);

  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'Delivery address is required'
    });
  }

  // Validate cart items and build order preview
  const orderItems = [];
  let subtotal = 0;
  const vendorGroups = {};

  for (const cartItem of customer.cart) {
    const product = await Product.findById(cartItem.productId).populate('vendor');

    if (!product) {
      continue;
    }

    if (product.stock < cartItem.quantity) {
      return res.status(400).json({
        success: false,
        message: `${product.name} has insufficient stock`
      });
    }

    const itemTotal = product.price * cartItem.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      productName: product.name,
      quantity: cartItem.quantity,
      price: product.price,
      total: itemTotal
    });

    // Group items by vendor
    const vendorId = product.vendor._id.toString();
    if (!vendorGroups[vendorId]) {
      vendorGroups[vendorId] = {
        vendor: product.vendor._id,
        vendorName: product.vendor.storeName,
        items: [],
        subtotal: 0,
        estimatedDelivery: calculateDeliveryDays(product.vendor.location || {})
      };
    }

    vendorGroups[vendorId].items.push({
      product: product._id,
      productName: product.name,
      quantity: cartItem.quantity,
      price: product.price,
      total: itemTotal
    });

    vendorGroups[vendorId].subtotal += itemTotal;
  }

  if (orderItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid items in cart'
    });
  }

  // Calculate charges
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
  const deliveryFee = 5; // Fixed delivery fee for MVP
  const discount = couponCode ? 2 : 0; // Fixed discount for MVP
  const total = Math.round((subtotal + tax + deliveryFee - discount) * 100) / 100;

  // Build preview
  const preview = {
    orderNumber: generateOrderNumber(),
    items: orderItems,
    vendors: Object.values(vendorGroups),
    deliveryAddress: {
      label: address.label,
      street: address.street,
      city: address.city,
      postcode: address.postcode,
      landmark: address.landmark
    },
    charges: {
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      deliveryFee,
      discount,
      total
    },
    itemCount: customer.cart.reduce((sum, item) => sum + item.quantity, 0),
    estimatedDelivery: '2-3 business days'
  };

  res.status(200).json({
    success: true,
    data: preview
  });
});

/**
 * @route   POST /api/checkout/process
 * @desc    Process payment and create order
 * @access  Private (customer)
 */
exports.processCheckout = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod, transactionRef, repeatPurchaseFrequency } = req.body;

  // Validate inputs
  if (!addressId || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: 'Address and payment method are required'
    });
  }

  // Validate repeat purchase frequency if provided
  const validFrequencies = ['weekly', 'bi-weekly', 'monthly', 'quarterly'];
  if (repeatPurchaseFrequency && !validFrequencies.includes(repeatPurchaseFrequency)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid repeat purchase frequency'
    });
  }

  // Get customer
  const customer = await User.findById(req.user.id);

  if (!customer || !customer.cart || customer.cart.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  // Get address
  const address = customer.addresses?.find(a => a._id.toString() === addressId);

  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'Invalid delivery address'
    });
  }

  // Validate stock and build order data
  const cartItems = customer.cart;
  const ordersByVendor = {};
  let totalAmount = 0;

  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.productId);

    if (!product || product.stock < cartItem.quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock validation failed for ${product?.name || 'an item'}`
      });
    }

    const itemTotal = product.price * cartItem.quantity;
    totalAmount += itemTotal;

    const vendorId = product.vendor.toString();
    if (!ordersByVendor[vendorId]) {
      ordersByVendor[vendorId] = {
        vendor: product.vendor,
        items: [],
        subtotal: 0
      };
    }

    ordersByVendor[vendorId].items.push({
      product: product._id,
      quantity: cartItem.quantity,
      price: product.price
    });

    ordersByVendor[vendorId].subtotal += itemTotal;

    // Reduce stock
    product.stock -= cartItem.quantity;
    await product.save();
  }

  // Calculate charges
  const tax = Math.round(totalAmount * 0.05 * 100) / 100;
  const deliveryFee = 5;
  const finalTotal = Math.round((totalAmount + tax + deliveryFee) * 100) / 100;

  // Create orders for each vendor
  const createdOrders = [];

  for (const vendorId in ordersByVendor) {
    const vendorOrder = ordersByVendor[vendorId];

    // Build repeat purchase data if frequency provided
    const repeatPurchaseData = repeatPurchaseFrequency ? {
      enabled: true,
      frequency: repeatPurchaseFrequency,
      nextRepeatDate: calculateNextRepeatDate(repeatPurchaseFrequency)
    } : undefined;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: customer._id,
      vendor: vendorOrder.vendor,
      items: vendorOrder.items,
      totalAmount: vendorOrder.subtotal + (tax * vendorOrder.subtotal / totalAmount),
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      transactionRef,
      deliveryAddress: `${address.street}, ${address.city}, ${address.postcode}`,
      deliveryAddressDetails: {
        label: address.label,
        street: address.street,
        city: address.city,
        postcode: address.postcode,
        landmark: address.landmark
      },
      ...(repeatPurchaseData && { repeatPurchase: repeatPurchaseData })
    });

    createdOrders.push(order);
  }

  // Update customer repeat purchase settings if frequency provided
  if (repeatPurchaseFrequency) {
    await User.findByIdAndUpdate(
      customer._id,
      {
        repeatPurchaseFrequency: repeatPurchaseFrequency,
        repeatPurchaseSettings: {
          enabled: true,
          frequency: repeatPurchaseFrequency,
          nextRepeatDate: calculateNextRepeatDate(repeatPurchaseFrequency),
          autoRenewNotificationSent: false
        }
      }
    );
  }

  // Clear cart
  customer.cart = [];
  await customer.save();

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      orderCount: createdOrders.length,
      totalAmount: finalTotal,
      orders: createdOrders.map(o => ({
        orderId: o._id,
        orderNumber: o.orderNumber,
        status: o.status
      }))
    }
  });
});

/**
 * @route   GET /api/checkout/orders
 * @desc    Get all customer orders (paginated)
 * @access  Private (customer)
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { customer: req.user.id };

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('vendor', 'storeName logo')
    .populate('items.product', 'name price images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limit),
    data: orders
  });
});

/**
 * @route   GET /api/checkout/orders/:orderId
 * @desc    Get order details
 * @access  Private (customer)
 */
exports.getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate('customer', 'name email phone')
    .populate('vendor', 'storeName logo location.address phone')
    .populate('items.product', 'name price images unit')
    .populate('rider', 'name phone')
    .populate('picker', 'name phone');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify customer owns order
  if (order.customer._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this order'
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @route   POST /api/checkout/webhook/payment
 * @desc    Handle payment gateway webhook
 * @access  Public (webhook verification)
 */
exports.handlePaymentWebhook = asyncHandler(async (req, res) => {
  const { transactionRef, status, amount } = req.body;

  if (!transactionRef || !status) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook payload'
    });
  }

  // Find orders with this transaction ref
  const orders = await Order.find({ transactionRef });

  if (orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No orders found for this transaction'
    });
  }

  // Update order status
  const paymentStatus = status === 'success' ? 'paid' : status === 'failed' ? 'failed' : 'pending';

  for (const order of orders) {
    order.paymentStatus = paymentStatus;

    if (paymentStatus === 'paid') {
      order.status = 'processing';
    } else if (paymentStatus === 'failed') {
      // Restore stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
      order.status = 'cancelled';
    }

    await order.save();
  }

  res.status(200).json({
    success: true,
    message: 'Webhook processed'
  });
});

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Calculate estimated delivery days based on vendor location
 */
function calculateDeliveryDays(location) {
  // For MVP, return fixed estimate
  // In production, this would be based on actual distance/location
  return '2-3 business days';
}

/**
 * Calculate next repeat purchase date based on frequency
 */
function calculateNextRepeatDate(frequency) {
  const today = new Date();
  const daysToAdd = {
    'weekly': 7,
    'bi-weekly': 14,
    'monthly': 30,
    'quarterly': 90
  };
  
  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + (daysToAdd[frequency] || 7));
  return nextDate;
}

// =================================================================
// REPEAT PURCHASE OPERATIONS
// =================================================================

/**
 * @route   POST /api/checkout/repeat-purchase/set
 * @desc    Set or update repeat purchase subscription for customer
 * @access  Private (customer)
 */
exports.setRepeatPurchase = asyncHandler(async (req, res) => {
  const { frequency, orderId } = req.body;

  // Validate frequency
  const validFrequencies = ['weekly', 'bi-weekly', 'monthly', 'quarterly'];
  if (!frequency || !validFrequencies.includes(frequency)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid repeat purchase frequency. Valid options: weekly, bi-weekly, monthly, quarterly'
    });
  }

  // Update customer repeat purchase settings
  const customer = await User.findByIdAndUpdate(
    req.user.id,
    {
      repeatPurchaseFrequency: frequency,
      repeatPurchaseSettings: {
        enabled: true,
        frequency: frequency,
        nextRepeatDate: calculateNextRepeatDate(frequency),
        autoRenewNotificationSent: false
      },
      updatedAt: new Date()
    },
    { new: true }
  );

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // If orderId provided, update that specific order as well
  if (orderId) {
    await Order.findByIdAndUpdate(
      orderId,
      {
        repeatPurchase: {
          enabled: true,
          frequency: frequency,
          nextRepeatDate: calculateNextRepeatDate(frequency)
        }
      },
      { new: true }
    );
  }

  return res.status(200).json({
    success: true,
    message: 'Repeat purchase subscription activated',
    data: {
      frequency: frequency,
      nextRepeatDate: calculateNextRepeatDate(frequency),
      message: `Your order will automatically repeat ${frequency} until you cancel.`
    }
  });
});

/**
 * @route   GET /api/checkout/repeat-purchase/settings
 * @desc    Get customer's repeat purchase settings
 * @access  Private (customer)
 */
exports.getRepeatPurchaseSettings = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user.id).select(
    'repeatPurchaseFrequency repeatPurchaseSettings'
  );

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      enabled: customer.repeatPurchaseSettings?.enabled || false,
      frequency: customer.repeatPurchaseSettings?.frequency || null,
      nextRepeatDate: customer.repeatPurchaseSettings?.nextRepeatDate || null,
      autoRenewNotificationSent: customer.repeatPurchaseSettings?.autoRenewNotificationSent || false
    }
  });
});
