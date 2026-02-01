// =================================================================
// STRIPE CONFIGURATION
// =================================================================
// Initializes Stripe with your secret key for payment processing

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Log Stripe initialization (without exposing full key)
const keyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'not set';
console.log(`✅ Stripe initialized with key: ${keyPrefix}...`);

module.exports = stripe;
