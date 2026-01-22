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
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://arbythecoder.github.io/afrimercato-frontend',
  'https://arbythecoder.github.io',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://afrimercato-frontend.fly.dev'
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow Cloudflare previews
    if (/^https:\/\/[a-z0-9-]+\.afrimercato\.pages\.dev$/.test(origin)) {
      return callback(null, true);
    }

    // Allow GitHub Pages with any path
    if (origin.startsWith('https://arbythecoder.github.io')) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log rejected origins for debugging (don't throw error, just reject)
    console.warn(`⚠️ CORS rejected origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400 // 24 hours - cache preflight requests
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicit preflight handler for all routes
app.options('*', cors(corsOptions));

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
