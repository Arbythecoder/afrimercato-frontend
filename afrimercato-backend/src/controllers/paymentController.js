// =================================================================
// PAYMENT CONTROLLER - STRIPE INTEGRATION
// =================================================================
// Handles payment processing with Stripe

// Initialize Stripe only if API key is provided
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create a Stripe Payment Intent
 * @access  Private (Customer)
 */
exports.createPaymentIntent = asyncHandler(async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Payment service not configured'
    });
  }

  const { orderId, amount, currency = 'gbp' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount'
    });
  }

  // Create Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to pence/cents
    currency: currency,
    metadata: {
      orderId: orderId || 'pending',
      userId: req.user._id.toString()
    },
    automatic_payment_methods: {
      enabled: true
    }
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  });
});

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment and update order
 * @access  Private (Customer)
 */
exports.confirmPayment = asyncHandler(async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Payment service not configured'
    });
  }

  const { paymentIntentId, orderId } = req.body;

  // Retrieve the payment intent to verify status
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    // Update order status
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        'payment.method': 'stripe',
        'payment.transactionId': paymentIntentId,
        'payment.paidAt': new Date(),
        status: 'confirmed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      status: paymentIntent.status
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Payment not completed',
      status: paymentIntent.status
    });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhooks
 * @access  Public (Stripe)
 */
exports.handleWebhook = asyncHandler(async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Payment service not configured'
    });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);

      // Update order if orderId is in metadata
      if (paymentIntent.metadata.orderId && paymentIntent.metadata.orderId !== 'pending') {
        await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
          paymentStatus: 'paid',
          'payment.transactionId': paymentIntent.id,
          'payment.paidAt': new Date(),
          status: 'confirmed'
        });
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);

      if (failedPayment.metadata.orderId && failedPayment.metadata.orderId !== 'pending') {
        await Order.findByIdAndUpdate(failedPayment.metadata.orderId, {
          paymentStatus: 'failed'
        });
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

/**
 * @route   GET /api/payments/config
 * @desc    Get Stripe publishable key
 * @access  Public
 */
exports.getStripeConfig = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: stripe ? true : false,
    publishableKey: stripe ? process.env.STRIPE_PUBLISHABLE_KEY : null,
    configured: stripe ? true : false
  });
});

/**
 * @route   POST /api/payments/refund
 * @desc    Process refund for an order
 * @access  Private (Admin/Vendor)
 */
exports.processRefund = asyncHandler(async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Payment service not configured'
    });
  }

  const { orderId, amount, reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (!order.payment?.transactionId) {
    return res.status(400).json({
      success: false,
      message: 'No payment transaction found for this order'
    });
  }

  // Create refund
  const refund = await stripe.refunds.create({
    payment_intent: order.payment.transactionId,
    amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
    reason: reason || 'requested_by_customer'
  });

  // Update order
  order.paymentStatus = amount ? 'partially_refunded' : 'refunded';
  order.refund = {
    refundId: refund.id,
    amount: refund.amount / 100,
    reason: reason,
    refundedAt: new Date()
  };
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    refund: {
      id: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    }
  });
});
