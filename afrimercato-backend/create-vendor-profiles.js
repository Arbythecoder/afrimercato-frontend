// Create vendor profiles for existing vendors
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');

const createVendorProfiles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all vendor users
    const vendors = await User.find({ roles: 'vendor' });
    console.log(`\n📋 Found ${vendors.length} vendor users`);

    for (const user of vendors) {
      // Check if profile already exists
      const existingProfile = await Vendor.findOne({ user: user._id });

      if (existingProfile) {
        console.log(`✅ ${user.name} already has a profile`);
        continue;
      }

      // Create vendor profile
      const storeName = user.name;
      const storeId = `STR${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const vendorProfile = await Vendor.create({
        storeId,
        user: user._id,
        storeName: storeName,
        description: `Welcome to ${storeName}! We offer fresh, quality products delivered to your door.`,
        category: 'fresh-produce',
        address: {
          street: '123 Main Street',
          city: 'Dublin',
          state: 'Dublin',
          country: 'Ireland',
          postalCode: 'D01 F5P2'
        },
        phone: '+353-1-234-5678',
        businessHours: {
          monday: { open: '09:00', close: '18:00', isOpen: true },
          tuesday: { open: '09:00', close: '18:00', isOpen: true },
          wednesday: { open: '09:00', close: '18:00', isOpen: true },
          thursday: { open: '09:00', close: '18:00', isOpen: true },
          friday: { open: '09:00', close: '18:00', isOpen: true },
          saturday: { open: '10:00', close: '16:00', isOpen: true },
          sunday: { open: '10:00', close: '14:00', isOpen: true }
        },
        isVerified: true, // Auto-verify for testing
        isActive: true
      });

      console.log(`✅ Created profile for ${user.name} (Store ID: ${storeId})`);
    }

    console.log('\n🎉 All vendor profiles created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createVendorProfiles();
