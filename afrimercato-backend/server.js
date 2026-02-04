// Load env variables
require('dotenv').config();

// Validate environment variables BEFORE starting server
const { checkEnvironment } = require('./src/config/validateEnv');
checkEnvironment();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const passport = require('passport');
require('./src/config/passport'); // Register OAuth strategies (Google)

// DB & socket
const { connectDB, closeDB } = require('./src/config/database');
const { initSocket } = require('./src/config/socket');

// CORS configuration (centralized, supports FRONTEND_ORIGINS env var)
const { getCorsOptions, getCorsConfigSummary } = require('./src/config/cors');

// Error handlers
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Import all routes
const vendorRoutes = require('./src/routes/vendorRoutes');
const vendorDashboardRoutes = require('./src/routes/vendorDashboardRoutes');
const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const riderAuthRoutes = require('./src/routes/riderAuthRoutes');
const pickerAuthRoutes = require('./src/routes/pickerAuthRoutes');
const productBrowsingRoutes = require('./src/routes/productBrowsingRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const checkoutRoutes = require('./src/routes/checkoutRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const riderStoreRoutes = require('./src/routes/riderStoreRoutes');
const vendorRiderRoutes = require('./src/routes/vendorRiderRoutes');
const pickerOrderRoutes = require('./src/routes/pickerOrderRoutes');
const vendorPickerRoutes = require('./src/routes/vendorPickerRoutes');
const pickerDeliveryRoutes = require('./src/routes/pickerDeliveryRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const adminVendorRoutes = require('./src/routes/adminVendorRoutes');
const adminCustomerRoutes = require('./src/routes/adminCustomerRoutes');
const otpRoutes = require('./src/routes/otpRoutes');
const couponRoutes = require('./src/routes/couponRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const payoutRoutes = require('./src/routes/payoutRoutes');
const gdprRoutes = require('./src/routes/gdprRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');
const seedRoutes = require('./src/routes/seedRoutes');
const adminRiderRoutes = require('./src/routes/adminRiderRoutes');
const adminPickerRoutes = require('./src/routes/adminPickerRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

// App init
const app = express();

// Connect DB - BLOCKING (must connect before starting)
connectDB().catch(err => {
  console.error('✗ MongoDB connection failed:', err.message);
  process.exit(1);
});

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// ======================= CORS =======================
// Production-grade dynamic CORS using centralized configuration.
// Add new frontend domains via FRONTEND_ORIGINS env var - no code changes needed.
// Supports: exact domains, wildcard patterns (*.vercel.app), comma-separated lists.
// See src/config/cors.js for full documentation.
const corsOptions = getCorsOptions();

// Log CORS configuration at startup (helpful for debugging deployments)
if (process.env.NODE_ENV !== 'test') {
  const corsConfig = getCorsConfigSummary();
  console.log('✓ CORS configured with', corsConfig.explicitOrigins.length, 'explicit origins,',
              corsConfig.wildcardPatterns.length, 'wildcard patterns');
}

// Apply CORS middleware BEFORE all routes
app.use(cors(corsOptions));

// Explicit preflight handler for all routes (required for complex requests with credentials)
app.options('*', cors(corsOptions));

// Cookie parser - required for reading cookies in auth routes
app.use(cookieParser());

// Body parsers - exclude Stripe webhook route (needs raw body for signature verification)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Passport (OAuth)
app.use(passport.initialize());

// Logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Trust proxy (Railway/Fly)
app.set('trust proxy', 1);

// Rate limiting (increased + exclude auth endpoints)
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // Increased from 100 to 500
    skip: (req) => req.path.includes('/auth/') || req.path.includes('/login'),
    message: 'Too many requests, please try again later'
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

// ======================= AUTHENTICATION ROUTES =======================
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/rider-auth', riderAuthRoutes);
app.use('/api/picker-auth', pickerAuthRoutes);

// ======================= VENDOR ROUTES =======================
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendor/dashboard', vendorDashboardRoutes);
app.use('/api/vendor/riders', vendorRiderRoutes);
app.use('/api/vendor/pickers', vendorPickerRoutes);

// ======================= CUSTOMER ROUTES =======================
app.use('/api/customers', customerRoutes);
app.use('/api/products', productBrowsingRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payments', paymentRoutes);

// ======================= RIDER ROUTES =======================
app.use('/api/riders', riderStoreRoutes);

// ======================= PICKER ROUTES =======================
app.use('/api/pickers', pickerOrderRoutes);

// ======================= DELIVERY & TRACKING =======================
app.use('/api/deliveries', pickerDeliveryRoutes);
app.use('/api/tracking', trackingRoutes);

// ======================= ADMIN ROUTES =======================
app.use('/api/admin', adminRoutes);
app.use('/api/admin/vendors', adminVendorRoutes);
app.use('/api/admin/customers', adminCustomerRoutes);
app.use('/api/admin/riders', adminRiderRoutes);
app.use('/api/admin/pickers', adminPickerRoutes);

// ======================= FEATURE ROUTES =======================
app.use('/api/coupons', couponRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', ticketRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/privacy', gdprRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/reviews', reviewRoutes);

// ======================= ERRORS =======================
app.use(notFound);
app.use(errorHandler);

// ======================= SERVER =======================
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces (required for Fly.io)

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
});

// Socket.io
const io = initSocket(server);
global.io = io;

// Initialize cron jobs for repeat orders
const { initializeCronJobs } = require('./src/services/repeatOrderService');
initializeCronJobs();

// Graceful shutdown
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
