# Stripe Payment Integration Guide

Complete guide to integrate Stripe payments for Afrimercato marketplace (multi-vendor platform).

---

## Overview

**What You'll Build:**
- Customer checkout with Stripe
- Split payments between platform and vendors (if applicable)
- Webhook handling for payment confirmations
- Stripe Connect for vendor payouts (advanced)

**Time Required:** 2-3 hours for basic integration

**Stripe Account Types:**
- **Standard Account** (simple): Platform collects payments
- **Stripe Connect** (advanced): Vendors get paid directly, platform takes commission

We'll cover both options.

---

## Part 1: Stripe Account Setup

### 1.1 Create Stripe Account

1. Go to https://stripe.com/
2. Click **Start now** or **Sign up**
3. Enter:
   - Email (business email preferred)
   - Full name
   - Country: **Nigeria** (or your country)
   - Password
4. Click **Create account**

### 1.2 Verify Email

1. Check your email inbox
2. Click verification link
3. Complete account activation

### 1.3 Get API Keys

1. Login to Stripe Dashboard: https://dashboard.stripe.com/
2. Click **Developers** in left sidebar
3. Click **API keys**

**You'll see two sets of keys:**

**Test Mode (for development):**
```
Publishable key: pk_test_51xxxxx
Secret key: sk_test_51xxxxx
```

**Live Mode (for production):**
```
Publishable key: pk_live_51xxxxx
Secret key: sk_live_51xxxxx
```

**Important:** Start with **Test mode** keys!

### 1.4 Save API Keys Securely

**Backend (.env):**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51xxxxx...
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...  # We'll get this later
```

**Frontend (.env):**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
```

**Never commit these to git!** Add to `.env.local` or use secrets manager.

---

## Part 2: Backend Integration (Node.js/Express)

### 2.1 Install Stripe SDK

```bash
cd afrimercato-backend
npm install stripe
```

### 2.2 Create Stripe Configuration File

**File:** `src/config/stripe.js`

```javascript
// Stripe Configuration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
```

### 2.3 Create Payment Controller

**File:** `src/controllers/paymentController.js`

```javascript
const stripe = require('../config/stripe');
const Order = require('../models/Order');

/**
 * Create Stripe Payment Intent
 * @route POST /api/payments/create-payment-intent
 * @access Private (Customer)
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, orderId, currency = 'ngn' } = req.body;

    // Validate amount (must be in smallest currency unit: kobo for NGN, cents for USD)
    if (!amount || amount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least ₦0.50 (50 kobo)'
      });
    }

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in kobo (NGN) or cents (USD)
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true, // Enable card, mobile money, etc.
      },
      metadata: {
        orderId: orderId,
        customerId: req.user.id,
        customerEmail: req.user.email,
        platform: 'afrimercato'
      },
      description: `Afrimercato Order #${order.orderNumber}`,
      receipt_email: req.user.email
    });

    // Save payment intent ID to order
    order.paymentIntentId = paymentIntent.id;
    order.paymentStatus = 'pending';
    await order.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

/**
 * Confirm Payment
 * @route POST /api/payments/confirm
 * @access Private
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      const order = await Order.findOne({ paymentIntentId });
      if (order) {
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.paidAt = new Date();
        await order.save();

        // TODO: Send confirmation email to customer
        // TODO: Notify vendor of new order
      }

      return res.json({
        success: true,
        message: 'Payment confirmed',
        data: { order }
      });
    }

    res.json({
      success: false,
      message: 'Payment not completed',
      status: paymentIntent.status
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
};

/**
 * Get Payment Status
 * @route GET /api/payments/status/:paymentIntentId
 * @access Private
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
};

module.exports = exports;
```

### 2.4 Create Payment Routes

**File:** `src/routes/paymentRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// All routes require authentication
router.post('/create-payment-intent', protect, paymentController.createPaymentIntent);
router.post('/confirm', protect, paymentController.confirmPayment);
router.get('/status/:paymentIntentId', protect, paymentController.getPaymentStatus);

module.exports = router;
```

### 2.5 Add Routes to Server

**File:** `server.js`

```javascript
// Import payment routes
const paymentRoutes = require('./src/routes/paymentRoutes');

// Use payment routes
app.use('/api/payments', paymentRoutes);
```

### 2.6 Update Order Model

**File:** `src/models/Order.js`

Add these fields to your Order schema:

```javascript
// Payment fields
paymentIntentId: {
  type: String,
  unique: true,
  sparse: true // Allows null values
},
paymentStatus: {
  type: String,
  enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
  default: 'pending'
},
paidAt: Date,
paymentMethod: {
  type: String,
  enum: ['card', 'mobile_money', 'bank_transfer'],
  default: 'card'
}
```

---

## Part 3: Frontend Integration (React)

### 3.1 Install Stripe React Libraries

```bash
cd afrimercato-frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 3.2 Create Stripe Context

**File:** `src/context/StripeContext.jsx`

```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe (do this outside component to avoid recreating)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const StripeProvider = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};
```

### 3.3 Wrap App with StripeProvider

**File:** `src/main.jsx` or `src/App.jsx`

```javascript
import { StripeProvider } from './context/StripeContext';

function App() {
  return (
    <StripeProvider>
      <AuthProvider>
        {/* Your app routes */}
      </AuthProvider>
    </StripeProvider>
  );
}
```

### 3.4 Create Checkout Component

**File:** `src/components/Checkout/StripeCheckout.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { confirmPayment } from '../../services/api';

