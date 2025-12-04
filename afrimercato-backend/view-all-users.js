// View all registered users in the database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const viewAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({})
      .select('name email roles primaryRole isEmailVerified createdAt lastLogin')
      .sort({ createdAt: -1 });

    console.log(`📋 TOTAL REGISTERED USERS: ${users.length}\n`);
    console.log('=' .repeat(80));

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.primaryRole || user.roles[0]}`);
      console.log(`   ✅ Verified: ${user.isEmailVerified ? 'Yes' : 'No'}`);
      console.log(`   📅 Registered: ${new Date(user.createdAt).toLocaleDateString()}`);
      console.log(`   🕐 Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total Users: ${users.length}`);
    console.log(`   Vendors: ${users.filter(u => u.roles.includes('vendor')).length}`);
    console.log(`   Customers: ${users.filter(u => u.roles.includes('customer')).length}`);
    console.log(`   Riders: ${users.filter(u => u.roles.includes('rider')).length}`);
    console.log(`   Pickers: ${users.filter(u => u.roles.includes('picker')).length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

viewAllUsers();
