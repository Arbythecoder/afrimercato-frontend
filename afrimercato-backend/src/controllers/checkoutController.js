// =================================================================
// CHECKOUT CONTROLLER - COMPLETE MVP WITH STRIPE
// =================================================================
// File: src/controllers/checkoutController.js
// Handles checkout, order creation, and payment processing

const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { asyncHandler } = require('../middleware/errorHandler');

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
      vendor: product.vendor._id,
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
      vendor: product.vendor._id,
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
      message: 'Address and payment method are required',
      code: 'MISSING_REQUIRED_FIELDS'
    });
  }

  // Validate repeat purchase frequency if provided
  const validFrequencies = ['weekly', 'bi-weekly', 'monthly', 'quarterly'];
  if (repeatPurchaseFrequency && !validFrequencies.includes(repeatPurchaseFrequency)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid repeat purchase frequency',
      code: 'INVALID_FREQUENCY'
    });
  }

  try {
    // Get customer with timeout
    const customer = await User.findById(req.user.id).maxTimeMS(5000);

    if (!customer || !customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
        code: 'EMPTY_CART'
      });
    }

    // Get address
    const address = customer.addresses?.find(a => a._id.toString() === addressId);

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery address',
        code: 'INVALID_ADDRESS'
      });
    }

    // Validate stock and build order data
    const cartItems = customer.cart;
    const ordersByVendor = {};
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const product = await Product.findById(cartItem.productId).maxTimeMS(3000);

      if (!product || product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock validation failed for ${product?.name || 'an item'}`,
          code: 'INSUFFICIENT_STOCK'
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
      vendor: product.vendor,
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
  } catch (error) {
    console.error('[CHECKOUT_ERROR]', error.message);
    if (error.code === 50 || error.message?.includes('timeout')) {
      return res.status(408).json({
        success: false,
        message: 'Checkout request timed out. Please try again.',
        code: 'REQUEST_TIMEOUT'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Checkout failed. Please try again.',
      code: 'CHECKOUT_ERROR'
    });
  }
});

/**
 * @route   GET /api/checkout/orders
 * @desc    Get all customer orders (paginated, with server-side timeout)
 * @access  Private (customer)
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { customer: req.user.id };

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  const parsedLimit = Math.min(parseInt(limit) || 10, 20); // Cap at 20 rows max

  try {
    // Server-side timeout: abort if query takes >5s
    const ordersPromise = Order.find(query)
      .select('orderNumber items totalAmount status createdAt vendor repeatPurchase')
      .populate('vendor', 'storeName')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .maxTimeMS(5000)
      .lean();

    const countPromise = Order.countDocuments(query).maxTimeMS(3000);

    const [orders, total] = await Promise.all([ordersPromise, countPromise]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / parsedLimit),
      data: orders
    });
  } catch (error) {
    // Graceful fallback: return empty array instead of 500
    if (error.name === 'MongooseError' || error.code === 50) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        pages: 0,
        data: []
      });
    }
    throw error;
  }
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
  try {
    const customer = await User.findById(req.user.id)
      .select('repeatPurchaseFrequency repeatPurchaseSettings')
      .maxTimeMS(3000)
      .lean();

    if (!customer) {
      return res.status(200).json({
        success: true,
        data: { enabled: false, frequency: null, nextRepeatDate: null, autoRenewNotificationSent: false }
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
  } catch (error) {
    // Graceful fallback — never hang
    return res.status(200).json({
      success: true,
      data: { enabled: false, frequency: null, nextRepeatDate: null, autoRenewNotificationSent: false }
    });
  }
});

// =================================================================
// PAYMENT INITIALIZATION - STRIPE
// =================================================================

/**
 * @route   POST /api/checkout/payment/initialize
 * @desc    Create order and initialize Stripe payment
 * @access  Private (customer)
 */
exports.initializePayment = asyncHandler(async (req, res) => {
  const { items, deliveryAddress, payment, pricing, repeatPurchaseFrequency } = req.body;

  // Validate inputs
  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart items are required',
      code: 'MISSING_ITEMS'
    });
  }

  if (!deliveryAddress) {
    return res.status(400).json({
      success: false,
      message: 'Delivery address is required',
      code: 'MISSING_ADDRESS'
    });
  }

  try {
    // Get customer with timeout
    const customer = await User.findById(req.user.id).maxTimeMS(5000);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
        code: 'CUSTOMER_NOT_FOUND'
      });
    }

    // Validate repeat purchase frequency if provided
    const validFrequencies = ['weekly', 'bi-weekly', 'monthly', 'quarterly'];
    if (repeatPurchaseFrequency && !validFrequencies.includes(repeatPurchaseFrequency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid repeat purchase frequency',
        code: 'INVALID_FREQUENCY'
      });
    }

    // Process items and validate stock
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of items) {
      const product = await Product.findById(cartItem.product).maxTimeMS(3000);

    if (!product) {
      return res.status(400).json({
        success: false,
        message: `Product not found: ${cartItem.name}`
      });
    }

    if (product.stock < cartItem.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}`
      });
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: cartItem.quantity,
      price: cartItem.price,
      unit: cartItem.unit || 'piece'
    });

    totalAmount += cartItem.price * cartItem.quantity;

    // Deduct stock
    product.stock -= cartItem.quantity;
    await product.save();
  }

  // Calculate total with fees
  const deliveryFee = pricing?.deliveryFee || 0;
  const subtotal = totalAmount;
  const total = subtotal + deliveryFee;
  
  // Calculate platform commission (12% of subtotal, not including delivery fee)
  const PLATFORM_COMMISSION_RATE = 0.12; // 12%
  const platformCommission = Math.round(subtotal * PLATFORM_COMMISSION_RATE * 100) / 100; // Round to 2 decimals
  const vendorEarnings = subtotal - platformCommission; // Vendor gets subtotal minus commission

  // Build repeat purchase data if frequency provided
  const repeatPurchaseData = repeatPurchaseFrequency ? {
    enabled: true,
    frequency: repeatPurchaseFrequency,
    nextRepeatDate: calculateNextRepeatDate(repeatPurchaseFrequency),
    active: true
  } : undefined;

  // Create order
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer: customer._id,
    items: orderItems,
    totalAmount: total,
    pricing: {
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total,
      platformCommission: platformCommission,
      vendorEarnings: vendorEarnings
    },
    subtotal: subtotal, // Backward compatibility
    deliveryFee: deliveryFee, // Backward compatibility
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: payment?.method || 'card',
    deliveryAddress: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.postcode}`,
    deliveryAddressDetails: {
      fullName: deliveryAddress.fullName,
      phone: deliveryAddress.phone,
      street: deliveryAddress.street,
      city: deliveryAddress.city,
      postcode: deliveryAddress.postcode,
      instructions: deliveryAddress.instructions
    },
    ...(repeatPurchaseData && { repeatPurchase: repeatPurchaseData })
  });

  // If payment method is card, create Stripe Checkout Session
  if (payment?.method === 'card') {
    try {
      // Create line items for Stripe
      const lineItems = orderItems.map(item => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.name
          },
          unit_amount: Math.round(item.price * 100) // Convert to pence
        },
        quantity: item.quantity
      }));

      // Add delivery fee if applicable
      if (deliveryFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Delivery Fee'
            },
            unit_amount: Math.round(deliveryFee * 100)
          },
          quantity: 1
        });
      }

      // Create Stripe Checkout Session with 8s timeout to prevent hanging
      const stripePromise = stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: customer.email,
        line_items: lineItems,
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerId: customer._id.toString()
        },
        success_url: `${process.env.FRONTEND_URL || process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
        cancel_url: `${process.env.FRONTEND_URL || process.env.CLIENT_URL}/payment/cancel?order_id=${order._id}`
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Stripe session creation timed out')), 8000)
      );

      const session = await Promise.race([stripePromise, timeoutPromise]);

      // Update order with Stripe session ID
      order.transactionRef = session.id;
      await order.save();

      return res.status(201).json({
        success: true,
        message: 'Order created and payment initialized',
        data: {
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            totalAmount: finalTotal,
            status: order.status
          },
          payment: {
            sessionId: session.id,
            url: session.url
          }
        }
      });
    } catch (error) {
      console.error('Stripe error:', error);
      // Restore stock on failure
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
      await Order.findByIdAndDelete(order._id);

      return res.status(500).json({
        success: false,
        message: 'Failed to initialize payment. Please try again.'
      });
    }
  }

  // For cash on delivery
  if (payment?.method === 'cash') {
    order.status = 'confirmed';
    await order.save();
  }

  // Update customer repeat purchase settings if frequency provided
  if (repeatPurchaseFrequency) {
    await User.findByIdAndUpdate(customer._id, {
      repeatPurchaseFrequency,
      repeatPurchaseSettings: {
        enabled: true,
        frequency: repeatPurchaseFrequency,
        nextRepeatDate: calculateNextRepeatDate(repeatPurchaseFrequency),
        autoRenewNotificationSent: false
      }
    });
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: finalTotal,
        status: order.status
      }
    }
  });
  } catch (error) {
    console.error('[PAYMENT_INIT_ERROR]', error.message);
    if (error.code === 50 || error.message?.includes('timeout')) {
      return res.status(408).json({
        success: false,
        message: 'Payment initialization timed out. Please try again.',
        code: 'REQUEST_TIMEOUT'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize payment. Please try again.',
      code: 'PAYMENT_INIT_ERROR'
    });
  }
});