const StripeCheckout = ({ orderId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  // Fetch client secret from backend on mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('afrimercato_token')}`
          },
          body: JSON.stringify({
            amount: amount * 100, // Convert to kobo (NGN) or cents
            orderId: orderId,
            currency: 'ngn'
          })
        });

        const data = await response.json();

        if (data.success) {
          setClientSecret(data.data.clientSecret);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to initialize payment');
      }
    };

    if (orderId && amount) {
      createPaymentIntent();
    }
  }, [orderId, amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js hasn't loaded yet
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required' // Don't redirect if not needed
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm on backend
        await confirmPayment(paymentIntent.id);

        // Success callback
        if (onSuccess) {
          onSuccess(paymentIntent);
        } else {
          navigate('/order-confirmation', { state: { orderId } });
        }
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="ml-4">Initializing payment...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Complete Payment</h2>

      {/* Stripe Payment Element (handles all payment methods) */}
      <PaymentElement />

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Pay ₦${amount.toLocaleString()}`}
      </button>

      <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Secured by Stripe
      </div>
    </form>
  );
};

export default StripeCheckout;
```

### 3.5 Use in Checkout Page

**File:** `src/pages/Checkout.jsx`

```javascript
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckout from '../components/Checkout/StripeCheckout';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const orderId = 'order_123'; // Get from your cart/order state
  const totalAmount = 5000; // ₦5000

  return (
    <div className="container mx-auto py-8">
      <Elements stripe={stripePromise}>
        <StripeCheckout
          orderId={orderId}
          amount={totalAmount}
          onSuccess={(paymentIntent) => {
            console.log('Payment successful!', paymentIntent);
            // Redirect or show success message
          }}
        />
      </Elements>
    </div>
  );
};

export default CheckoutPage;
```

---

## Part 4: Webhook Configuration

Webhooks notify your backend when payment events occur (even if user closes browser).

### 4.1 Create Webhook Endpoint

**File:** `src/controllers/webhookController.js`

```javascript
const stripe = require('../config/stripe');
const Order = require('../models/Order');

/**
 * Stripe Webhook Handler
 * @route POST /api/webhooks/stripe
 * @access Public (Stripe calls this)
 */
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`Payment succeeded: ${paymentIntent.id}`);

      // Update order
      const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
      if (order) {
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.paidAt = new Date();
        await order.save();

        // TODO: Send confirmation email
        // TODO: Notify vendor
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log(`Payment failed: ${failedPayment.id}`);

      // Update order
      const failedOrder = await Order.findOne({ paymentIntentId: failedPayment.id });
      if (failedOrder) {
        failedOrder.paymentStatus = 'failed';
        await failedOrder.save();
      }
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      console.log(`Refund processed: ${refund.id}`);

      // Handle refund logic
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = exports;
```

### 4.2 Add Webhook Route

**Important:** Webhooks need **raw body**, not JSON parsed!

**File:** `server.js`

```javascript
const webhookController = require('./src/controllers/webhookController');

// Webhook route BEFORE body parser (needs raw body)
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.stripeWebhook
);

// Regular body parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... rest of your routes
```

### 4.3 Get Webhook Secret

**For Development (use Stripe CLI):**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
4. Copy the webhook secret: `whsec_xxx...`
5. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_xxx...`

**For Production:**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. Enter: `https://afrimercato-backend.fly.dev/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy **Signing secret** (whsec_xxx...)
7. Add to Fly.io secrets:
   ```bash
   fly secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx...
   ```

---

## Part 5: Testing

### 5.1 Test Mode Cards

Use these test cards in development:

**Successful Payment:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**3D Secure (requires authentication):**
```
Card: 4000 0027 6000 3184
```

**Payment Declined:**
```
Card: 4000 0000 0000 0002
```

**Insufficient Funds:**
```
Card: 4000 0000 0000 9995
```

**Full test cards list:** https://stripe.com/docs/testing

### 5.2 Test Workflow

1. Create an order on your app
2. Go to checkout
3. Enter test card: `4242 4242 4242 4242`
4. Click "Pay"
5. Verify:
   - Payment succeeds
   - Order status updates
   - Webhook fires (check backend logs)
   - User redirected to confirmation

---

## Part 6: Multi-Vendor Payouts (Stripe Connect)

For marketplace where vendors get paid directly:

### 6.1 Enable Stripe Connect

1. Stripe Dashboard → Settings → Connect
2. Enable **Custom account** type
3. Configure branding

### 6.2 Create Connected Accounts for Vendors

```javascript
// When vendor registers
const account = await stripe.accounts.create({
  type: 'express',
  country: 'NG',
  email: vendor.email,
  capabilities: {
    transfers: { requested: true },
  },
});

// Save to vendor model
vendor.stripeAccountId = account.id;
await vendor.save();

// Create onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: 'https://afrimercato.com/vendor/onboarding/refresh',
  return_url: 'https://afrimercato.com/vendor/dashboard',
  type: 'account_onboarding',
});

// Redirect vendor to complete onboarding
res.redirect(accountLink.url);
```

### 6.3 Split Payments

```javascript
// When creating payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000, // ₦100.00
  currency: 'ngn',
  application_fee_amount: 1000, // Platform fee: ₦10.00 (10%)
  transfer_data: {
    destination: vendor.stripeAccountId, // Vendor gets ₦90.00
  },
});
```

**Result:**
- Customer pays ₦100
- Vendor receives ₦90
- Platform keeps ₦10

---

## Part 7: Go Live

### 7.1 Complete Stripe Activation

1. Stripe Dashboard → Activate your account
2. Provide:
   - Business details
   - Bank account (for payouts)
   - Tax information
   - Identity verification

### 7.2 Switch to Live Keys

**Backend:**
```bash
# Production .env
STRIPE_SECRET_KEY=sk_live_51xxxxx...
STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxx...
```

**Frontend:**
```bash
# Production .env.production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxx...
```

**Fly.io:**
```bash
fly secrets set STRIPE_SECRET_KEY=sk_live_51xxxxx...
fly secrets set STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxx...
```

### 7.3 Update Webhook to Live Mode

1. Stripe Dashboard → Switch to **Live mode** (toggle top right)
2. Developers → Webhooks → Add endpoint
3. URL: `https://afrimercato-backend.fly.dev/api/webhooks/stripe`
4. Select events
5. Copy **live** webhook secret
6. Update backend: `fly secrets set STRIPE_WEBHOOK_SECRET=whsec_live_xxx...`

---

## Security Checklist

- [ ] Never expose secret keys in frontend code
- [ ] Verify webhook signatures (prevents fake webhooks)
- [ ] Validate amounts on backend (don't trust frontend)
- [ ] Use HTTPS in production (required by Stripe)
- [ ] Store keys in environment variables, not code
- [ ] Log payment errors securely (no sensitive data)
- [ ] Implement idempotency for payment retries
- [ ] Set up fraud detection in Stripe Dashboard (Radar)

---

## Pricing & Fees

**Stripe Fees (Nigeria):**
- 1.5% + ₦100 per successful local card transaction
- 3.9% + ₦100 per international card transaction
- No setup fees or monthly fees

**Example:**
- Customer pays: ₦10,000
- Stripe fee: ₦250 (₦10,000 × 1.5% + ₦100)
- You receive: ₦9,750

**Stripe Connect:**
- Platform can pass fees to customers
- Or absorb fees and charge vendors a commission

---

## Quick Reference

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

**API Endpoints:**
- Create Intent: `POST /api/payments/create-payment-intent`
- Confirm: `POST /api/payments/confirm`
- Webhook: `POST /api/webhooks/stripe`

**Environment Variables:**
- `STRIPE_SECRET_KEY` (backend)
- `STRIPE_PUBLISHABLE_KEY` (backend + frontend)
- `STRIPE_WEBHOOK_SECRET` (backend)

**Dashboard:** https://dashboard.stripe.com/

---

**Last Updated:** 2026-01-31
**Stripe Docs:** https://stripe.com/docs
**Support:** https://support.stripe.com/
