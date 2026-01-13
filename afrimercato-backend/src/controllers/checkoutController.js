/**
 * Checkout Controller
 * Handles order creation and Paystack payment integration
 * Multi-vendor order processing like Jumia/Konga
 */

const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');
const { sendPaymentFailureEmail } = require('../utils/emailService');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Initialize checkout
 * POST /api/checkout/initialize
 */
exports.initializeCheckout = async (req, res) => {
  try {
    const { deliveryAddressId, paymentMethodId, deliveryNotes } = req.body;

    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Get cart
    const cart = await Cart.findOne({ customer: customer._id })
      .populate('items.product', 'name price stock inStock vendor')
      .populate('items.vendor', 'businessName address');

    if (!cart || cart.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    // Validate stock for all items
    const stockIssues = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product.inStock || product.stock < item.quantity) {
        stockIssues.push({
          productId: product._id,
          productName: product.name,
          requested: item.quantity,
          available: product.stock
        });
      }
    }

    if (stockIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items in your cart are out of stock or have insufficient stock',
        stockIssues
      });
    }

    // Validate delivery address
    const deliveryAddress = customer.addresses.id(deliveryAddressId);
    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid delivery address'
      });
    }

    // Create checkout session
    const checkoutSession = {
      customer: customer._id,
      cart: cart._id,
      deliveryAddress: {
        label: deliveryAddress.label,
        street: deliveryAddress.street,
        apartment: deliveryAddress.apartment,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        postcode: deliveryAddress.postcode,
        country: deliveryAddress.country,
        coordinates: deliveryAddress.coordinates,
        deliveryInstructions: deliveryNotes || deliveryAddress.deliveryInstructions
      },
      pricing: cart.pricing,
      groupedByVendor: cart.groupByVendor(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    };

    res.json({
      success: true,
      message: 'Checkout initialized',
      data: {
        checkoutSession,
        canProceed: true
      }
    });

    console.log(`✅ Checkout initialized for customer ${customer._id}`);
  } catch (error) {
    console.error('Initialize checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize checkout',
      error: error.message
    });
  }
};

/**
 * Initialize Paystack payment
 * POST /api/checkout/payment/initialize
 */
