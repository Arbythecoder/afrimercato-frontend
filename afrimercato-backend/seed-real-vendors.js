// =================================================================
// SEED REAL VENDORS - Production Quality Data
// =================================================================
// This script creates real vendors with proper location data
// Run with: node seed-real-vendors.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const Product = require('./src/models/Product');

// Connect to MongoDB - Try Railway/Production MongoDB first, fallback to local
const connectDB = async () => {
  // First try the Railway MongoDB (if set in environment)
  const railwayMongoDB = process.env.MONGO_URL || process.env.DATABASE_URL;

  // Fallback to your MongoDB Atlas
  const atlasMongoDB = process.env.MONGODB_URI;

  // Last resort - local MongoDB
  const localMongoDB = 'mongodb://localhost:27017/afrimercato';

  const mongoOptions = [
    { uri: railwayMongoDB, name: 'Railway/Production' },
    { uri: atlasMongoDB, name: 'MongoDB Atlas' },
    { uri: localMongoDB, name: 'Local MongoDB' }
  ].filter(opt => opt.uri); // Remove empty options

  for (const { uri, name } of mongoOptions) {
    try {
      console.log(`🔌 Trying to connect to ${name}...`);
      await mongoose.connect(uri);
      console.log(`✅ Successfully connected to ${name}!`);
      console.log(`📍 Database: ${mongoose.connection.name}\n`);
      return;
    } catch (error) {
      console.log(`❌ ${name} connection failed: ${error.message}`);
    }
  }

  console.error('\n❌ All database connections failed!');
  console.error('💡 Solutions:');
  console.error('   1. Check your MongoDB Atlas password in .env');
  console.error('   2. Install and start local MongoDB');
  console.error('   3. Or run this on Railway where database is available\n');
  process.exit(1);
};

