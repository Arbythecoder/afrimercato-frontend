// Check vendor status
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const checkVendors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: 'testvendor@afrimercato.com' });
    console.log('\n📋 User Details:');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Email Verified:', user.isEmailVerified);
    console.log('   ID:', user._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkVendors();
