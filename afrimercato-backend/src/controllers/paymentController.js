// =================================================================
// PAYMENT CONTROLLER - STRIPE INTEGRATION
// =================================================================
// File: src/controllers/paymentController.js
// Handles payment processing with Stripe

const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// =================================================================
// STRIPE PAYMENT OPERATIONS
// =================================================================

/**
 * @route   POST /api/payment/stripe/create-checkout-session
 * @desc    Create Stripe Checkout Session
 * @access  Private
 */
exports.createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'Order ID is required'
    });
  }

  // Find order
  const order = await Order.findById(orderId).populate('items.product');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify customer owns order
  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this order'
    });
  }

  // Get customer email
  const customer = await User.findById(req.user.id);

  try {
    // Create line items for Stripe
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name || item.product?.name || 'Product',
          description: `Quantity: ${item.quantity}`
        },
        unit_amount: Math.round(item.price * 100) // Convert to pence
      },
      quantity: item.quantity
    }));

    // Add delivery fee if applicable
    if (order.deliveryFee && order.deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Delivery Fee'
          },
          unit_amount: Math.round(order.deliveryFee * 100)
        },
        quantity: 1
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customer.email,
      line_items: lineItems,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: req.user.id
      },
      success_url: `${process.env.FRONTEND_URL || process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${process.env.FRONTEND_URL || process.env.CLIENT_URL}/payment/cancel?order_id=${order._id}`
    });

    // Update order with Stripe session ID
    order.transactionRef = session.id;
    order.paymentMethod = 'card';
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Stripe session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment session'
    });
  }
});

/**
 * @route   POST /api/payment/stripe/create-payment-intent
 * @desc    Create Stripe Payment Intent for inline checkout
 * @access  Private
 */
exports.createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Order ID and amount are required'
    });
  }

  // Find order
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify customer owns order
  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this order'
    });
  }

  try {
    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to pence
      currency: 'gbp',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: req.user.id
      }
    });

    // Update order with payment intent ID
    order.transactionRef = paymentIntent.id;
    order.paymentMethod = 'card';
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Payment Intent error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

/**
 * @route   GET /api/payment/stripe/verify/:sessionId
 * @desc    Verify Stripe payment session
 * @access  Private
 */
exports.verifyStripePayment = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required'
    });
  }

  try {
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Find order
    const order = await Order.findOne({ transactionRef: sessionId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order based on payment status
    if (session.payment_status === 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paidAt = new Date();
      order.paymentDetails = {
        gateway: 'stripe',
        sessionId: session.id,
        paymentIntent: session.payment_intent,
        amountPaid: session.amount_total / 100
      };
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: 'success',
          amount: session.amount_total / 100
        }
      });
    }

    return res.status(200).json({
      success: false,
      message: 'Payment not completed',
      data: {
        status: session.payment_status
      }
    });
  } catch (error) {
    console.error('Stripe verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

/**
 * @route   POST /api/payment/webhook
 * @desc    Stripe webhook handler
 * @access  Public (webhook verification)
 */
exports.handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const order = await Order.findOne({ transactionRef: session.id });

      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.paidAt = new Date();
        order.paymentDetails = {
          gateway: 'stripe',
          sessionId: session.id,
          paymentIntent: session.payment_intent,
          amountPaid: session.amount_total / 100
        };
        await order.save();
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const order = await Order.findOne({ transactionRef: paymentIntent.id });

      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.paidAt = new Date();
        await order.save();
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const order = await Order.findOne({ transactionRef: paymentIntent.id });

      if (order) {
        order.paymentStatus = 'failed';
        order.status = 'payment_failed';

        // Restore stock
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }
        await order.save();
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// =================================================================
// LEGACY PAYMENT OPERATIONS
// =================================================================

/**
 * @route   POST /api/payment/process
 * @desc    Process payment (legacy - for wallet/cash)
 * @access  Private
 */
exports.processPayment = asyncHandler(async (req, res) => {
  const { amount, orderId, paymentMethod } = req.body;

  if (!amount || !orderId || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: 'Amount, order ID, and payment method are required'
    });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this order'
    });
  }

  let transactionRef;
  let paymentStatus = 'pending';

  try {
    switch(paymentMethod) {
      case 'wallet':
        const customer = await User.findById(req.user.id);
        if (!customer.walletBalance || customer.walletBalance < amount) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient wallet balance'
          });
        }
        customer.walletBalance -= amount;
        await customer.save();
        transactionRef = generateTransactionRef('WALLET');
        paymentStatus = 'paid';
        break;

      case 'cash':
        transactionRef = generateTransactionRef('CASH');
        paymentStatus = 'pending'; // Will be marked paid on delivery
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'For card payments, use /api/payment/stripe/create-checkout-session'
        });
    }

    order.paymentMethod = paymentMethod;
    order.transactionRef = transactionRef;
    order.paymentStatus = paymentStatus;

    if (paymentStatus === 'paid') {
      order.status = 'confirmed';
      order.paidAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: paymentStatus === 'paid' ? 'Payment successful' : 'Order confirmed',
      data: {
        orderId: order._id,
        transactionRef,
        paymentStatus,
        amount
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payment/methods
 * @desc    Get available payment methods
 * @access  Private
 */
exports.getPaymentMethods = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  const savedMethods = customer.paymentMethods || [];

  const availableMethods = [
    {
      id: 'card',
      name: 'Debit/Credit Card',
      description: 'Pay securely with Stripe',
      enabled: true,
      icon: 'card'
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      enabled: true,
      icon: 'cash'
    },
    {
      id: 'wallet',
      name: 'Wallet',
      enabled: true,
      icon: 'wallet',
      balance: customer.walletBalance || 0
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      available: availableMethods,
      saved: savedMethods
    }
  });
});

