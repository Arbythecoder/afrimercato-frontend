// Quick script to fix vendor roles
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const fixVendorRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // List of vendor emails to update
    const vendorEmails = [
      'freshvalley@afrimercato.com',
      'dailydairy@afrimercato.com',
      'butchersblock@afrimercato.com',
      'testvendor@afrimercato.com'
    ];

    // Update all these users to vendor role (note: roles is an array)
    const result = await User.updateMany(
      { email: { $in: vendorEmails } },
      { $set: { roles: ['vendor'], primaryRole: 'vendor', isEmailVerified: true } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to vendor role`);

    // Show the updated users
    const updatedUsers = await User.find({ email: { $in: vendorEmails } }).select('name email roles primaryRole');
    console.log('\n📋 Updated Users:');
    updatedUsers.forEach(user => {
      console.log(`   ${user.name} (${user.email}) - Roles: ${user.roles.join(', ')} (Primary: ${user.primaryRole})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixVendorRoles();
