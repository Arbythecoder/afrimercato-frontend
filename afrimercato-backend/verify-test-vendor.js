// Simple script to manually verify a test vendor for testing
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function verifyVendor(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email, role: 'vendor' });
    if (!user) {
      console.log(`No vendor found with email: ${email}`);
      process.exit(1);
    }

    user.isVerified = true;
    user.verificationStatus = 'approved';
    await user.save();

    console.log(`✅ Vendor verified: ${user.name} (${user.email})`);
    console.log(`Vendor ID: ${user._id}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

const vendorEmail = process.argv[2];
if (!vendorEmail) {
  console.log('Usage: node verify-test-vendor.js <vendor-email>');
  process.exit(1);
}

verifyVendor(vendorEmail);