/**
 * @route   POST /api/payment/methods/add
 * @desc    Add a new payment method
 * @access  Private
 */
exports.addPaymentMethod = asyncHandler(async (req, res) => {
  const { type, cardNumber, expiryDate, cvv, cardholderName } = req.body;

  if (!type || !cardNumber || !expiryDate || !cvv || !cardholderName) {
    return res.status(400).json({
      success: false,
      message: 'All card fields are required'
    });
  }

  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  if (!customer.paymentMethods) {
    customer.paymentMethods = [];
  }

  if (!validateCardNumber(cardNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid card number'
    });
  }

  const newMethod = {
    _id: new require('mongoose').Types.ObjectId(),
    type: 'card',
    cardNumber: maskCardNumber(cardNumber),
    expiryDate,
    cardholderName,
    isDefault: customer.paymentMethods.length === 0,
    createdAt: Date.now()
  };

  customer.paymentMethods.push(newMethod);
  await customer.save();

  res.status(201).json({
    success: true,
    message: 'Payment method added',
    data: newMethod
  });
});

/**
 * @route   GET /api/payment/status/:transactionId
 * @desc    Get payment status
 * @access  Private
 */
exports.getPaymentStatus = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const order = await Order.findOne({ transactionRef: transactionId });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this transaction'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      transactionId,
      orderId: order._id,
      amount: order.totalAmount,
      status: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      paidAt: order.paidAt
    }
  });
});

/**
 * @route   POST /api/payment/refund/:orderId
 * @desc    Request refund for order
 * @access  Private
 */
exports.requestRefund = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason, details } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized for this order'
    });
  }

  if (order.refundStatus === 'completed' || order.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be refunded'
    });
  }

  if (order.refundStatus === 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Refund request already pending'
    });
  }

  const daysSinceOrder = (Date.now() - order.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSinceOrder > 30) {
    return res.status(400).json({
      success: false,
      message: 'Refund requests must be made within 30 days of order'
    });
  }

  order.refundRequest = {
    reason,
    details,
    requestedAt: Date.now(),
    status: 'pending'
  };

  order.refundStatus = 'pending';
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Refund request submitted',
    data: {
      orderId: order._id,
      refundAmount: order.totalAmount,
      status: 'pending'
    }
  });
});

/**
 * @route   GET /api/payment/transactions
 * @desc    Get customer transaction history
 * @access  Private
 */
exports.getTransactionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ customer: req.user.id })
    .select('orderNumber totalAmount paymentStatus paymentMethod transactionRef createdAt paidAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments({ customer: req.user.id });

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limit),
    data: orders
  });
});

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function generateTransactionRef(prefix) {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function validateCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

function maskCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  return `****-****-****-${digits.slice(-4)}`;
}