exports.initializePayment = async (req, res) => {
  try {
    const { deliveryAddressId, deliveryNotes } = req.body;

    const customer = await Customer.findOne({ user: req.user._id })
      .populate('user', 'email name');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Get cart
    const cart = await Cart.findOne({ customer: customer._id })
      .populate('items.product', 'name price stock inStock vendor')
      .populate('items.vendor', 'businessName');

    if (!cart || cart.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    // Final stock validation
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product.inStock || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock or has insufficient quantity`
        });
      }
    }

    // Validate delivery address
    const deliveryAddress = customer.addresses.id(deliveryAddressId);
    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid delivery address'
      });
    }

    // Initialize Paystack payment
    const amount = Math.round(cart.pricing.total * 100); // Convert to kobo/cents
    const reference = `AFM-${Date.now()}-${customer._id.toString().slice(-6)}`;

    const paystackData = {
      email: customer.user.email,
      amount,
      reference,
      currency: 'EUR', // Irish Euro
      callback_url: `${process.env.FRONTEND_URL}/checkout/verify`,
      metadata: {
        customer_id: customer._id.toString(),
        customer_name: customer.user.name,
        cart_id: cart._id.toString(),
        delivery_address_id: deliveryAddressId,
        delivery_notes: deliveryNotes || '',
        order_items: cart.items.length,
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: customer.user.name
          },
          {
            display_name: 'Cart Total',
            variable_name: 'cart_total',
            value: `€${cart.pricing.total.toFixed(2)}`
          }
        ]
      }
    };

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      paystackData,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      res.json({
        success: true,
        message: 'Payment initialized',
        data: {
          authorizationUrl: response.data.data.authorization_url,
          accessCode: response.data.data.access_code,
          reference: response.data.data.reference,
          amount: cart.pricing.total
        }
      });

      console.log(`💳 Payment initialized: ${reference}`);
    } else {
      throw new Error('Paystack initialization failed');
    }
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * Verify Paystack payment
 * GET /api/checkout/payment/verify/:reference
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify payment with Paystack
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (!response.data.status || response.data.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        paymentStatus: response.data.data.status
      });
    }

    const paymentData = response.data.data;
    const metadata = paymentData.metadata;

    // Get customer and cart
    const customer = await Customer.findById(metadata.customer_id);
    const cart = await Cart.findById(metadata.cart_id)
      .populate('items.product', 'name price images vendor')
      .populate('items.vendor', 'businessName address');

    if (!customer || !cart) {
      return res.status(404).json({
        success: false,
        message: 'Customer or cart not found'
      });
    }

    // Get delivery address
    const deliveryAddress = customer.addresses.id(metadata.delivery_address_id);

    // Group items by vendor (create separate orders)
    const groupedByVendor = cart.groupByVendor();
    const createdOrders = [];

    for (const vendorGroup of groupedByVendor) {
      const vendorItems = vendorGroup.items.map(item => ({
        product: item.product._id,
        vendor: item.vendor,
        quantity: item.quantity,
        price: item.price,
        productSnapshot: item.productSnapshot
      }));

      // Calculate vendor-specific pricing
      const vendorSubtotal = vendorGroup.subtotal;
      const vendorDeliveryFee = 3.50; // €3.50 per vendor
      const vendorServiceFee = vendorSubtotal * 0.025; // 2.5%
      const vendorTotal = vendorSubtotal + vendorDeliveryFee + vendorServiceFee;

      // Create order for this vendor
      const order = new Order({
        orderNumber: `AFM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        customer: customer._id,
        vendor: vendorGroup.vendor,
        items: vendorItems,
        deliveryAddress: {
          label: deliveryAddress.label,
          street: deliveryAddress.street,
          apartment: deliveryAddress.apartment,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          postcode: deliveryAddress.postcode,
          country: deliveryAddress.country,
          coordinates: deliveryAddress.coordinates,
          deliveryInstructions: metadata.delivery_notes || deliveryAddress.deliveryInstructions
        },
        pricing: {
          subtotal: vendorSubtotal,
          deliveryFee: vendorDeliveryFee,
          serviceFee: vendorServiceFee,
          discount: 0,
          total: vendorTotal
        },
        payment: {
          method: 'paystack',
          status: 'paid',
          paidAt: new Date(),
          transactionId: paymentData.reference,
          paystackReference: paymentData.reference,
          amount: vendorTotal,
          currency: 'EUR'
        },
        status: 'pending',
        timeline: [{
          status: 'pending',
          timestamp: new Date(),
          note: 'Order placed and payment confirmed'
        }]
      });

      await order.save();
      createdOrders.push(order);

      // Create notification for vendor
      try {
        const { createNotification } = require('./notificationController');
        const Vendor = require('../models/Vendor');
        const vendorDoc = await Vendor.findById(vendorGroup.vendor).populate('user');

        if (vendorDoc && vendorDoc.user) {
          await createNotification({
            recipient: vendorDoc.user._id,
            recipientRole: 'vendor',
            type: 'order_placed',
            title: 'New Order Received! 🎉',
            message: `Order ${order.orderNumber} - £${vendorTotal.toFixed(2)} from ${customer.user?.name || 'Customer'}`,
            relatedOrder: order._id,
            relatedVendor: vendorDoc._id,
            priority: 'high',
            actionUrl: `/orders/${order._id}`,
            icon: '🛒'
          });
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }

      // Reduce product stock
      for (const item of vendorItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, 'analytics.sales': item.quantity }
        });
      }

      console.log(`📦 Order created: ${order.orderNumber} for vendor ${vendorGroup.vendor}`);
    }

    // Clear cart
    await cart.clearCart();

    // Update customer stats
    customer.stats.totalOrders += createdOrders.length;
    customer.stats.totalSpent += cart.pricing.total;
    customer.stats.lastOrderDate = new Date();
    await customer.save();

    // Award loyalty points (1 point per €1)
    const pointsEarned = Math.floor(cart.pricing.total);
    await customer.addLoyaltyPoints(pointsEarned, 'purchase');

    res.json({
      success: true,
      message: 'Payment verified and orders created successfully',
      data: {
        orders: createdOrders.map(order => ({
          orderNumber: order.orderNumber,
          vendor: order.vendor,
          total: order.pricing.total,
          status: order.status
        })),
        totalOrders: createdOrders.length,
        totalAmount: cart.pricing.total,
        pointsEarned,
        paymentReference: paymentData.reference
      }
    });

    console.log(`✅ Payment verified: ${reference}, ${createdOrders.length} orders created`);
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * Paystack webhook handler
 * POST /api/checkout/webhook/paystack
 */
