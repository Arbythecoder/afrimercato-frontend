/**
 * SAMPLE VENDORS & PRODUCTS GENERATOR
 * Creates 3 verified vendor accounts with products for demo purposes
 * Run: node create-sample-vendors.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const Product = require('./src/models/Product');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
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
      country: 'United Kingdom'
    },
    products: [
      { name: 'Organic Tomatoes', price: 2.99, unit: 'kg', stock: 150, category: 'vegetables', description: 'Fresh organic tomatoes grown without pesticides' },
      { name: 'Fresh Carrots', price: 1.49, unit: 'kg', stock: 200, category: 'vegetables', description: 'Crunchy orange carrots, perfect for cooking' },
      { name: 'Sweet Potatoes', price: 2.49, unit: 'kg', stock: 100, category: 'vegetables', description: 'Nutritious sweet potatoes, great for roasting' },
      { name: 'Bell Peppers (Mixed)', price: 3.99, unit: 'kg', stock: 80, category: 'vegetables', description: 'Colorful bell peppers - red, yellow, and green' },
      { name: 'Fresh Spinach', price: 1.99, unit: 'bunch', stock: 120, category: 'vegetables', description: 'Fresh leafy spinach, packed with nutrients' },
      { name: 'Organic Lettuce', price: 1.29, unit: 'piece', stock: 90, category: 'vegetables', description: 'Crisp organic lettuce for salads' },
      { name: 'Red Onions', price: 1.79, unit: 'kg', stock: 180, category: 'vegetables', description: 'Fresh red onions for cooking' },
      { name: 'Garlic Bulbs', price: 2.99, unit: 'pack', stock: 150, category: 'vegetables', description: 'Fresh garlic bulbs, aromatic and flavorful' },
      { name: 'Fresh Broccoli', price: 2.49, unit: 'piece', stock: 70, category: 'vegetables', description: 'Green broccoli heads, perfect for steaming' },
      { name: 'Garden Cucumbers', price: 1.49, unit: 'piece', stock: 110, category: 'vegetables', description: 'Fresh cucumbers for salads and snacks' },
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
      country: 'United Kingdom'
    },
    products: [
      { name: 'British Beef Mince', price: 6.99, unit: 'kg', stock: 50, category: 'meat', description: 'Premium lean beef mince, 85% lean' },
      { name: 'Free Range Chicken Breast', price: 8.99, unit: 'kg', stock: 60, category: 'poultry', description: 'Boneless chicken breast from free-range farms' },
      { name: 'Lamb Chops', price: 12.99, unit: 'kg', stock: 30, category: 'meat', description: 'Tender lamb chops, perfect for grilling' },
      { name: 'Pork Sausages', price: 4.99, unit: 'pack', stock: 80, category: 'meat', description: 'Traditional British pork sausages' },
      { name: 'Bacon Rashers', price: 3.99, unit: 'pack', stock: 90, category: 'meat', description: 'Smoked back bacon, 8 rashers per pack' },
      { name: 'Whole Chicken', price: 7.49, unit: 'piece', stock: 40, category: 'poultry', description: 'Fresh whole chicken, approximately 1.5kg' },
      { name: 'Fresh Salmon Fillets', price: 14.99, unit: 'kg', stock: 35, category: 'fish', description: 'Premium Scottish salmon fillets' },
      { name: 'Cod Fish Fillets', price: 11.99, unit: 'kg', stock: 45, category: 'fish', description: 'Fresh cod fillets, boneless' },
      { name: 'King Prawns', price: 13.99, unit: 'pack', stock: 55, category: 'fish', description: 'Large king prawns, ready to cook' },
      { name: 'Turkey Breast', price: 9.99, unit: 'kg', stock: 25, category: 'poultry', description: 'Lean turkey breast, perfect for roasting' },
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
      country: 'United Kingdom'
    },
    products: [
      { name: 'Whole Milk (2L)', price: 1.49, unit: 'liter', stock: 200, category: 'dairy', description: 'Fresh whole milk from UK farms' },
      { name: 'Semi-Skimmed Milk (2L)', price: 1.39, unit: 'liter', stock: 220, category: 'dairy', description: 'Semi-skimmed milk, lower fat content' },
      { name: 'Cheddar Cheese Block', price: 3.99, unit: 'pack', stock: 100, category: 'dairy', description: 'Mature cheddar cheese, 400g block' },
      { name: 'Greek Yogurt (500g)', price: 2.49, unit: 'pack', stock: 80, category: 'dairy', description: 'Thick and creamy Greek yogurt' },
      { name: 'Butter (250g)', price: 1.99, unit: 'pack', stock: 150, category: 'dairy', description: 'Salted butter, perfect for cooking' },
      { name: 'Free Range Eggs (12)', price: 2.99, unit: 'dozen', stock: 180, category: 'dairy', description: 'Fresh free-range eggs, large' },
      { name: 'Double Cream (300ml)', price: 1.79, unit: 'pack', stock: 90, category: 'dairy', description: 'Rich double cream for cooking' },
      { name: 'Mozzarella Cheese', price: 2.49, unit: 'pack', stock: 70, category: 'dairy', description: 'Fresh mozzarella, 250g pack' },
      { name: 'Natural Yogurt (1L)', price: 1.99, unit: 'liter', stock: 110, category: 'dairy', description: 'Plain natural yogurt, no added sugar' },
      { name: 'Cottage Cheese (300g)', price: 1.89, unit: 'pack', stock: 95, category: 'dairy', description: 'Low-fat cottage cheese' },
    ]
  }
];

// Create vendors and products
const createSampleData = async () => {
  console.log('\n🚀 Starting Sample Data Generation...\n');

  try {
    // Clear existing sample data
    console.log('🧹 Clearing existing sample data...');

    // Get all sample vendor emails
    const sampleEmails = sampleVendors.map(v => v.email);

    // Delete users first (by email)
    const deletedUsers = await User.deleteMany({ email: { $in: sampleEmails } });
    console.log(`  Deleted ${deletedUsers.deletedCount} users`);

    // Delete vendors (by storeName)
    const deletedVendors = await Vendor.deleteMany({ storeName: { $in: sampleVendors.map(v => v.storeName) } });
    console.log(`  Deleted ${deletedVendors.deletedCount} vendors`);

    // Delete all products from those vendors (get vendor IDs first)
    const vendorIds = (await Vendor.find({ storeName: { $in: sampleVendors.map(v => v.storeName) } })).map(v => v._id);
    if (vendorIds.length > 0) {
      const deletedProducts = await Product.deleteMany({ vendor: { $in: vendorIds } });
      console.log(`  Deleted ${deletedProducts.deletedCount} products`);
    }

    console.log('✅ Existing data cleared\n');

    for (const vendorData of sampleVendors) {
      console.log(`📦 Creating: ${vendorData.name}`);

      // 1. Create User
      const user = await User.create({
        name: vendorData.name,
        email: vendorData.email,
        password: vendorData.password,
        role: 'vendor',
        isEmailVerified: true,
        isActive: true
      });
      console.log(`  ✅ User created: ${user.email}`);

      // 2. Create Vendor Profile
      // Generate unique storeId from store name
      const storeId = vendorData.storeName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

      const vendor = await Vendor.create({
        user: user._id,
        storeId: storeId,
        storeName: vendorData.storeName,
        category: vendorData.category,
        description: vendorData.description,
        phone: vendorData.phone,
        address: vendorData.address,
        isVerified: true, // ✅ PRE-VERIFIED
        verificationStatus: 'approved',
        rating: 4.5 + Math.random() * 0.5, // Random rating 4.5-5.0
        totalReviews: Math.floor(Math.random() * 100) + 50
      });
      console.log(`  ✅ Vendor created: ${vendor.storeName}`);

      // 3. Create Products
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
          rating: 4.0 + Math.random() * 1.0, // Random rating 4.0-5.0
          totalReviews: Math.floor(Math.random() * 50) + 10,
          images: [{
            url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=400`,
            isPrimary: true
          }]
        }))
      );
      console.log(`  ✅ ${products.length} products created\n`);
    }

    console.log('🎉 Sample data created successfully!\n');
    console.log('📋 Summary:');
    console.log(`  - ${sampleVendors.length} Verified Vendors`);
    console.log(`  - ${sampleVendors.reduce((sum, v) => sum + v.products.length, 0)} Products`);
    console.log(`  - All vendors are PRE-VERIFIED ✅`);
    console.log(`  - All products are UK-priced in GBP (£)`);
    console.log('\n📧 Login Credentials (all same password):');
    sampleVendors.forEach(v => {
      console.log(`  - ${v.email} / Password123`);
    });
    console.log('\n✅ You can now demo the application with real data!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run the script
connectDB().then(() => createSampleData());
