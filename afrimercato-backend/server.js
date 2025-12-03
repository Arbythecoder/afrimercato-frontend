// =================================================================
// AFRIMERCATO BACKEND SERVER
// =================================================================
// Main entry point - starts the Express server and connects everything

// Load environment variables FIRST (before anything else)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import database connection
const { connectDB, closeDB } = require('./src/config/database');

// Import error handlers
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Import Socket.IO configuration for real-time features
const { initSocket } = require('./src/config/socket');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const riderAuthRoutes = require('./src/routes/riderAuthRoutes');
const riderStoreRoutes = require('./src/routes/riderStoreRoutes');
const vendorRiderRoutes = require('./src/routes/vendorRiderRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const productBrowsingRoutes = require('./src/routes/productBrowsingRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const checkoutRoutes = require('./src/routes/checkoutRoutes');
const deliveryAssignmentRoutes = require('./src/routes/deliveryAssignmentRoutes');
const pickerDeliveryRoutes = require('./src/routes/pickerDeliveryRoutes');
const pickerAuthRoutes = require('./src/routes/pickerAuthRoutes');
const pickerOrderRoutes = require('./src/routes/pickerOrderRoutes');
const vendorPickerRoutes = require('./src/routes/vendorPickerRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const seedRoutes = require('./src/routes/seedRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');

/**
 * ==============================================================
 * INITIALIZE EXPRESS APP
 * ==============================================================
 * Express is the web server framework
 * Think of it as the foundation of your building
 */
const app = express();

/**
 * ==============================================================
 * CONNECT TO DATABASE
 * ==============================================================
 * Connect to MongoDB in background to not block server startup
 * This ensures Railway healthcheck passes even if DB is slow
 */
connectDB().catch(err => {
  console.error('Database connection failed, but server will continue:', err.message);
});

/**
 * ==============================================================
 * MIDDLEWARE (In Order of Execution)
 * ==============================================================
 * Middleware runs on EVERY request before reaching your routes
 * Order matters! They execute top to bottom
 */

// 1. SECURITY HEADERS (Helmet)
/**
 * Helmet sets various HTTP headers to protect against common attacks:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME type sniffing
 * - etc.
 */
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for development (enable in production)
    crossOriginEmbedderPolicy: false
  })
);

// 2. CORS (Cross-Origin Resource Sharing)
/**
 * Allows your React frontend (localhost:3000) to make requests
 * to this backend (localhost:5000)
 *
 * Without CORS, browsers block requests between different ports
 */
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or file://)
      if (!origin) return callback(null, true);

      // Allow all origins in development
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      // In production, only allow specific origins
      const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://afrimercato.pages.dev',  // Cloudflare Pages (Production)
  'https://www.afrimercato.com',  // Production domain
  'https://afrimercato.com',  // Root domain
  'https://lucent-pithivier-f2c1f3.netlify.app',
  'https://arbythecoder.github.io',  // Root domain
  'https://arbythecoder.github.io/afrimercato-frontend',  // GitHub Pages
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178'
];

      // Allow all Cloudflare Pages preview deployments (*.afrimercato.pages.dev)
      if (origin && origin.match(/^https:\/\/[a-z0-9]+\.afrimercato\.pages\.dev$/)) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies/authorization headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. BODY PARSERS
/**
 * Parse incoming request bodies
 * - express.json() → Parse JSON data (from frontend)
 * - express.urlencoded() → Parse form data
 */
app.use(express.json({ limit: '10mb' })); // Max 10MB JSON payload
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. LOGGING (Morgan)
/**
 * Logs all HTTP requests to console
 * Format: GET /api/auth/login 200 45ms
 *
 * Only log in development (production logs too much)
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 5. RATE LIMITING
/**
 * Prevents abuse by limiting requests per IP address
 * Default: 100 requests per 15 minutes per IP
 *
 * Protects against:
 * - Brute force password attacks
 * - API spam
 * - Denial of Service (DoS)
 */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false
});

// Apply rate limiter to all routes
app.use('/api', limiter);

