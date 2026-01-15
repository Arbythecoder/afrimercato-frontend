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
const trackingRoutes = require('./src/routes/trackingRoutes');
const seedRoutes = require('./src/routes/seedRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
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

// Vendor & customer
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendor/auth', vendorAuthRoutes);
app.use('/api/customers', customerRoutes);

// Admin, payments, GDPR
app.use('/api/admin', adminRoutes);
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
