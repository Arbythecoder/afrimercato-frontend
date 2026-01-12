// =================================================================
// DATABASE CONNECTION CONFIGURATION
// =================================================================
// This file handles connecting your backend to MongoDB database
// Think of it like connecting your app to a storage warehouse

const mongoose = require('mongoose');

/**
 * WHAT IS MONGOOSE?
 * Mongoose is like a translator between your JavaScript code and MongoDB.
 * It makes it easy to save and retrieve data from the database.
 */

/**
 * Connect to MongoDB Database
 *
 * SIMPLE EXPLANATION:
 * This function opens a connection to your database.
 * It's like opening a door to your storage room where all data is kept.
 *
 * HOW IT WORKS:
 * 1. It tries to connect using the MONGODB_URI from your .env file
 * 2. If successful, prints "Database connected"
 * 3. If it fails, prints the error and stops the application
 */
const connectDB = async () => {
  try {
    // Disable buffering to get immediate errors instead of timeouts
    mongoose.set('bufferCommands', false);

    // MongoDB connection options
    const options = {
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000, // Increased connection timeout
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    // Listen for connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    // Listen for disconnection
    mongoose.connection.on('disconnected', () => {
      console.log('📴 MongoDB disconnected');
    });

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error(`💡 TIP: If you see DNS errors, try:`);
    console.error(`   1. Check if MongoDB Atlas cluster is active`);
    console.error(`   2. Use a VPN if network blocks MongoDB`);
    console.error(`   3. Use local MongoDB: mongodb://localhost:27017/afrimercato`);
    console.error(`⚠️  WARNING: Server will start but database features won't work!`);

    // In production (Railway), don't crash - let health check pass
    if (process.env.NODE_ENV === 'production') {
      console.error(`🔄 Running in production mode - server will continue despite DB error`);
      console.error(`🔧 Check your MONGODB_URI environment variable in Railway!`);
    } else {
      // In development, exit so developer fixes the issue
      process.exit(1);
    }
  }
};

/**
 * Gracefully Close Database Connection
 *
 * SIMPLE EXPLANATION:
 * This function properly closes the database connection when your app stops.
 * It's like closing and locking the storage room door when you're done.
 *
 * WHY IMPORTANT:
 * If you don't close connections properly, you can have "memory leaks"
 * (your app keeps using resources even when not needed)
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
  } catch (error) {
    console.error(`❌ Error closing MongoDB connection: ${error.message}`);
  }
};

// Export functions so other files can use them
module.exports = { connectDB, closeDB };