// Real UK Vendors with Authentic African Stores
const realVendors = [
  {
    email: 'greenvalley@afrimercato.com',
    name: 'Green Valley Farms',
    phone: '+44207946000',
    businessName: 'Green Valley Farms Ltd',
    businessType: 'individual',
    category: 'fresh-produce',
    description: 'Fresh organic vegetables and fruits delivered daily. Specializing in African vegetables like spinach, bitter leaf, and okra.',
    address: {
      street: '123 Ridley Road Market',
      city: 'London',
      state: 'Greater London',
      postcode: 'E8 2NP',
      country: 'United Kingdom',
      coordinates: {
        latitude: 51.5464,
        longitude: -0.0755
      }
    },
    deliverySettings: {
      isDeliveryEnabled: true,
      deliveryFee: 2.99,
      freeDeliveryThreshold: 25,
      deliveryRadius: 8,
      estimatedDeliveryTime: '20-35'
    },
    businessHours: {
      monday: { open: '08:00', close: '20:00', isOpen: true },
      tuesday: { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday: { open: '08:00', close: '20:00', isOpen: true },
      friday: { open: '08:00', close: '20:00', isOpen: true },
      saturday: { open: '09:00', close: '18:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: true }
    },
    rating: 4.8,
    totalOrders: 523,
    isVerified: true,
    isActive: true
  },
  {
    email: 'africaspicemarket@afrimercato.com',
    name: 'Africa Spice Market',
    phone: '+44207946002',
    businessName: 'Africa Spice Market Ltd',
    businessType: 'company',
    category: 'spices-grains',
    description: 'Authentic African spices, grains, and staples. From Ghana to Nigeria, Somalia to Ethiopia - we have it all!',
    address: {
      street: '45 Peckham Rye',
      city: 'London',
      state: 'Greater London',
      postcode: 'SE15 4ST',
      country: 'United Kingdom',
      coordinates: {
        latitude: 51.4695,
        longitude: -0.0695
      }
    },
    deliverySettings: {
      isDeliveryEnabled: true,
      deliveryFee: 3.49,
      freeDeliveryThreshold: 30,
      deliveryRadius: 10,
      estimatedDeliveryTime: '25-40'
    },
    businessHours: {
      monday: { open: '09:00', close: '19:00', isOpen: true },
      tuesday: { open: '09:00', close: '19:00', isOpen: true },
      wednesday: { open: '09:00', close: '19:00', isOpen: true },
      thursday: { open: '09:00', close: '19:00', isOpen: true },
      friday: { open: '09:00', close: '19:00', isOpen: true },
      saturday: { open: '10:00', close: '18:00', isOpen: true },
      sunday: { open: '11:00', close: '17:00', isOpen: true }
    },
    rating: 4.9,
    totalOrders: 712,
    isVerified: true,
    isActive: true
  },
  {
    email: 'lagoskitchen@afrimercato.com',
    name: 'Lagos Kitchen Store',
    phone: '+44207946003',
    businessName: 'Lagos Kitchen Supplies',
    businessType: 'individual',
    category: 'groceries',
    description: 'Your one-stop shop for Nigerian groceries. Palm oil, garri, yam flour, plantain, and authentic Nigerian ingredients.',
    address: {
      street: '78 Brixton Road',
      city: 'London',
      state: 'Greater London',
      postcode: 'SW9 6BE',
      country: 'United Kingdom',
      coordinates: {
        latitude: 51.4615,
        longitude: -0.1114
      }
    },
    deliverySettings: {
      isDeliveryEnabled: true,
      deliveryFee: 2.49,
      freeDeliveryThreshold: 20,
      deliveryRadius: 7,
      estimatedDeliveryTime: '20-30'
    },
    businessHours: {
      monday: { open: '08:00', close: '20:00', isOpen: true },
      tuesday: { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday: { open: '08:00', close: '20:00', isOpen: true },
      friday: { open: '08:00', close: '21:00', isOpen: true },
      saturday: { open: '09:00', close: '20:00', isOpen: true },
      sunday: { open: '10:00', close: '18:00', isOpen: true }
    },
    rating: 4.7,
    totalOrders: 438,
    isVerified: true,
    isActive: true
  },
  {
    email: 'tropicalfruits@afrimercato.com',
    name: 'Tropical Fruits Hub',
    phone: '+44161123456',
    businessName: 'Tropical Fruits Hub',
    businessType: 'individual',
    category: 'fruits',
    description: 'Fresh tropical fruits delivered daily. Plantain, mangoes, papaya, avocados and more!',
    address: {
      street: '34 Cheetham Hill Road',
      city: 'Manchester',
      state: 'Greater Manchester',
      postcode: 'M8 8EJ',
      country: 'United Kingdom',
      coordinates: {
        latitude: 53.5002,
        longitude: -2.2365
      }
    },
    deliverySettings: {
      isDeliveryEnabled: true,
      deliveryFee: 3.99,
      freeDeliveryThreshold: 25,
      deliveryRadius: 9,
      estimatedDeliveryTime: '30-45'
    },
    businessHours: {
      monday: { open: '09:00', close: '19:00', isOpen: true },
      tuesday: { open: '09:00', close: '19:00', isOpen: true },
      wednesday: { open: '09:00', close: '19:00', isOpen: true },
      thursday: { open: '09:00', close: '19:00', isOpen: true },
      friday: { open: '09:00', close: '19:00', isOpen: true },
      saturday: { open: '10:00', close: '17:00', isOpen: true },
      sunday: { open: false }
    },
    rating: 4.6,
    totalOrders: 234,
    isVerified: true,
    isActive: true
  },
  {
    email: 'freshmeathalal@afrimercato.com',
    name: 'Fresh Meat & Halal',
    phone: '+44121234567',
    businessName: 'Birmingham Halal Butchers',
    businessType: 'company',
    category: 'meat-fish',
    description: 'Premium halal meat and fresh fish. Quality guaranteed, ethically sourced.',
    address: {
      street: '23 Soho Road',
      city: 'Birmingham',
      state: 'West Midlands',
      postcode: 'B21 9ST',
      country: 'United Kingdom',
      coordinates: {
        latitude: 52.5048,
        longitude: -1.9180
      }
    },
    deliverySettings: {
      isDeliveryEnabled: true,
      deliveryFee: 4.99,
      freeDeliveryThreshold: 35,
      deliveryRadius: 12,
      estimatedDeliveryTime: '35-50'
    },
    businessHours: {
      monday: { open: '07:00', close: '19:00', isOpen: true },
      tuesday: { open: '07:00', close: '19:00', isOpen: true },
      wednesday: { open: '07:00', close: '19:00', isOpen: true },
      thursday: { open: '07:00', close: '19:00', isOpen: true },
      friday: { open: '06:00', close: '20:00', isOpen: true },
      saturday: { open: '07:00', close: '19:00', isOpen: true },
      sunday: { open: '09:00', close: '15:00', isOpen: true }
    },
    rating: 4.8,
    totalOrders: 892,
    isVerified: true,
    isActive: true
  }
];

// Sample products for each vendor
const productsData = {
  'greenvalley@afrimercato.com': [
    {
      name: 'Fresh Organic Tomatoes',
      description: 'Locally sourced organic tomatoes, perfect for salads and cooking.',
      category: 'vegetables',
      price: 2.99,
      unit: 'kg',
      stock: 150,
      lowStockThreshold: 20,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', isPrimary: true }]
    },
    {
      name: 'African Spinach (Callaloo)',
      description: 'Fresh African spinach, rich in iron and vitamins.',
      category: 'vegetables',
      price: 3.49,
      unit: 'bunch',
      stock: 80,
      lowStockThreshold: 15,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', isPrimary: true }]
    },
    {
      name: 'Fresh Okra',
      description: 'Premium quality okra for soups and stews.',
      category: 'vegetables',
      price: 4.99,
      unit: 'kg',
      stock: 60,
      lowStockThreshold: 10,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', isPrimary: true }]
    }
  ],
  'africaspicemarket@afrimercato.com': [
    {
      name: 'Premium Palm Oil (Red Oil)',
      description: 'Authentic West African red palm oil, 100% pure.',
      category: 'spices',
      price: 8.99,
      unit: 'liter',
      stock: 200,
      lowStockThreshold: 30,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a0b3b46fe6b6?w=400', isPrimary: true }]
    },
    {
      name: 'Suya Spice Mix',
      description: 'Traditional Nigerian suya spice blend - hot and aromatic.',
      category: 'spices',
      price: 5.49,
      unit: 'pack',
      stock: 120,
      lowStockThreshold: 20,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=400', isPrimary: true }]
    },
    {
      name: 'Jollof Rice Seasoning',
      description: 'Perfect blend for authentic Nigerian jollof rice.',
      category: 'spices',
      price: 4.99,
      unit: 'pack',
      stock: 95,
      lowStockThreshold: 15,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', isPrimary: true }]
    }
  ],
  'lagoskitchen@afrimercato.com': [
    {
      name: 'Yellow Plantain (Ripe)',
      description: 'Sweet ripe plantains, ready to fry or grill.',
      category: 'fruits',
      price: 3.99,
      unit: 'kg',
      stock: 180,
      lowStockThreshold: 25,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400', isPrimary: true }]
    },
    {
      name: 'Garri (White)',
      description: 'Premium quality cassava flakes (garri) for eba.',
      category: 'grains',
      price: 6.99,
      unit: 'kg',
      stock: 140,
      lowStockThreshold: 20,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', isPrimary: true }]
    }
  ]
};

const seedVendors = async () => {
  try {
    console.log('🌱 Starting vendor seeding...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing vendors, users, and products...');
    await Promise.all([
      User.deleteMany({ role: 'vendor', email: { $in: realVendors.map(v => v.email) } }),
      Vendor.deleteMany({ 'user.email': { $in: realVendors.map(v => v.email) } }),
      Product.deleteMany({}) // Clear products to reseed
    ]);
    console.log('✅ Cleared old data\n');

    let successCount = 0;

    for (const vendorData of realVendors) {
      try {
        console.log(`📍 Creating vendor: ${vendorData.name}...`);

        // 1. Create user account
        const hashedPassword = await bcrypt.hash('Password123', 10);
        const user = await User.create({
          name: vendorData.name,
          email: vendorData.email,
          password: hashedPassword,
          role: 'vendor',
          phone: vendorData.phone,
          isVerified: true,
          isActive: true
        });

        // 2. Create vendor profile
        const vendor = await Vendor.create({
          user: user._id,
          businessName: vendorData.businessName,
          businessType: vendorData.businessType,
          category: vendorData.category,
          description: vendorData.description,
          address: vendorData.address,
          phone: vendorData.phone,
          deliverySettings: vendorData.deliverySettings,
          businessHours: vendorData.businessHours,
          rating: vendorData.rating,
          totalOrders: vendorData.totalOrders,
          isVerified: vendorData.isVerified,
          isActive: vendorData.isActive
        });

        // 3. Create sample products for this vendor
        const products = productsData[vendorData.email] || [];
        if (products.length > 0) {
          const productsWithVendor = products.map(p => ({
            ...p,
            vendor: vendor._id
          }));

          await Product.insertMany(productsWithVendor);
          console.log(`  ✅ Created ${products.length} products`);
        }

        console.log(`  ✅ Created vendor: ${vendorData.name}`);
        console.log(`  📧 Login: ${vendorData.email} / Password123`);
        console.log(`  📍 Location: ${vendorData.address.city}, ${vendorData.address.postcode}\n`);

        successCount++;
      } catch (error) {
        console.error(`  ❌ Failed to create ${vendorData.name}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully seeded ${successCount}/${realVendors.length} vendors!\n`);

    // Display summary
    const vendorCount = await Vendor.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments({ role: 'vendor' });

    console.log('📊 DATABASE SUMMARY:');
    console.log(`   Vendors: ${vendorCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Vendor Users: ${userCount}\n`);

    console.log('🔐 LOGIN CREDENTIALS:');
    realVendors.forEach(v => {
      console.log(`   ${v.name}: ${v.email} / Password123`);
    });

    console.log('\n🚀 All vendors are ready! You can now:');
    console.log('   1. Login to vendor dashboard with above credentials');
    console.log('   2. Browse stores on the customer marketplace');
    console.log('   3. Search by location (London, Manchester, Birmingham)');
    console.log('   4. Place test orders\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
  }
};

// Run the seeder
connectDB().then(() => {
  seedVendors();
});
