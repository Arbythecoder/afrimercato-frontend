// Quick MongoDB connection test
require('dotenv').config({ path: './afrimercato-backend/.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB connection...');
console.log('📍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB connection working!');
  console.log('Database:', mongoose.connection.name);
  process.exit(0);
})
.catch(err => {
  console.error('❌ FAILED! MongoDB connection error:');
  console.error(err.message);
  console.error('\n🔧 SOLUTIONS:');
  console.error('1. Go to MongoDB Atlas → Network Access');
  console.error('2. Add IP Address → Allow from Anywhere (0.0.0.0/0)');
  console.error('3. Wait 2 minutes and try again');
  process.exit(1);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.error('❌ Connection timed out after 15 seconds');
  process.exit(1);
}, 15000);