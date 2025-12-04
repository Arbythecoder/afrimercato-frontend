// =================================================================
// CREATE UK VENDORS WITH GEOLOCATION
// =================================================================
// Creates sample vendors across UK cities with proper coordinates
// Run with: node create-uk-vendors-with-locations.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const Product = require('./src/models/Product');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Sample vendors across different UK cities
const vendorsData = [
  // BRISTOL
  {
    email: 'bristol.freshmarket@test.com',
    storeName: 'Bristol Fresh Market',
    category: 'fresh-produce',
    description: 'Your local source for fresh fruits and vegetables in Bristol',
    city: 'Bristol',
    latitude: 51.4545,
    longitude: -2.5879,
    rating: 4.6,
    reviewCount: 124
  },
  {
    email: 'bristol.organic@test.com',
    storeName: 'Bristol Organic Store',
    category: 'groceries',
    description: 'Certified organic groceries and health foods',
    city: 'Bristol',
    latitude: 51.4585,
    longitude: -2.5912,
    rating: 4.8,
    reviewCount: 89
  },
  {
    email: 'bristol.butcher@test.com',
    storeName: 'Bristol Quality Meats',
    category: 'meat-fish',
    description: 'Premium quality meats and fresh fish daily',
    city: 'Bristol',
    latitude: 51.4512,
    longitude: -2.5845,
    rating: 4.7,
    reviewCount: 156
  },

  // LONDON
  {
    email: 'london.supermart@test.com',
    storeName: 'London SuperMart',
    category: 'groceries',
    description: 'Everything you need for your weekly shopping',
    city: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    rating: 4.5,
    reviewCount: 342
  },
  {
    email: 'london.bakery@test.com',
    storeName: 'London Artisan Bakery',
    category: 'bakery',
    description: 'Freshly baked bread and pastries every morning',
    city: 'London',
    latitude: 51.5145,
    longitude: -0.1312,
    rating: 4.9,
    reviewCount: 278
  },
  {
    email: 'london.greengrocers@test.com',
    storeName: 'Green & Fresh London',
    category: 'fresh-produce',
    description: 'Farm-fresh produce delivered to your door',
    city: 'London',
    latitude: 51.5012,
    longitude: -0.1345,
    rating: 4.6,
    reviewCount: 198
  },

  // MANCHESTER
  {
    email: 'manchester.marketplace@test.com',
    storeName: 'Manchester Market Place',
    category: 'groceries',
    description: 'Your neighborhood grocery store in Manchester',
    city: 'Manchester',
    latitude: 53.4808,
    longitude: -2.2426,
    rating: 4.4,
    reviewCount: 167
  },
  {
    email: 'manchester.seafood@test.com',
    storeName: 'Manchester Fresh Catch',
    category: 'meat-fish',
    description: 'Fresh seafood from local suppliers',
    city: 'Manchester',
    latitude: 53.4845,
    longitude: -2.2387,
    rating: 4.7,
    reviewCount: 112
  },

  // BIRMINGHAM
  {
    email: 'birmingham.grocers@test.com',
    storeName: 'Birmingham Grocery Hub',
    category: 'groceries',
    description: 'Quality groceries at affordable prices',
    city: 'Birmingham',
    latitude: 52.4862,
    longitude: -1.8904,
    rating: 4.3,
    reviewCount: 234
  },
  {
    email: 'birmingham.fruits@test.com',
    storeName: 'Birmingham Fruit Basket',
    category: 'fresh-produce',
    description: 'Exotic and local fruits year-round',
    city: 'Birmingham',
    latitude: 52.4892,
    longitude: -1.8934,
    rating: 4.5,
    reviewCount: 145
  },

  // LEEDS
  {
    email: 'leeds.wholesome@test.com',
    storeName: 'Wholesome Leeds',
    category: 'groceries',
    description: 'Wholesome food for wholesome living',
    city: 'Leeds',
    latitude: 53.8008,
    longitude: -1.5491,
    rating: 4.6,
    reviewCount: 156
  },

  // LIVERPOOL
  {
    email: 'liverpool.fresh@test.com',
    storeName: 'Liverpool Fresh Foods',
    category: 'fresh-produce',
    description: 'Fresh, local, and affordable produce',
    city: 'Liverpool',
    latitude: 53.4084,
    longitude: -2.9916,
    rating: 4.4,
    reviewCount: 189
  }
];

