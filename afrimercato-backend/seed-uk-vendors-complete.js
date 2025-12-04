// =================================================================
// COMPREHENSIVE UK VENDOR SEEDING SCRIPT
// =================================================================
// Creates UK vendors with coordinates, products, and proper setup
// Run this against Railway's database to populate it

require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('./src/models/Vendor');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

// UK vendor data with real coordinates
const ukVendors = [
  {
    city: 'Bristol',
    coords: { latitude: 51.4545, longitude: -2.5879 },
    vendors: [
      { name: 'Bristol Fresh Market', category: 'groceries', description: 'Your local fresh market' },
      { name: 'Bristol Organic Store', category: 'organic', description: 'Organic produce and health foods' },
      { name: 'Bristol Quality Meats', category: 'meats', description: 'Premium meats and poultry' }
    ]
  },
  {
    city: 'London',
    coords: { latitude: 51.5074, longitude: -0.1278 },
    vendors: [
      { name: 'London SuperMart', category: 'groceries', description: 'Everything you need in one place' },
      { name: 'London Artisan Bakery', category: 'bakery', description: 'Fresh bread and pastries daily' },
      { name: 'Green & Fresh London', category: 'organic', description: 'Sustainable and organic groceries' }
    ]
  },
  {
    city: 'Manchester',
    coords: { latitude: 53.4808, longitude: -2.2426 },
    vendors: [
      { name: 'Manchester Market Place', category: 'groceries', description: 'Traditional market feel' },
      { name: 'Manchester Fresh Catch', category: 'seafood', description: 'Fresh fish and seafood daily' }
    ]
  },
  {
    city: 'Birmingham',
    coords: { latitude: 52.4862, longitude: -1.8904 },
    vendors: [
      { name: 'Birmingham Grocery Hub', category: 'groceries', description: 'Quality groceries at great prices' },
      { name: 'Birmingham Fruit Basket', category: 'fresh-produce', description: 'Fresh fruits and vegetables' }
    ]
  },
  {
    city: 'Leeds',
    coords: { latitude: 53.8008, longitude: -1.5491 },
    vendors: [
      { name: 'Wholesome Leeds', category: 'organic', description: 'Wholesome foods for healthy living' }
    ]
  },
  {
    city: 'Liverpool',
    coords: { latitude: 53.4084, longitude: -2.9916 },
    vendors: [
      { name: 'Liverpool Fresh Foods', category: 'groceries', description: 'Quality groceries delivered' }
    ]
  }
];

// Sample products for each category
const productTemplates = {
  groceries: [
    { name: 'Organic Brown Rice', price: 3.99, unit: 'kg', category: 'grains' },
    { name: 'Fresh Milk', price: 1.50, unit: 'liter', category: 'dairy' },
    { name: 'Whole Wheat Bread', price: 2.20, unit: 'loaf', category: 'bakery' },
    { name: 'Free Range Eggs', price: 3.50, unit: 'dozen', category: 'dairy' },
    { name: 'Cheddar Cheese', price: 4.99, unit: 'kg', category: 'dairy' }
  ],
  'fresh-produce': [
    { name: 'Organic Tomatoes', price: 2.99, unit: 'kg', category: 'vegetables' },
    { name: 'Fresh Spinach', price: 1.80, unit: 'bunch', category: 'vegetables' },
    { name: 'Sweet Potatoes', price: 2.20, unit: 'kg', category: 'vegetables' },
    { name: 'Red Apples', price: 3.50, unit: 'kg', category: 'fruits' },
    { name: 'Bananas', price: 1.99, unit: 'kg', category: 'fruits' }
  ],
  organic: [
    { name: 'Organic Quinoa', price: 5.99, unit: 'kg', category: 'grains' },
    { name: 'Organic Kale', price: 2.50, unit: 'bunch', category: 'vegetables' },
    { name: 'Organic Avocados', price: 4.99, unit: 'kg', category: 'fruits' },
    { name: 'Organic Chia Seeds', price: 6.50, unit: '500g', category: 'superfoods' }
  ],
  meats: [
    { name: 'Chicken Breast', price: 7.99, unit: 'kg', category: 'poultry' },
    { name: 'Beef Mince', price: 8.50, unit: 'kg', category: 'beef' },
    { name: 'Lamb Chops', price: 12.99, unit: 'kg', category: 'lamb' },
    { name: 'Pork Sausages', price: 5.99, unit: 'pack', category: 'pork' }
  ],
  seafood: [
    { name: 'Fresh Salmon Fillet', price: 15.99, unit: 'kg', category: 'fish' },
    { name: 'King Prawns', price: 18.99, unit: 'kg', category: 'shellfish' },
    { name: 'Cod Fillets', price: 12.50, unit: 'kg', category: 'fish' }
  ],
  bakery: [
    { name: 'Sourdough Loaf', price: 3.50, unit: 'loaf', category: 'bread' },
    { name: 'Croissants', price: 2.99, unit: 'pack of 6', category: 'pastries' },
    { name: 'Chocolate Muffins', price: 4.50, unit: 'pack of 4', category: 'cakes' }
  ]
};

