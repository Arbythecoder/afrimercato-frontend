// =================================================================
// CURATED DEMO STORES - Production-Safe Seed Data
// =================================================================
// High-quality demo stores for public testing phase
// Realistic names, products, and pricing for UK/Ireland market

const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');
const { geocode } = require('../services/geocodingService');
const bcrypt = require('bcryptjs');

/**
 * Curated demo stores with realistic African grocery inventory
 * These stores represent real businesses and help avoid empty marketplace
 */
const DEMO_STORES = [
  {
    // London - Premium African Groceries
    storeName: "Abis Fresh Farm",
    email: "abis@afrimercato-demo.com",
    phone: "+44 20 7946 0958",
    category: "African Groceries",
    description: "Premium African groceries sourced directly from trusted farms. Specializing in fresh vegetables, authentic spices, and traditional ingredients from Nigeria, Ghana, and across West Africa.",
    address: {
      street: "142 Rye Lane",
      city: "London",
      postcode: "SE15 4NB",
      country: "United Kingdom"
    },
    location: {
      address: "London SE15 4NB",
      postcode: "SE15 4NB"
    },
    businessHours: {
      monday: "8:00 AM - 9:00 PM",
      tuesday: "8:00 AM - 9:00 PM",
      wednesday: "8:00 AM - 9:00 PM",
      thursday: "8:00 AM - 9:00 PM",
      friday: "8:00 AM - 10:00 PM",
      saturday: "8:00 AM - 10:00 PM",
      sunday: "9:00 AM - 8:00 PM"
    },
    products: [
      { name: "Fresh Plantains (Per Bunch)", price: 2.99, stock: 50, unit: "bunch", category: "Fresh Produce" },
      { name: "Yellow Yams (Per Kg)", price: 4.50, stock: 40, unit: "kg", category: "Fresh Produce" },
      { name: "Palm Oil (500ml)", price: 6.99, stock: 30, unit: "bottle", category: "Oils & Sauces" },
      { name: "Egusi Seeds (250g)", price: 5.50, stock: 25, unit: "pack", category: "Spices & Seasonings" },
      { name: "Maggi Star Cubes (50 cubes)", price: 3.99, stock: 40, unit: "box", category: "Spices & Seasonings" },
      { name: "Fresh Okra (500g)", price: 2.50, stock: 35, unit: "pack", category: "Fresh Produce" },
      { name: "Scotch Bonnet Peppers (200g)", price: 2.99, stock: 30, unit: "pack", category: "Fresh Produce" },
      { name: "Nigerian Dried Prawns (100g)", price: 8.99, stock: 20, unit: "pack", category: "Seafood" }
    ]
  },
  {
    // Manchester - Budget-Friendly African Market
    storeName: "Mama Khadija's Market",
    email: "mamakhadija@afrimercato-demo.com",
    phone: "+44 161 839 1122",
    category: "African Groceries",
    description: "Family-run African market bringing you authentic ingredients at affordable prices. We pride ourselves on quality fresh produce and friendly service for the African diaspora community.",
    address: {
      street: "88 Cheetham Hill Road",
      city: "Manchester",
      postcode: "M8 8PZ",
      country: "United Kingdom"
    },
    location: {
      address: "Manchester M8 8PZ",
      postcode: "M8 8PZ"
    },
    businessHours: {
      monday: "9:00 AM - 8:00 PM",
      tuesday: "9:00 AM - 8:00 PM",
      wednesday: "9:00 AM - 8:00 PM",
      thursday: "9:00 AM - 8:00 PM",
      friday: "9:00 AM - 9:00 PM",
      saturday: "9:00 AM - 9:00 PM",
      sunday: "10:00 AM - 7:00 PM"
    },
    products: [
      { name: "Cassava Flour (1kg)", price: 3.99, stock: 50, unit: "pack", category: "Grains & Flours" },
      { name: "Fresh Bitter Leaf (250g)", price: 2.99, stock: 25, unit: "pack", category: "Fresh Produce" },
      { name: "Dried Stockfish (Medium)", price: 12.99, stock: 15, unit: "piece", category: "Seafood" },
      { name: "Ground Crayfish (200g)", price: 7.50, stock: 30, unit: "pack", category: "Seafood" },
      { name: "Fufu Flour (1kg)", price: 4.99, stock: 45, unit: "pack", category: "Grains & Flours" },
      { name: "Palm Kernel Oil (500ml)", price: 8.99, stock: 20, unit: "bottle", category: "Oils & Sauces" }
    ]
  },
  {
    // Birmingham - Caribbean & African Fusion
    storeName: "Tropical Harvest Store",
    email: "tropicalharvest@afrimercato-demo.com",
    phone: "+44 121 551 4455",
    category: "African & Caribbean Groceries",
    description: "Your one-stop shop for African and Caribbean groceries. From Nigerian spices to Jamaican favorites, we stock everything you need to bring authentic flavors to your kitchen.",
    address: {
      street: "234 Soho Road",
      city: "Birmingham",
      postcode: "B21 9LR",
      country: "United Kingdom"
    },
    location: {
      address: "Birmingham B21 9LR",
      postcode: "B21 9LR"
    },
    businessHours: {
      monday: "8:30 AM - 8:30 PM",
      tuesday: "8:30 AM - 8:30 PM",
      wednesday: "8:30 AM - 8:30 PM",
      thursday: "8:30 AM - 8:30 PM",
      friday: "8:30 AM - 9:00 PM",
      saturday: "8:30 AM - 9:00 PM",
      sunday: "10:00 AM - 7:00 PM"
    },
    products: [
      { name: "Jollof Rice Mix (500g)", price: 4.99, stock: 40, unit: "pack", category: "Ready Mixes" },
      { name: "Fresh Ugu Leaves (Pumpkin Leaves)", price: 3.50, stock: 30, unit: "bunch", category: "Fresh Produce" },
      { name: "Ponmo (Cow Skin) - Dried", price: 6.99, stock: 25, unit: "pack", category: "Meat & Protein" },
      { name: "Suya Spice Blend (100g)", price: 4.50, stock: 35, unit: "jar", category: "Spices & Seasonings" },
      { name: "Gari (White - 1kg)", price: 3.99, stock: 50, unit: "pack", category: "Grains & Flours" },
      { name: "Dried Hibiscus (Zobo) 200g", price: 3.99, stock: 30, unit: "pack", category: "Beverages" },
      { name: "Ogbono Seeds (250g)", price: 7.99, stock: 20, unit: "pack", category: "Spices & Seasonings" }
    ]
  },
  {
    // Dublin - Irish-African Community Market
    storeName: "Afro-Irish Provisions",
    email: "afroirish@afrimercato-demo.com",
    phone: "+353 1 873 2200",
    category: "African Groceries",
    description: "Bridging African and Irish communities through food. We offer authentic African ingredients with the warmth of Irish hospitality. Serving Dublin's diverse neighborhoods since 2018.",
    address: {
      street: "45 Capel Street",
      city: "Dublin",
      postcode: "D01 X2E1",
      country: "Ireland"
    },
    location: {
      address: "Dublin D01 X2E1",
      postcode: "D01 X2E1"
    },
    businessHours: {
      monday: "9:00 AM - 8:00 PM",
      tuesday: "9:00 AM - 8:00 PM",
      wednesday: "9:00 AM - 8:00 PM",
      thursday: "9:00 AM - 8:00 PM",
      friday: "9:00 AM - 9:00 PM",
      saturday: "9:00 AM - 9:00 PM",
      sunday: "11:00 AM - 7:00 PM"
    },
    products: [
      { name: "Fresh Garden Eggs (Eggplant)", price: 2.99, stock: 35, unit: "pack", category: "Fresh Produce" },
      { name: "Nigerian Brown Beans (1kg)", price: 4.99, stock: 40, unit: "pack", category: "Grains & Flours" },
      { name: "Locust Beans (Iru) 200g", price: 5.99, stock: 25, unit: "jar", category: "Spices & Seasonings" },
      { name: "Palm Wine (Non-Alcoholic) 1L", price: 6.99, stock: 20, unit: "bottle", category: "Beverages" },
      { name: "African Nutmeg (Ehuru) 50g", price: 4.50, stock: 30, unit: "pack", category: "Spices & Seasonings" },
      { name: "Fresh Spinach (Efo Tete)", price: 2.50, stock: 35, unit: "bunch", category: "Fresh Produce" }
    ]
  }
];

