// =================================================================
// SIMPLE MONGODB CONNECTION TEST
// =================================================================
// Quick test to verify MongoDB Atlas connection is working
// Run with: node test-connection-simple.js

require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Atlas connection...\n');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB connection is working!');
  console.log('📦 Database:', mongoose.connection.name);
  console.log('\n✨ You can now:');
  console.log('  1. Start your backend server');
  console.log('  2. Register vendors');
  console.log('  3. Create vendor profiles');
  console.log('  4. Your client can use the app for Global Talent Visa!\n');
  process.exit(0);
})
.catch(err => {
  console.error('❌ FAILED! Connection error:', err.message);
  console.error('\n🔧 TO FIX:');
  console.error('  1. Go to https://cloud.mongodb.com');
  console.error('  2. Network Access → Add IP Address');
  console.error('  3. Allow from Anywhere (0.0.0.0/0)');
  console.error('  4. Wait 2-3 minutes');
  console.error('  5. Run this test again\n');
  process.exit(1);
});

setTimeout(() => {
  console.error('\n⏱️  Connection timed out. IP is still not whitelisted.\n');
  process.exit(1);
}, 15000);