async function seedVendors() {
  try {
    console.log('🌱 Starting UK Vendor Seeding...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let totalVendors = 0;
    let totalProducts = 0;

    for (const cityData of ukVendors) {
      console.log(`\n📍 ${cityData.city}:`);

      for (const vendorData of cityData.vendors) {
        // Create user for vendor
        const userEmail = `${vendorData.name.toLowerCase().replace(/\s+/g, '')}@afrimercato.com`;

        let user = await User.findOne({ email: userEmail });
        if (!user) {
          user = await User.create({
            name: vendorData.name,
            email: userEmail,
            password: await bcrypt.hash('Password123', 10),
            role: 'vendor',
            isVerified: true
          });
        }

        // Add random offset to coordinates (spread vendors across city)
        const latOffset = (Math.random() - 0.5) * 0.01;
        const lngOffset = (Math.random() - 0.5) * 0.01;

        // Create/Update vendor
        let vendor = await Vendor.findOne({ user: user._id });
        if (!vendor) {
          const storeId = vendorData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          vendor = await Vendor.create({
            user: user._id,
            storeId: storeId,
            storeName: vendorData.name,
            description: vendorData.description,
            category: vendorData.category,
            address: {
              street: '123 High Street',
              city: cityData.city,
              state: cityData.city,
              postalCode: 'BS1 1AA',
              country: 'United Kingdom',
              coordinates: {
                latitude: cityData.coords.latitude + latOffset,
                longitude: cityData.coords.longitude + lngOffset
              }
            },
            phone: '+44-800-555-0001',
            businessHours: {
              monday: { open: '08:00', close: '20:00', isOpen: true },
              tuesday: { open: '08:00', close: '20:00', isOpen: true },
              wednesday: { open: '08:00', close: '20:00', isOpen: true },
              thursday: { open: '08:00', close: '20:00', isOpen: true },
              friday: { open: '08:00', close: '20:00', isOpen: true },
              saturday: { open: '09:00', close: '18:00', isOpen: true },
              sunday: { open: '10:00', close: '16:00', isOpen: true }
            },
            isVerified: true,
            isActive: true,
            rating: 4.0 + Math.random() * 1.0,
            reviewCount: Math.floor(Math.random() * 100) + 10,
            deliveryFee: Math.floor(Math.random() * 3) + 1.99,
            freeDeliveryAbove: 25,
            deliveryRadius: 15
          });
          totalVendors++;
        }

        // Create products
        const templates = productTemplates[vendorData.category] || productTemplates.groceries;
        for (const template of templates) {
          const existingProduct = await Product.findOne({
            vendor: vendor._id,
            name: template.name
          });

          if (!existingProduct) {
            await Product.create({
              vendor: vendor._id,
              name: template.name,
              description: `High quality ${template.name.toLowerCase()} from ${vendorData.name}`,
              category: template.category,
              price: template.price,
              unit: template.unit,
              stock: Math.floor(Math.random() * 100) + 20,
              lowStockThreshold: 10,
              inStock: true,
              isActive: true,
              images: []
            });
            totalProducts++;
          }
        }

        console.log(`  ✅ ${vendorData.name} [${cityData.coords.latitude.toFixed(4)}, ${cityData.coords.longitude.toFixed(4)}]`);
      }
    }

    console.log(`\n🎉 Seeding Complete!`);
    console.log(`   📦 Created ${totalVendors} vendors`);
    console.log(`   🛍️  Created ${totalProducts} products`);
    console.log(`\n✅ All vendors are:`);
    console.log(`   - Active and verified`);
    console.log(`   - Have UK coordinates`);
    console.log(`   - Have products ready`);
    console.log(`   - Ready for customer orders!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedVendors();