/**
 * @route   POST /api/seed/demo-stores
 * @desc    Seed curated demo stores (production-safe)
 * @access  Private (Admin only - or public for testing)
 */
exports.seedDemoStores = asyncHandler(async (req, res) => {
  const createdStores = [];
  const defaultPassword = process.env.DEMO_STORE_PASSWORD || 'DemoStore2026!';

  for (const storeData of DEMO_STORES) {
    try {
      // Check if store already exists
      let user = await User.findOne({ email: storeData.email });
      
      if (!user) {
        // Create user account for vendor
        user = await User.create({
          name: storeData.storeName,
          firstName: storeData.storeName.split(' ')[0],
          lastName: storeData.storeName.split(' ').slice(1).join(' '),
          email: storeData.email,
          password: defaultPassword,
          phone: storeData.phone,
          roles: ['vendor'],
          primaryRole: 'vendor',
          verified: true,
          emailVerified: true
        });
      }

      // Check if vendor profile exists
      let vendor = await Vendor.findOne({ user: user._id });
      
      if (!vendor) {
        // Generate unique store ID
        const storeId = `DEMO-${storeData.category.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // Geocode the store location for geospatial queries
        let coordinates = null;
        let latitude = null;
        let longitude = null;
        
        try {
          const geocoded = await geocode(`${storeData.location.postcode}, ${storeData.address.city}`);
          if (geocoded) {
            latitude = geocoded.lat;
            longitude = geocoded.lng;
            coordinates = {
              type: 'Point',
              coordinates: [longitude, latitude] // [lng, lat] for GeoJSON
            };
          }
        } catch (error) {
          console.log(`Could not geocode ${storeData.storeName}, skipping coordinates`);
        }

        // Determine currency based on country
        const currency = storeData.address.country === 'Ireland' ? 'EUR' : 'GBP';

        // Update location object with coordinates and city
        const location = {
          ...storeData.location,
          city: storeData.address.city,
          country: storeData.address.country,
          latitude,
          longitude,
          coordinates
        };

        // Create vendor profile
        vendor = await Vendor.create({
          user: user._id,
          storeId,
          storeName: storeData.storeName,
          description: storeData.description,
          category: storeData.category,
          address: storeData.address,
          location,
          currency,
          phone: storeData.phone,
          businessHours: storeData.businessHours,
          approvalStatus: 'approved',
          isVerified: true,
          isPublic: true,
          isActive: true,
          isDemo: true, // Mark as demo store
          isSeeded: true, // Mark as seeded data
          rating: 4.5 + Math.random() * 0.5, // Random rating 4.5-5.0
          approvedAt: new Date(),
          submittedForReviewAt: new Date()
        });
      }

      // Create products for this vendor
      for (const productData of storeData.products) {
        const existingProduct = await Product.findOne({
          vendor: vendor._id,
          name: productData.name
        });

        if (!existingProduct) {
          await Product.create({
            vendor: vendor._id,
            storeName: vendor.storeName,
            name: productData.name,
            description: `High-quality ${productData.name.toLowerCase()} from ${vendor.storeName}`,
            category: productData.category,
            price: productData.price,
            stock: productData.stock,
            unit: productData.unit,
            inStock: true,
            unlimitedStock: false,
            lowStockThreshold: 10,
            images: [] // Will use fallback images from image helper
          });
        }
      }

      createdStores.push({
        storeName: vendor.storeName,
        storeId: vendor.storeId,
        email: storeData.email,
        productsCount: storeData.products.length
      });

    } catch (error) {
      console.error(`Error seeding store ${storeData.storeName}:`, error);
    }
  }

  res.status(201).json({
    success: true,
    message: `Successfully seeded ${createdStores.length} demo stores`,
    data: {
      stores: createdStores,
      credentials: {
        password: defaultPassword,
        note: 'Use store email and this password to login as vendor'
      }
    }
  });
});

/**
 * @route   DELETE /api/seed/demo-stores
 * @desc    Remove all demo stores
 * @access  Private (Admin only)
 */
exports.removeDemoStores = asyncHandler(async (req, res) => {
  const demoVendors = await Vendor.find({ isDemo: true });
  const vendorIds = demoVendors.map(v => v._id);
  const userIds = demoVendors.map(v => v.user);

  // Delete products
  const productsDeleted = await Product.deleteMany({ vendor: { $in: vendorIds } });

  // Delete vendors
  const vendorsDeleted = await Vendor.deleteMany({ isDemo: true });

  // Delete users
  const usersDeleted = await User.deleteMany({ _id: { $in: userIds } });

  res.json({
    success: true,
    message: 'Demo stores removed successfully',
    data: {
      productsDeleted: productsDeleted.deletedCount,
      vendorsDeleted: vendorsDeleted.deletedCount,
      usersDeleted: usersDeleted.deletedCount
    }
  });
});
