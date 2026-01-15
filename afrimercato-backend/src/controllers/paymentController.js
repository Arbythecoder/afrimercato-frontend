// =================================================================
// PAYMENT CONTROLLER - COMPLETE MVP
// =================================================================
// File: src/controllers/paymentController.js
// Handles payment processing and transaction management

const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// =================================================================
// PAYMENT OPERATIONS
// =================================================================

/**
 * @route   POST /api/payment/process
 * @desc    Process payment
 * @access  Private
 */
exports.processPayment = asyncHandler(async (req, res) => {
  const { amount, orderId, paymentMethod, cardDetails } = req.body;

  // Validate inputs
  if (!amount || !orderId || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: 'Amount, order ID, and payment method are required'
    });
  }

  if (paymentMethod === 'card' && !cardDetails) {
    return res.status(400).json({
      success: false,
      message: 'Card details are required for card payments'
    });
  }

  // Get order
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify customer
  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this order'
    });
  }

  // Verify amount
  if (parseFloat(amount) !== parseFloat(order.totalAmount)) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount does not match order total'
    });
  }

  // Process payment based on method
  let transactionRef;
  let paymentStatus = 'pending';

  try {
    switch(paymentMethod) {
      case 'card':
        // In production, integrate with payment gateway (Stripe, PayPal, etc.)
        transactionRef = generateTransactionRef('CARD');
        paymentStatus = 'pending'; // Wait for webhook confirmation
        break;

      case 'mobile_money':
        // Integrate with mobile money provider
        transactionRef = generateTransactionRef('MOMO');
        paymentStatus = 'pending';
        break;

      case 'bank_transfer':
        transactionRef = generateTransactionRef('BANK');
        paymentStatus = 'pending';
        break;

      case 'wallet':
        // Check wallet balance
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
        paymentStatus = 'success';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
    }

    // Update order
    order.paymentMethod = paymentMethod;
    order.transactionRef = transactionRef;
    order.paymentStatus = paymentStatus;

    if (paymentStatus === 'success') {
      order.status = 'processing';
      order.paidAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: paymentStatus === 'success' ? 'Payment successful' : 'Payment initiated',
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

  // Get saved payment methods
  const savedMethods = customer.paymentMethods || [];

  // Available payment methods
  const availableMethods = [
    {
      id: 'card',
      name: 'Debit/Credit Card',
      enabled: true,
      icon: 'card'
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      enabled: true,
      icon: 'mobile',
      providers: ['MTN', 'Vodafone', 'AirtelTigo']
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      enabled: true,
      icon: 'bank'
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

  // Initialize payment methods array
  if (!customer.paymentMethods) {
    customer.paymentMethods = [];
  }

  // Validate card (basic validation)
  if (!validateCardNumber(cardNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid card number'
    });
  }

  // Encrypt sensitive data in production
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

  // Verify user owns this order
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

  // Verify customer
  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized for this order'
    });
  }

  // Check if already refunded or cancelled
  if (order.refundStatus === 'completed' || order.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be refunded'
    });
  }

  // Check if refund request already exists
  if (order.refundStatus === 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Refund request already pending'
    });
  }

  // Only allow refunds for orders within 30 days
  const daysSinceOrder = (Date.now() - order.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSinceOrder > 30) {
    return res.status(400).json({
      success: false,
      message: 'Refund requests must be made within 30 days of order'
    });
  }

  // Create refund request
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
 * @route   POST /api/payment/webhook
 * @desc    Payment gateway webhook handler
 * @access  Public (webhook verification)
 */
exports.handlePaymentWebhook = asyncHandler(async (req, res) => {
  const { transactionRef, status, amount, timestamp, signature } = req.body;

  // Verify webhook signature (implement with your payment gateway)
  // const isValid = verifyWebhookSignature(req.body, signature);
  // if (!isValid) {
  //   return res.status(401).json({ success: false, message: 'Invalid signature' });
  // }

  const order = await Order.findOne({ transactionRef });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Update payment status
  const paymentStatus = status === 'completed' ? 'paid' : status === 'failed' ? 'failed' : 'pending';

  order.paymentStatus = paymentStatus;

  if (paymentStatus === 'paid') {
    order.status = 'processing';
    order.paidAt = Date.now();
  } else if (paymentStatus === 'failed') {
    // Refund if payment failed - restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    order.status = 'payment_failed';
  }

  await order.save();

  // Respond to webhook
  res.status(200).json({
    success: true,
    message: 'Webhook processed'
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

/**
 * Generate transaction reference
 */
function generateTransactionRef(prefix) {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Validate card number using Luhn algorithm
 */
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

/**
 * Mask card number for display
 */
function maskCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  return `****-****-****-${digits.slice(-4)}`;
}