// 6. STATIC FILES (Uploaded Images/Documents)
/**
 * Serve uploaded files publicly
 * Example: GET /uploads/products/image123.jpg
 *
 * This allows frontend to display uploaded images
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * ==============================================================
 * ROUTES
 * ==============================================================
 * Define API endpoints
 * Format: app.use(path, routeHandler)
 */

// Root endpoint (friendly welcome message)
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Afrimercato API! 🛒',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      docs: 'https://github.com/Arbythecoder/afrimercato-backend',
      frontend: 'https://afrimercato.pages.dev'
    },
    status: 'All systems operational ✅'
  });
});

// Health check endpoint (to verify server is running)
// Railway expects this to return 200 OK for deployment to succeed
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  // Always return 200 OK to pass Railway healthcheck
  // Even if database is not connected yet
  res.status(200).json({
    success: true,
    message: 'Afrimercato API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    database: {
      status: dbStates[dbStatus],
      connected: dbStatus === 1
    }
  });
});

// Authentication routes
// All routes in authRoutes will be prefixed with /api/auth
// Example: POST /api/auth/login, POST /api/auth/register
app.use('/api/auth', authRoutes);

// Vendor routes
// All routes in vendorRoutes will be prefixed with /api/vendor
// Example: GET /api/vendor/dashboard/stats, POST /api/vendor/products
app.use('/api/vendor', vendorRoutes);

// Subscription routes
// All routes in subscriptionRoutes will be prefixed with /api/subscriptions
// Example: GET /api/subscriptions/plans, POST /api/subscriptions/subscribe
app.use('/api/subscriptions', subscriptionRoutes);

// Rider authentication routes (Per SRS 2.1.4)
// All routes in riderAuthRoutes will be prefixed with /api/rider/auth
// Example: POST /api/rider/auth/register, POST /api/rider/auth/login
app.use('/api/rider/auth', riderAuthRoutes);

// Rider-Store connection routes (Per SRS 2.1.4.1.a)
// All routes in riderStoreRoutes will be prefixed with /api/rider/stores
// Example: GET /api/rider/stores/nearby, POST /api/rider/stores/:vendorId/connect
app.use('/api/rider/stores', riderStoreRoutes);

// Vendor-Rider management routes (Per SRS 2.1.4.1.a)
// All routes in vendorRiderRoutes will be prefixed with /api/vendor/riders
// Example: GET /api/vendor/riders/requests, POST /api/vendor/riders/:riderId/approve
app.use('/api/vendor/riders', vendorRiderRoutes);

// Customer routes (Phase 3)
// All routes in customerRoutes will be prefixed with /api/customers
// Example: POST /api/customers/register, GET /api/customers/profile
app.use('/api/customers', customerRoutes);

// Product browsing routes (Premium e-commerce like Jumia/Konga)
// All routes in productBrowsingRoutes will be prefixed with /api/products
// Example: GET /api/products?category=vegetables, GET /api/products/search?q=tomato
app.use('/api/products', productBrowsingRoutes);

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

// Admin & Payment routes
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

/**
 * ==============================================================
 * ERROR HANDLING
 * ==============================================================
 * These must be AFTER all routes
 */

// 404 Handler - Route not found
app.use(notFound);

// Global error handler - Catches all errors
app.use(errorHandler);

/**
 * ==============================================================
 * START SERVER
 * ==============================================================
 */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  console.log('='.repeat(60));
});

/**
 * ==============================================================
 * INITIALIZE SOCKET.IO FOR REAL-TIME FEATURES
 * ==============================================================
 * Enables: GPS tracking, live notifications, in-app chat
 */
const io = initSocket(server);
global.io = io; // Make Socket.IO available globally for controllers

/**
 * ==============================================================
 * GRACEFUL SHUTDOWN
 * ==============================================================
 * Properly close server and database when app stops
 * Prevents data corruption and resource leaks
 */
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM signal received. Closing server gracefully...');
  server.close(async () => {
    await closeDB();
    console.log('✅ Server closed. Process terminated.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT signal received. Closing server gracefully...');
  server.close(async () => {
    await closeDB();
    console.log('✅ Server closed. Process terminated.');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    // Close server and exit in production
    server.close(() => process.exit(1));
  }
});

// Export for testing purposes
module.exports = app;