exports.paystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const event = req.body;

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        console.log(`💰 Payment successful: ${event.data.reference}`);
        // Payment already handled in verifyPayment
        break;

      case 'charge.failed':
        console.log(`❌ Payment failed: ${event.data.reference}`);
        // Notify customer of failed payment
        const failedOrder = await Order.findOne({ 'payment.reference': event.data.reference }).populate('customer');
        if (failedOrder && failedOrder.customer) {
          const customerUser = await User.findById(failedOrder.customer.user);
          if (customerUser) {
            await sendPaymentFailureEmail(customerUser.email, customerUser.name, failedOrder.orderNumber);
          }
        }
        break;

      case 'transfer.success':
        console.log(`💸 Transfer successful: ${event.data.reference}`);
        // Update vendor payout status
        const payoutOrder = await Order.findOne({ 'payment.reference': event.data.reference });
        if (payoutOrder) {
          payoutOrder.payment.vendorPaidOut = true;
          payoutOrder.payment.vendorPayoutDate = new Date();
          payoutOrder.payment.vendorPayoutReference = event.data.transfer_code || event.data.id;
          await payoutOrder.save();
          console.log(`✅ Vendor payout marked for order: ${payoutOrder.orderNumber}`);
        }
        break;

      default:
        console.log(`📨 Webhook event: ${event.event}`);
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

/**
 * Get customer's orders
 * GET /api/checkout/orders
 */
exports.getCustomerOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const filter = { customer: customer._id };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('vendor', 'businessName address rating')
      .populate('items.product', 'name images');

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * Get single order details
 * GET /api/checkout/orders/:orderId
 */
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const customer = await Customer.findOne({ user: req.user._id });
    const order = await Order.findOne({ _id: orderId, customer: customer._id })
      .populate('vendor', 'businessName address phone rating')
      .populate('items.product', 'name price images unit')
      .populate('delivery.rider', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

/**
 * Cancel order
 * POST /api/checkout/orders/:orderId/cancel
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const customer = await Customer.findOne({ user: req.user._id });
    const order = await Order.findOne({ _id: orderId, customer: customer._id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Cancelled by customer: ${reason || 'No reason provided'}`,
      actor: req.user._id
    });

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, 'analytics.sales': -item.quantity }
      });
    }

    // Initiate refund if payment was made
    if (order.payment.status === 'completed' && order.payment.reference) {
      try {
        // Initiate Paystack refund
        const refundResponse = await axios.post(
          `${PAYSTACK_BASE_URL}/refund`,
          {
            transaction: order.payment.reference,
            amount: order.pricing.total * 100, // Convert to kobo/cents
            currency: 'GBP'
          },
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (refundResponse.data.status) {
          order.payment.refundStatus = 'initiated';
          order.payment.refundReference = refundResponse.data.data.id;
          await order.save();
          console.log(`💰 Refund initiated for order: ${order.orderNumber}`);
        }
      } catch (refundError) {
        console.error('Refund initiation error:', refundError.message);
        // Continue with cancellation even if refund fails
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order
      }
    });

    console.log(`❌ Order cancelled: ${order.orderNumber}`);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

module.exports = exports;