async function createUKVendors() {
  try {
    log('\n' + '='.repeat(60), 'cyan');
    log('CREATING UK VENDORS WITH GEOLOCATION', 'cyan');
    log('='.repeat(60), 'cyan');

    // Connect to MongoDB
    log('\nConnecting to MongoDB...', 'yellow');
    await mongoose.connect(process.env.MONGODB_URI);
    log('✓ Connected to MongoDB', 'green');

    let created = 0;
    let skipped = 0;

    for (const vendorData of vendorsData) {
      try {
        // Check if vendor already exists
        const existingUser = await User.findOne({ email: vendorData.email });

        if (existingUser) {
          log(`\n  ⊘ Skipped: ${vendorData.storeName} (already exists)`, 'yellow');
          skipped++;
          continue;
        }

        // Create user account
        const user = await User.create({
          name: vendorData.storeName,
          email: vendorData.email,
          password: 'Password123',
          roles: ['vendor'],
          primaryRole: 'vendor',
          isEmailVerified: true
        });

        // Create vendor profile
        const vendor = await Vendor.create({
          user: user._id,
          storeId: `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          storeName: vendorData.storeName,
          description: vendorData.description,
          category: vendorData.category,
          address: {
            street: '123 High Street',
            city: vendorData.city,
            state: vendorData.city === 'London' ? 'Greater London' : vendorData.city,
            postalCode: 'XX1 1XX',
            country: 'United Kingdom',
            coordinates: {
              latitude: vendorData.latitude,
              longitude: vendorData.longitude
            }
          },
          phone: '+44-20-1234-5678',
          rating: vendorData.rating,
          reviewCount: vendorData.reviewCount,
          deliveryFee: Math.floor(Math.random() * 3) + 1, // £1-£4
          freeDeliveryAbove: 25,
          deliveryRadius: 10,
          isVerified: true,
          isActive: true
        });

        // Create sample products for this vendor
        const productTemplates = [
          { name: 'Fresh Tomatoes', price: 2.50, category: 'vegetables' },
          { name: 'Organic Apples', price: 3.50, category: 'fruits' },
          { name: 'Fresh Bread', price: 1.80, category: 'bakery' },
          { name: 'Milk 2L', price: 1.20, category: 'dairy' },
          { name: 'Free Range Eggs', price: 2.80, category: 'dairy' }
        ];

        const products = [];
        for (const template of productTemplates) {
          products.push({
            vendor: vendor._id,
            name: template.name,
            description: `Fresh ${template.name.toLowerCase()} from ${vendorData.storeName}`,
            category: template.category,
            price: template.price,
            unit: 'kg',
            stock: Math.floor(Math.random() * 100) + 50,
            lowStockThreshold: 10,
            inStock: true,
            isActive: true,
            images: [{
              url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
              isPrimary: true
            }]
          });
        }

        await Product.insertMany(products);

        // Update vendor product count
        vendor.stats.totalProducts = products.length;
        await vendor.save();

        log(`\n✓ Created: ${vendorData.storeName}`, 'green');
        log(`  📍 Location: ${vendorData.city} [${vendorData.latitude}, ${vendorData.longitude}]`, 'yellow');
        log(`  ⭐ Rating: ${vendorData.rating}/5 (${vendorData.reviewCount} reviews)`, 'yellow');
        log(`  📦 Products: ${products.length}`, 'yellow');

        created++;

      } catch (error) {
        log(`\n✗ Error creating ${vendorData.storeName}:`, 'red');
        log(`  ${error.message}`, 'red');
      }
    }

    // Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('SUMMARY', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Total vendors: ${vendorsData.length}`, 'cyan');
    log(`Created: ${created}`, 'green');
    log(`Skipped: ${skipped}`, 'yellow');
    log('='.repeat(60), 'cyan');

    if (created > 0) {
      log('\n🎉 UK vendors created successfully!', 'green');
      log('✅ You can now test location search:', 'green');
      log('   GET /api/location/search-vendors?location=Bristol%20UK&radius=20', 'yellow');
    }

  } catch (error) {
    log('\n✗ Fatal error:', 'red');
    log(error.message, 'red');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log('\n✓ Database connection closed\n', 'yellow');
  }
}

// Run the script
createUKVendors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
