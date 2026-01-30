// =================================================================
// PAYMENT CONTROLLER - STRIPE INTEGRATION
// =================================================================
// PRODUCTION-READY: Properly handles missing API keys, validates webhooks
// File: src/controllers/paymentController.js

const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// =================================================================
// STRIPE INITIALIZATION - PRODUCTION-READY
// =================================================================
// CRITICAL: Fail gracefully if Stripe key is not configured
let stripe = null;
let stripeConfigured = false;

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.length > 0) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    stripeConfigured = true;
    console.log('✓ Stripe payment integration initialized');
  } catch (error) {
    console.error('✗ Stripe initialization failed:', error.message);
    stripeConfigured = false;
  }
} else {
  console.warn('⚠️  Stripe Secret Key not configured. Payment features will be disabled.');
  console.warn('   Set STRIPE_SECRET_KEY environment variable to enable payments.');
  stripeConfigured = false;
}

// =================================================================
// MIDDLEWARE - ENSURE STRIPE IS CONFIGURED
// =================================================================
const ensureStripeConfigured = (req, res, next) => {
  if (!stripeConfigured || !stripe) {
    return res.status(503).json({
      success: false,
      message: 'Payment system is not configured. Please contact support.',
      errorCode: 'PAYMENTS_NOT_CONFIGURED',
      userMessage: 'Online payments are currently unavailable. Please try again later or contact support.'
    });
  }
  next();
};

// =================================================================
// STRIPE PAYMENT OPERATIONS
// =================================================================

/**
 * @route   POST /api/payments/stripe/create-checkout-session
 * @desc    Create Stripe Checkout Session
 * @access  Private
 */
exports.createCheckoutSession = [ensureStripeConfigured, asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'Order ID is required',
      errorCode: 'MISSING_ORDER_ID'
    });
  }

  // Find order
  const order = await Order.findById(orderId).populate('items.product');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
      errorCode: 'ORDER_NOT_FOUND'
    });
  }

  // Verify customer owns order
  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this order',
      errorCode: 'UNAUTHORIZED'
    });
  }

  // Check if order is already paid
  if (order.paymentStatus === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Order has already been paid',
      errorCode: 'ALREADY_PAID'
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
          description: item.product?.description || `Quantity: ${item.quantity}`,
          images: item.product?.images ? [item.product.images[0]] : []
        },
        unit_amount: Math.round((item.price || 0) * 100) // Convert to pence
      },
      quantity: item.quantity
    }));

    // Add delivery fee if applicable
    if (order.pricing?.deliveryFee && order.pricing.deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Delivery Fee',
            description: 'Home delivery service'
          },
          unit_amount: Math.round(order.pricing.deliveryFee * 100)
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
        customerId: req.user.id,
        vendorId: order.vendor ? order.vendor.toString() : ''
      },
      success_url: `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000'}/payment/cancel?order_id=${order._id}`
    });

    // Update order with Stripe session ID
    order.payment = order.payment || {};
    order.payment.transactionRef = session.id;
    order.payment.provider = 'stripe';
    order.paymentMethod = 'card';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment session created successfully',
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment session',
      errorCode: 'STRIPE_SESSION_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
})];

/**
 * @route   POST /api/payments/stripe/create-payment-intent
 * @desc    Create Stripe Payment Intent for inline checkout
 * @access  Private
 */
exports.createPaymentIntent = [ensureStripeConfigured, asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Order ID and amount are required',
      errorCode: 'MISSING_PARAMETERS'
    });
  }

  // Find order
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
      errorCode: 'ORDER_NOT_FOUND'
    });
  }

  // Verify customer owns order
  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this order',
      errorCode: 'UNAUTHORIZED'
    });
  }

  // Validate amount matches order total
  const expectedAmount = order.pricing?.total || order.totalAmount || 0;
  if (Math.abs(amount - expectedAmount) > 0.01) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount does not match order total',
      errorCode: 'AMOUNT_MISMATCH'
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
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    // Update order with payment intent
    order.payment = order.payment || {};
    order.payment.intentId = paymentIntent.id;
    order.payment.provider = 'stripe';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret,
        intentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      errorCode: 'STRIPE_INTENT_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
})];

/**
 * @route   GET /api/payments/stripe/verify/:sessionId
 * @desc    Verify Stripe payment session
 * @access  Private
 */
