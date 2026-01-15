// =================================================================
// DATABASE CONFIGURATION
// =================================================================
// MongoDB connection setup and management

const mongoose = require('mongoose');

// Connection URI from environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/afrimercato';

// Connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4 // Use IPv4, skip trying IPv6
};

// Store connection state
let isConnected = false;

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
