// =================================================================
// DATABASE CONFIGURATION
// =================================================================
// MongoDB connection setup and management

const mongoose = require('mongoose');

// Connection URI from environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/afrimercato';

// Connection options with pooling for production
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 8000,  // Increased from 5s to allow for slower connections
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 20, // Increased pool size for production load
  minPoolSize: 5,  // Keep more warm connections ready
  maxIdleTimeMS: 30000, // Close idle connections after 30s
  connectTimeoutMS: 10000, // Connection timeout
  retryWrites: true, // Retry writes on transient errors
  retryReads: true,  // Retry reads on transient errors
  maxConnecting: 3   // Limit concurrent connection attempts
};

// Monitor slow queries (log queries taking > 100ms)
if (process.env.NODE_ENV === 'production') {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      if (duration > 100) {
        console.warn(`[SLOW_QUERY] ${collectionName}.${method} took ${duration}ms`);
      }
    };
  });
}

// Store connection state
let isConnected = false;

// Track connection state changes
mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

mongoose.connection.on('error', () => {
  isConnected = false;
});

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  if (isConnected) {
    console.log('✓ MongoDB already connected');
    return mongoose.connection;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    isConnected = true;
    console.log('✓ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    isConnected = false;
    // Don't exit, allow app to start but routes will fail
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
const closeDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      isConnected = false;
      console.log('✓ MongoDB disconnected');
    }
  } catch (error) {
    console.error('✗ Error closing MongoDB:', error.message);
  }
};

/**
 * Check connection status
 */
const isDBConnected = () => isConnected;

module.exports = {
  connectDB,
  closeDB,
  isDBConnected
};