exports.verifyStripePayment = [ensureStripeConfigured, asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required',
      errorCode: 'MISSING_SESSION_ID'
    });
  }

  try {
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Payment session not found',
        errorCode: 'SESSION_NOT_FOUND'
      });
    }

    // Find order
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID not found in session',
        errorCode: 'MISSING_ORDER_ID'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND'
      });
    }

    // Update order based on payment status
    if (session.payment_status === 'paid') {
      order.paymentStatus = 'paid';
      order.payment = order.payment || {};
      order.payment.paidAt = new Date();
      order.payment.transactionRef = session.id;
      order.payment.paymentIntentId = session.payment_intent;
      await order.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentStatus: 'paid',
          order: {
            id: order._id,
            orderNumber: order.orderNumber,
            total: order.pricing?.total || order.totalAmount
          }
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Payment not completed',
        data: {
          paymentStatus: session.payment_status,
          order: {
            id: order._id,
            orderNumber: order.orderNumber
          }
        }
      });
    }
  } catch (error) {
    console.error('Stripe verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      errorCode: 'VERIFICATION_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
})];

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (verified by Stripe signature)
 */
exports.handleStripeWebhook = asyncHandler(async (req, res) => {
  // If Stripe is not configured, return 503
  if (!stripeConfigured || !stripe) {
    console.warn('Webhook received but Stripe is not configured');
    return res.status(503).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        await handlePaymentIntentFailed(failedIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).send('Webhook handler failed');
  }
});

// =================================================================
// WEBHOOK EVENT HANDLERS
// =================================================================

async function handleCheckoutSessionCompleted(session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error('No order ID in session metadata');
    return;
  }

  const order = await Order.findById(orderId);

  if (!order) {
    console.error('Order not found:', orderId);
    return;
  }

  // Update order payment status
  order.paymentStatus = 'paid';
  order.payment = order.payment || {};
  order.payment.paidAt = new Date();
  order.payment.transactionRef = session.id;
  order.payment.paymentIntentId = session.payment_intent;
  order.payment.provider = 'stripe';

  // Update order status to confirmed
  if (order.status === 'pending') {
    order.status = 'confirmed';
  }

  await order.save();

  console.log(`✓ Payment confirmed for order ${order.orderNumber}`);
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.error('No order ID in payment intent metadata');
    return;
  }

  const order = await Order.findById(orderId);

  if (!order) {
    console.error('Order not found:', orderId);
    return;
  }

  order.paymentStatus = 'paid';
  order.payment = order.payment || {};
  order.payment.paidAt = new Date();
  order.payment.paymentIntentId = paymentIntent.id;
  order.payment.provider = 'stripe';

  await order.save();

  console.log(`✓ Payment intent succeeded for order ${order.orderNumber}`);
}

async function handlePaymentIntentFailed(paymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.error('No order ID in payment intent metadata');
    return;
  }

  const order = await Order.findById(orderId);

  if (!order) {
    console.error('Order not found:', orderId);
    return;
  }

  order.paymentStatus = 'failed';
  order.payment = order.payment || {};
  order.payment.failedAt = new Date();
  order.payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';

  await order.save();

  console.log(`✗ Payment failed for order ${order.orderNumber}`);
}

// =================================================================
// BASIC PAYMENT OPERATIONS (for backward compatibility)
// =================================================================

/**
 * @route   POST /api/payments/process
 * @desc    Process payment (backward compatibility)
 * @access  Private
 */
exports.processPayment = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Please use /stripe/create-checkout-session or /stripe/create-payment-intent',
    redirectTo: '/api/payments/stripe/create-checkout-session'
  });
});

/**
 * @route   GET /api/payments/methods
 * @desc    Get saved payment methods
 * @access  Private
 */
exports.getPaymentMethods = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      methods: [],
      message: 'Payment methods feature coming soon'
    }
  });
});

/**
 * @route   POST /api/payments/methods/add
 * @desc    Add payment method
 * @access  Private
 */
exports.addPaymentMethod = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Payment methods feature coming soon'
  });
});

/**
 * @route   GET /api/payments/status/:transactionId
 * @desc    Get payment status
 * @access  Private
 */
exports.getPaymentStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Payment status check feature coming soon'
  });
});

/**
 * @route   POST /api/payments/refund/:orderId
 * @desc    Request refund
 * @access  Private
 */
exports.requestRefund = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Refund feature coming soon'
  });
});

/**
 * @route   GET /api/payments/transactions
 * @desc    Get transaction history
 * @access  Private
 */
exports.getTransactionHistory = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      transactions: [],
      message: 'Transaction history feature coming soon'
    }
  });
});
