// Load env variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const passport = require('passport');

// DB & socket
const { connectDB, closeDB } = require('./src/config/database');
const { initSocket } = require('./src/config/socket');

// Error handlers
const { errorHandler, notFound } = require('./src/middleware/errorHandler');


// Import routes
const authRoutes = require('./src/routes/authRoutes');
const otpRoutes = require('./src/routes/otpRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');
const vendorAuthRoutes = require('./src/routes/vendorAuthRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const riderAuthRoutes = require('./src/routes/riderAuthRoutes');
const riderStoreRoutes = require('./src/routes/riderStoreRoutes');
const vendorRiderRoutes = require('./src/routes/vendorRiderRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const productBrowsingRoutes = require('./src/routes/productBrowsingRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const checkoutRoutes = require('./src/routes/checkoutRoutes');
const deliveryAssignmentRoutes = require('./src/routes/deliveryAssignmentRoutes');
const pickerDeliveryRoutes = require('./src/routes/pickerDeliveryRoutes');
const pickerAuthRoutes = require('./src/routes/pickerAuthRoutes');
const pickerOrderRoutes = require('./src/routes/pickerOrderRoutes');
const vendorPickerRoutes = require('./src/routes/vendorPickerRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');
const seedRoutes = require('./src/routes/seedRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const adminVendorRoutes = require('./src/routes/adminVendorRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const gdprRoutes = require('./src/routes/gdprRoutes');

// App init
const app = express();

// Connect DB (non-blocking)
connectDB().catch(err =>
  console.error('DB connection failed:', err.message)
);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// ======================= CORS =======================
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://arbythecoder.github.io/afrimercato-frontend',
  'https://arbythecoder.github.io',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // Allow Cloudflare previews
      if (/^https:\/\/[a-z0-9-]+\.afrimercato\.pages\.dev$/.test(origin)) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Preflight support
app.options('*', cors());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport (OAuth)
app.use(passport.initialize());

// Logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Trust proxy (Railway/Fly)
app.set('trust proxy', 1);

// Rate limiting
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================= ROUTES =======================

// Root
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Afrimercato API running 🚀' });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Auth
app.use('/api/auth', authRoutes);
app.use('/api/auth/otp', otpRoutes);
app.use('/api/vendor/auth', vendorAuthRoutes);
app.use('/api/rider/auth', riderAuthRoutes);

// Vendor & customer
app.use('/api/vendor', vendorRoutes);
app.use('/api/customers', customerRoutes);

// Product browsing routes (Premium e-commerce like Jumia/Konga)
// All routes in productBrowsingRoutes will be prefixed with /api/products
// Example: GET /api/products?category=vegetables, GET /api/products/search?q=tomato
app.use('/api/products', productBrowsingRoutes);

// Product management routes (Vendor only - create/edit products)
// All routes in productRoutes will be prefixed with /api/vendor/products
// Example: POST /api/vendor/products, PUT /api/vendor/products/:id
app.use('/api/vendor/products', productRoutes);

// Notification routes
// All routes in notificationRoutes will be prefixed with /api/notifications
// Example: GET /api/notifications, PUT /api/notifications/:id/read
app.use('/api/notifications', notificationRoutes);

// Shopping cart routes (Multi-vendor cart)
// All routes in cartRoutes will be prefixed with /api/cart
// Example: POST /api/cart/items, GET /api/cart, POST /api/cart/coupons
app.use('/api/cart', cartRoutes);

// Checkout and payment routes (Paystack integration)
// All routes in checkoutRoutes will be prefixed with /api/checkout
// Example: POST /api/checkout/payment/initialize, GET /api/checkout/orders
app.use('/api/checkout', checkoutRoutes);

// Delivery assignment routes (Auto and manual rider assignment)
// All routes in deliveryAssignmentRoutes will be prefixed with /api/delivery-assignment
// Example: POST /api/delivery-assignment/auto-assign/:orderId
app.use('/api/delivery-assignment', deliveryAssignmentRoutes);

// Picker/Rider delivery management routes (RIDERS - for delivery)
// All routes in pickerDeliveryRoutes will be prefixed with /api/picker
// Example: GET /api/picker/deliveries/active, POST /api/picker/deliveries/:id/complete
app.use('/api/picker', pickerDeliveryRoutes);

// Picker authentication routes (Phase 4 - PICKERS - work inside stores)
// All routes in pickerAuthRoutes will be prefixed with /api/picker/auth
// Example: POST /api/picker/auth/register, POST /api/picker/auth/login, POST /api/picker/auth/checkin
app.use('/api/picker/auth', pickerAuthRoutes);

// Picker order picking routes (Phase 4 - Order picking workflow)
// All routes in pickerOrderRoutes will be prefixed with /api/picker/orders
// Example: POST /api/picker/orders/:id/claim, POST /api/picker/orders/:id/items/:itemId/picked
app.use('/api/picker/orders', pickerOrderRoutes);

// Vendor-Picker management routes (Phase 4 - Vendors manage pickers)
// All routes in vendorPickerRoutes will be prefixed with /api/vendor/pickers
// Example: GET /api/vendor/pickers/requests, POST /api/vendor/pickers/:id/approve
app.use('/api/vendor/pickers', vendorPickerRoutes);

// Location search routes (Uber Eats/Just Eat style location-based vendor discovery)
// All routes in locationRoutes will be prefixed with /api/location
// Example: GET /api/location/search-vendors?location=Bristol%20UK&radius=10
app.use('/api/location', locationRoutes);

// Real-time order tracking routes (Live status updates and rider GPS)
// All routes in trackingRoutes will be prefixed with /api/tracking
// Example: GET /api/tracking/:orderId, POST /api/tracking/rider/location
app.use('/api/tracking', trackingRoutes);

// Seed routes (Administrative endpoint to seed database)
// All routes in seedRoutes will be prefixed with /api/seed
// Example: POST /api/seed/vendors, GET /api/seed/status
app.use('/api/seed', seedRoutes);

// Legacy vendor routes compatibility (redirects to location routes)
// This handles old frontend code that might call /api/vendors/:id
app.get('/api/vendors/:id', (req, res) => {
  // Redirect to the correct location endpoint
  res.redirect(308, `/api/location/vendor/${req.params.id}`);
});

// Subscription & Rider management routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/rider/stores', riderStoreRoutes);
app.use('/api/vendor/riders', vendorRiderRoutes);

// Admin & Payment routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/vendors', adminVendorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/gdpr', gdprRoutes);

// Seeder
app.use('/api/seed', seedRoutes);

// ======================= ERRORS =======================
app.use(notFound);
app.use(errorHandler);

// ======================= SERVER =======================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Socket.io
const io = initSocket(server);
global.io = io;

/**
 * ==============================================================
 * AUTOMATED VENDOR APPROVAL CRON JOB (24-48 HOUR APPROVAL)
 * ==============================================================
 * Automatically approves vendors after quality checks
 * - Runs immediately on startup to catch any pending vendors
 * - Runs every 6 hours to check for vendors ready for approval
 * - Vendors with good profiles get auto-approved after 24-48 hours
 * - Reduces manual admin work by 70-80%
 */
const { processAllPendingVendors } = require('./src/services/autoApprovalService');

// Run immediately on startup (check for any pending vendors)
setTimeout(async () => {
  console.log('\n🔄 Running initial vendor auto-verification check...');
  try {
    const result = await processAllPendingVendors();
    console.log('✅ Initial auto-verification complete:', result);
  } catch (error) {
    console.error('❌ Initial auto-verification failed:', error.message);
  }
}, 5000); // Wait 5 seconds after server starts

// Run every 6 hours (checks vendors that have been pending for 24-48 hours)
const SIX_HOURS = 6 * 60 * 60 * 1000;
setInterval(async () => {
  console.log('\n⏰ Running scheduled vendor auto-verification check (every 6 hours)...');
  try {
    const result = await processAllPendingVendors();
    console.log('✅ Scheduled auto-verification complete:', result);
  } catch (error) {
    console.error('❌ Scheduled auto-verification failed:', error.message);
  }
}, SIX_HOURS);

console.log('✅ Automated vendor verification system initialized');
console.log('   - Checks pending vendors every 6 hours');
console.log('   - Auto-approves low-risk vendors after 24-48 hours');
console.log('   - Flags high-risk vendors for manual review\n');

/**
 * ==============================================================
 * GRACEFUL SHUTDOWN
 * ==============================================================
 * Properly close server and database when app stops
 * Prevents data corruption and resource leaks
 */
process.on('SIGTERM', async () => {
  server.close(async () => {
    await closeDB();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  server.close(async () => {
    await closeDB();
    process.exit(0);
  });
});

// Export app
module.exports = app;
