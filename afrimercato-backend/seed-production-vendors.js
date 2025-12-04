/**
 * SEED VENDORS TO PRODUCTION DATABASE
 * This creates the 3 main demo vendors in your Railway/production database
 * Run: MONGODB_URI=your_production_uri node seed-production-vendors.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const Product = require('./src/models/Product');

// Production MongoDB URI (from .env or Railway)
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔗 Connecting to:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Sample vendor data (UK-focused)
const sampleVendors = [
  {
    name: 'Fresh Valley Farms',
    email: 'freshvalley@afrimercato.com',
    password: 'Password123',
    storeName: 'Fresh Valley Farms',
    category: 'fresh-produce',
    description: 'Organic vegetables and fresh produce delivered daily from our UK farms.',
    phone: '+44-20-7946-0958',
    address: {
      street: '123 Farm Road',
      city: 'London',
      state: 'Greater London',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom',
      coordinates: {
        latitude: 51.5074,
        longitude: -0.1278
      }
    },
    products: [
      { name: 'Organic Tomatoes', price: 2.99, unit: 'kg', stock: 150, category: 'vegetables', description: 'Fresh organic tomatoes grown without pesticides' },
      { name: 'Fresh Carrots', price: 1.49, unit: 'kg', stock: 200, category: 'vegetables', description: 'Crunchy orange carrots, perfect for cooking' },
      { name: 'Sweet Potatoes', price: 2.49, unit: 'kg', stock: 100, category: 'vegetables', description: 'Nutritious sweet potatoes, great for roasting' },
      { name: 'Bell Peppers (Mixed)', price: 3.99, unit: 'kg', stock: 80, category: 'vegetables', description: 'Colorful bell peppers - red, yellow, and green' },
      { name: 'Fresh Spinach', price: 1.99, unit: 'bunch', stock: 120, category: 'vegetables', description: 'Fresh leafy spinach, packed with nutrients' }
    ]
  },
  {
    name: 'The Butcher\'s Block',
    email: 'butchersblock@afrimercato.com',
    password: 'Password123',
    storeName: 'The Butcher\'s Block',
    category: 'fresh-produce',
    description: 'Premium quality meats and poultry from trusted UK suppliers.',
    phone: '+44-20-7946-0959',
    address: {
      street: '45 Market Street',
      city: 'Manchester',
      state: 'Greater Manchester',
      postcode: 'M1 1AD',
      country: 'United Kingdom',
      coordinates: {
        latitude: 53.4808,
        longitude: -2.2426
      }
    },
    products: [
      { name: 'British Beef Mince', price: 6.99, unit: 'kg', stock: 50, category: 'meat', description: 'Premium lean beef mince, 85% lean' },
      { name: 'Free Range Chicken Breast', price: 8.99, unit: 'kg', stock: 60, category: 'poultry', description: 'Boneless chicken breast from free-range farms' },
      { name: 'Lamb Chops', price: 12.99, unit: 'kg', stock: 30, category: 'meat', description: 'Tender lamb chops, perfect for grilling' },
      { name: 'Pork Sausages', price: 4.99, unit: 'pack', stock: 80, category: 'meat', description: 'Traditional British pork sausages' }
    ]
  },
  {
    name: 'Daily Dairy Delights',
    email: 'dailydairy@afrimercato.com',
    password: 'Password123',
    storeName: 'Daily Dairy Delights',
    category: 'groceries',
    description: 'Fresh dairy products delivered daily from local UK farms.',
    phone: '+44-20-7946-0960',
    address: {
      street: '78 Dairy Lane',
      city: 'Birmingham',
      state: 'West Midlands',
      postcode: 'B1 1AA',
      country: 'United Kingdom',
      coordinates: {
        latitude: 52.4862,
        longitude: -1.8904
      }
    },
    products: [
      { name: 'Whole Milk (2L)', price: 1.49, unit: 'liter', stock: 200, category: 'dairy', description: 'Fresh whole milk from UK farms' },
      { name: 'Cheddar Cheese Block', price: 3.99, unit: 'pack', stock: 100, category: 'dairy', description: 'Mature cheddar cheese, 400g block' },
      { name: 'Greek Yogurt (500g)', price: 2.49, unit: 'pack', stock: 80, category: 'dairy', description: 'Thick and creamy Greek yogurt' },
      { name: 'Free Range Eggs (12)', price: 2.99, unit: 'dozen', stock: 180, category: 'dairy', description: 'Fresh free-range eggs, large' }
    ]
  }
];

// Create vendors and products
const createSampleData = async () => {
  console.log('🚀 Starting Production Vendor Seeding...\n');

  try {
    // Check existing vendors
    const existingCount = await Vendor.countDocuments();
    console.log(`📊 Current vendors in database: ${existingCount}\n`);

    for (const vendorData of sampleVendors) {
      console.log(`📦 Processing: ${vendorData.name}`);

      // Check if user already exists
      let user = await User.findOne({ email: vendorData.email });

      if (user) {
        console.log(`  ℹ️  User already exists: ${user.email}`);
      } else {
        // Create User
        user = await User.create({
          name: vendorData.name,
          email: vendorData.email,
          password: vendorData.password,
          role: 'vendor',
          isEmailVerified: true,
          isActive: true
        });
        console.log(`  ✅ User created: ${user.email}`);
      }

      // Check if vendor profile exists
      let vendor = await Vendor.findOne({ user: user._id });

      if (vendor) {
        console.log(`  ℹ️  Vendor profile already exists: ${vendor.storeName}`);
      } else {
        // Create Vendor Profile
        const storeId = vendorData.storeName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        vendor = await Vendor.create({
          user: user._id,
          storeId: storeId,
          storeName: vendorData.storeName,
          category: vendorData.category,
          description: vendorData.description,
          phone: vendorData.phone,
          address: vendorData.address,
          isVerified: true,
          verificationStatus: 'approved',
          isActive: true,
          rating: 4.5 + Math.random() * 0.5,
          totalReviews: Math.floor(Math.random() * 100) + 50
        });
        console.log(`  ✅ Vendor profile created: ${vendor.storeName}`);
      }

      // Check if products exist
      const existingProducts = await Product.countDocuments({ vendor: vendor._id });

      if (existingProducts > 0) {
        console.log(`  ℹ️  ${existingProducts} products already exist`);
      } else {
        // Create Products
        const products = await Product.insertMany(
          vendorData.products.map(p => ({
            vendor: vendor._id,
            name: p.name,
            description: p.description,
            price: p.price,
            unit: p.unit,
            stock: p.stock,
            category: p.category,
            inStock: true,
            isActive: true,
            rating: 4.0 + Math.random() * 1.0,
            totalReviews: Math.floor(Math.random() * 50) + 10,
            images: []
          }))
        );
        console.log(`  ✅ ${products.length} products created`);
      }

      console.log(''); // Blank line
    }

    console.log('🎉 Production seeding completed!\n');
    console.log('📋 Summary:');
    console.log(`  - ${sampleVendors.length} Vendors Ready`);
    console.log(`  - All vendors are VERIFIED ✅`);
    console.log(`  - All products are active ✅\n`);
    console.log('📧 Login Credentials:');
    sampleVendors.forEach(v => {
      console.log(`  - ${v.email} / Password123`);
    });
    console.log('\n✅ You can now login to production!');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run the script
connectDB().then(() => createSampleData());
