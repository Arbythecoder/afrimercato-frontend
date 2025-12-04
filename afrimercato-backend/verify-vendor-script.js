// =====================================================
// VENDOR VERIFICATION SCRIPT
// =====================================================
// This script connects to MongoDB and sets all vendors
// as verified so they can access the dashboard

require('dotenv').config();
const mongoose = require('mongoose');

async function verifyVendors() {
  try {
    console.log('\n==============================================');
    console.log('  VENDOR VERIFICATION SCRIPT');
    console.log('==============================================\n');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/afrimercato');
    console.log('✓ Connected to MongoDB\n');

    // Import models
    const Vendor = require('./src/models/Vendor');
    const User = require('./src/models/User');

    // Find all vendors
    const vendors = await Vendor.find({});
    console.log(`Found ${vendors.length} vendor(s) in database\n`);

    if (vendors.length === 0) {
      console.log('No vendors found. Looking for users with vendor role...\n');

      // Find users with vendor role
      const vendorUsers = await User.find({ role: 'vendor' });
      console.log(`Found ${vendorUsers.length} user(s) with vendor role\n`);

      if (vendorUsers.length > 0) {
        console.log('Creating vendor profiles for these users...\n');

        for (const user of vendorUsers) {
          const existingVendor = await Vendor.findOne({ user: user._id });

          if (!existingVendor) {
            const newVendor = await Vendor.create({
              user: user._id,
              storeName: `${user.name}'s Store`,
              description: 'Fresh produce and quality products',
              category: 'fresh-produce',
              address: {
                street: '123 Main Street',
                city: 'Lagos',
                state: 'Lagos',
                country: 'Nigeria',
                postalCode: '100001'
              },
              phone: user.phone || '08012345678',
              isVerified: true,
              isActive: true,
              businessHours: {
                monday: { open: '08:00', close: '18:00', isOpen: true },
                tuesday: { open: '08:00', close: '18:00', isOpen: true },
                wednesday: { open: '08:00', close: '18:00', isOpen: true },
                thursday: { open: '08:00', close: '18:00', isOpen: true },
                friday: { open: '08:00', close: '18:00', isOpen: true },
                saturday: { open: '09:00', close: '15:00', isOpen: true },
                sunday: { open: '00:00', close: '00:00', isOpen: false }
              }
            });

            console.log(`✓ Created and verified vendor profile for: ${user.name} (${user.email})`);
          } else {
            console.log(`  Vendor profile already exists for: ${user.name}`);
          }
        }
      }
    }

    // Update all existing vendors to be verified and active
    const updateResult = await Vendor.updateMany(
      {},
      {
        $set: {
          isVerified: true,
          isActive: true
        }
      }
    );

    console.log(`\n✓ Updated ${updateResult.modifiedCount} vendor profile(s)`);

    // Display all vendors
    const allVendors = await Vendor.find({}).populate('user', 'name email');

    console.log('\n==============================================');
    console.log('  VERIFIED VENDORS');
    console.log('==============================================\n');

    allVendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.storeName}`);
      console.log(`   Email: ${vendor.user?.email || 'N/A'}`);
      console.log(`   Verified: ${vendor.isVerified ? '✓ YES' : '✗ NO'}`);
      console.log(`   Active: ${vendor.isActive ? '✓ YES' : '✗ NO'}`);
      console.log('');
    });

    console.log('==============================================');
    console.log('  ALL VENDORS ARE NOW VERIFIED!');
    console.log('==============================================\n');

    await mongoose.connection.close();
    console.log('✓ Database connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

verifyVendors();
