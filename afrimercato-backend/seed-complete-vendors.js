const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

// 15 Unique UK-based African/Caribbean stores with realistic details
// Valid categories: 'fresh-produce', 'groceries', 'meat-fish', 'bakery', 'beverages', 'household', 'beauty-health', 'other'
const VENDOR_STORES = [
  {
    storeId: "GVF001",
    name: "Green Valley Farms",
    email: "greenvalley@afrimercato.com",
    phone: "+44-20-7946-0001",
    location: { city: "London", area: "Hackney", postcode: "E8 1DU" },
    category: "fresh-produce",
    description: "Organic vegetables and fruits sourced directly from local farms across the UK",
    specialty: "Organic vegetables, seasonal fruits, herbs"
  },
  {
    storeId: "LKE002",
    name: "Lagos Kitchen Essentials",
    email: "lagoskitchen@afrimercato.com",
    phone: "+44-20-7946-0002",
    location: { city: "London", area: "Peckham", postcode: "SE15 5EB" },
    category: "groceries",
    description: "Authentic Nigerian ingredients and West African specialties",
    specialty: "Palm oil, cassava flour, egusi, ogbono, Nigerian spices"
  },
  {
    storeId: "TFH003",
    name: "Tropical Fruits Hub",
    email: "tropicalfruits@afrimercato.com",
    phone: "+44-20-7946-0003",
    location: { city: "London", area: "Brixton", postcode: "SW9 8EJ" },
    category: "fresh-produce",
    description: "Exotic tropical fruits from Africa, Caribbean and beyond",
    specialty: "Plantains, yams, sweet potatoes, mangoes, papayas"
  },
  {
    storeId: "ASM004",
    name: "African Spice Market",
    email: "africanspice@afrimercato.com",
    phone: "+44-20-7946-0004",
    location: { city: "London", area: "Tottenham", postcode: "N15 4NE" },
    category: "groceries",
    description: "Premium spices and condiments from across Africa",
    specialty: "Berbere, suya spice, harissa, ras el hanout"
  },
  {
    storeId: "MKS005",
    name: "Mama's Kitchen Store",
    email: "mamaskitchen@afrimercato.com",
    phone: "+44-121-496-0005",
    location: { city: "Birmingham", area: "Handsworth", postcode: "B21 9DP" },
    category: "groceries",
    description: "Traditional African and Caribbean groceries for authentic home cooking",
    specialty: "Fufu flour, garri, dried fish, African baskets"
  },
  {
    storeId: "CDM006",
    name: "Caribbean Delights MCR",
    email: "caribbeandelights@afrimercato.com",
    phone: "+44-161-832-0006",
    location: { city: "Manchester", area: "Moss Side", postcode: "M14 4GP" },
    category: "groceries",
    description: "Authentic Caribbean ingredients and ready-to-eat meals",
    specialty: "Scotch bonnet peppers, ackee, saltfish, Caribbean sauces"
  },
  {
    storeId: "NVG007",
    name: "Nile Valley Grocers",
    email: "nilevalley@afrimercato.com",
    phone: "+44-113-243-0007",
    location: { city: "Leeds", area: "Harehills", postcode: "LS8 5HS" },
    category: "groceries",
    description: "Egyptian and North African specialties",
    specialty: "Molokhia, koshari ingredients, tahini, halal meats"
  },
  {
    storeId: "GFM008",
    name: "Ghana Fresh Market",
    email: "ghanafresh@afrimercato.com",
    phone: "+44-151-709-0008",
    location: { city: "Liverpool", area: "Toxteth", postcode: "L8 0RJ" },
    category: "groceries",
    description: "Ghanaian ingredients and West African staples",
    specialty: "Kontomire, garden eggs, shito, banku flour"
  },
  {
    storeId: "SAO009",
    name: "Safari Organics",
    email: "safariorganics@afrimercato.com",
    phone: "+44-117-925-0009",
    location: { city: "Bristol", area: "St Pauls", postcode: "BS2 8QU" },
    category: "fresh-produce",
    description: "Certified organic African vegetables and grains",
    specialty: "Organic okra, amaranth, teff grain, moringa"
  },
  {
    storeId: "ZBB010",
    name: "Zulu Butcher Block",
    email: "zulubutcher@afrimercato.com",
    phone: "+44-114-275-0010",
    location: { city: "Sheffield", area: "Burngreave", postcode: "S3 9DA" },
    category: "meat-fish",
    description: "Premium halal meats and traditional African cuts",
    specialty: "Halal goat, lamb, beef, chicken, traditional sausages"
  },
  {
    storeId: "KSF011",
    name: "Kente Superfoods",
    email: "kentesuperfoods@afrimercato.com",
    phone: "+44-115-947-0011",
    location: { city: "Nottingham", area: "Radford", postcode: "NG7 5FU" },
    category: "beauty-health",
    description: "African superfoods and health products",
    specialty: "Moringa powder, baobab, hibiscus tea, African black soap"
  },
  {
    storeId: "JKD012",
    name: "Jollof Kingdom",
    email: "jollofkingdom@afrimercato.com",
    phone: "+44-116-254-0012",
    location: { city: "Leicester", area: "Highfields", postcode: "LE2 0DN" },
    category: "groceries",
    description: "Premium rice and grains for perfect jollof every time",
    specialty: "Basmati rice, jasmine rice, jollof spice blends"
  },
  {
    storeId: "ECH013",
    name: "Ethiopian Coffee House",
    email: "ethiopiancoffee@afrimercato.com",
    phone: "+44-131-557-0013",
    location: { city: "Edinburgh", area: "Leith", postcode: "EH6 8HB" },
    category: "beverages",
    description: "Authentic Ethiopian coffee beans and traditional brewing equipment",
    specialty: "Ethiopian coffee, jebena pots, berbere spice"
  },
  {
    storeId: "AVE014",
    name: "Afro-Vegan Essentials",
    email: "afrovegan@afrimercato.com",
    phone: "+44-29-2022-0014",
    location: { city: "Cardiff", area: "Butetown", postcode: "CF10 5LR" },
    category: "beauty-health",
    description: "Plant-based African ingredients and vegan alternatives",
    specialty: "Vegan fufu, plant-based egusi, vegan suya"
  },
  {
    storeId: "SSS015",
    name: "Sahara Seafood Supplies",
    email: "saharaseafood@afrimercato.com",
    phone: "+44-141-552-0015",
    location: { city: "Glasgow", area: "Govanhill", postcode: "G42 8JU" },
    category: "meat-fish",
    description: "Fresh and dried African seafood specialties",
    specialty: "Tilapia, dried crayfish, stockfish, smoked catfish"
  }
];

// Product templates for different categories
const PRODUCT_TEMPLATES = {
  'fresh-produce': [
    { name: "Organic Plantains (Green)", price: 2.50, unit: "kg", category: "vegetables" },
    { name: "Fresh Yam", price: 3.99, unit: "kg", category: "vegetables" },
    { name: "Sweet Potato (Red)", price: 2.99, unit: "kg", category: "vegetables" },
    { name: "Fresh Okra", price: 4.50, unit: "kg", category: "vegetables" },
    { name: "Garden Eggs", price: 3.50, unit: "kg", category: "vegetables" },
    { name: "Scotch Bonnet Peppers", price: 6.99, unit: "pack", category: "vegetables" },
    { name: "Fresh Cassava", price: 3.20, unit: "kg", category: "vegetables" },
    { name: "African Basil", price: 2.50, unit: "bunch", category: "herbs" }
  ],
  'groceries': [
    { name: "Palm Oil (Red)", price: 8.99, unit: "1L", category: "oils" },
    { name: "Egusi Seeds (Ground)", price: 6.50, unit: "500g", category: "spices" },
    { name: "Garri (White)", price: 4.99, unit: "1kg", category: "grains" },
    { name: "Fufu Flour", price: 5.50, unit: "1kg", category: "grains" },
    { name: "Ogbono (Ground)", price: 7.99, unit: "500g", category: "spices" },
    { name: "Dried Crayfish", price: 9.99, unit: "250g", category: "seafood" },
    { name: "Stockfish", price: 15.99, unit: "piece", category: "seafood" },
    { name: "Suya Spice Mix", price: 3.99, unit: "100g", category: "spices" }
  ],
  'meat-fish': [
    { name: "Halal Goat Meat", price: 11.99, unit: "kg", category: "meat" },
    { name: "Halal Lamb Chops", price: 13.99, unit: "kg", category: "meat" },
    { name: "Free Range Chicken", price: 7.99, unit: "kg", category: "poultry" },
    { name: "Fresh Tilapia", price: 9.99, unit: "kg", category: "fish" },
    { name: "Smoked Catfish", price: 16.99, unit: "piece", category: "fish" },
    { name: "Beef Suya Cuts", price: 10.99, unit: "kg", category: "meat" }
  ],
  'beauty-health': [
    { name: "Moringa Powder (Organic)", price: 12.99, unit: "250g", category: "superfoods" },
    { name: "Baobab Powder", price: 9.99, unit: "200g", category: "superfoods" },
    { name: "Hibiscus Tea", price: 5.99, unit: "100g", category: "beverages" },
    { name: "African Black Soap", price: 4.99, unit: "piece", category: "personal-care" },
    { name: "Shea Butter (Raw)", price: 8.99, unit: "250g", category: "personal-care" }
  ],
  'beverages': [
    { name: "Ethiopian Coffee Beans", price: 15.99, unit: "500g", category: "coffee" },
    { name: "Rooibos Tea", price: 6.99, unit: "100g", category: "tea" },
    { name: "Zobo Drink Mix", price: 4.50, unit: "pack", category: "drinks" },
    { name: "Palm Wine (Fresh)", price: 7.99, unit: "bottle", category: "drinks" }
  ]
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  console.log('\n🗑️  Clearing existing data...');

  // Get all vendor emails we're about to create
  const vendorEmails = VENDOR_STORES.map(store => store.email);

  // Delete users with these specific emails
  await User.deleteMany({ email: { $in: vendorEmails } });

  // Also clear all vendor-related data
  await Vendor.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  console.log('✅ Data cleared');
};

// Create vendors with products
const seedVendors = async () => {
  console.log('\n🌱 Creating vendors and products...\n');

  const credentials = [];
  const password = 'Password123';

  for (const storeData of VENDOR_STORES) {
    try {
      // Create user account
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: storeData.name,
        email: storeData.email,
        password: hashedPassword,
        role: 'vendor',
        isEmailVerified: true
      });

      // Create vendor profile
      const vendor = await Vendor.create({
        storeId: storeData.storeId,
        user: user._id,
        storeName: storeData.name,
        businessName: storeData.name,
        businessType: 'individual',
        category: storeData.category,
        description: storeData.description,
        phone: storeData.phone,
        address: {
          street: `${Math.floor(Math.random() * 500) + 1} High Street`,
          city: storeData.location.city,
          state: storeData.location.area,
          postalCode: storeData.location.postcode,
          country: 'United Kingdom'
        },
        location: {
          type: 'Point',
          coordinates: [
            -3.5 + Math.random() * 5, // Longitude (UK range)
            51.0 + Math.random() * 4   // Latitude (UK range)
          ]
        },
        isActive: true,
        isVerified: true,
        verificationStatus: 'verified',
        rating: (4.2 + Math.random() * 0.8).toFixed(1),
        totalReviews: Math.floor(Math.random() * 150) + 50
      });

      // Create products for this vendor
      const productTemplates = PRODUCT_TEMPLATES[storeData.category] || PRODUCT_TEMPLATES['groceries'];
      const products = [];

      for (const template of productTemplates) {
        const product = await Product.create({
          vendor: vendor._id,
          name: template.name,
          description: `${storeData.specialty}. ${template.name} sourced from trusted suppliers.`,
          category: template.category,
          price: template.price,
          unit: template.unit,
          stock: Math.floor(Math.random() * 200) + 50,
          lowStockThreshold: 10,
          inStock: true,
          isActive: true,
          images: [{
            url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}`,
            isPrimary: true
          }]
        });
        products.push(product);
      }

      credentials.push({
        storeName: storeData.name,
        email: storeData.email,
        password: password,
        location: `${storeData.location.area}, ${storeData.location.city}`,
        category: storeData.category,
        productsCount: products.length,
        vendorId: vendor._id.toString(),
        userId: user._id.toString()
      });

      console.log(`✅ ${storeData.name} - ${products.length} products created`);
    } catch (error) {
      console.error(`❌ Error creating ${storeData.name}:`, error.message);
    }
  }

  return credentials;
};

// Generate sample orders
const generateOrders = async () => {
  console.log('\n📦 Generating order history...\n');

  const vendors = await Vendor.find();
  const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'delivered'];

  for (const vendor of vendors) {
    const products = await Product.find({ vendor: vendor._id });
    if (products.length === 0) continue;

    // Create 5-15 orders per vendor
    const orderCount = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < orderCount; i++) {
      // Random 1-3 products per order
      const orderProducts = [];
      const numProducts = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numProducts; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        orderProducts.push({
          product: product._id,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: product.price
        });
      }

      const subtotal = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = 2.99;
      const total = subtotal + deliveryFee;

      await Order.create({
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        vendor: vendor._id,
        customer: vendor.user, // Using vendor user as dummy customer
        items: orderProducts,
        subtotal,
        deliveryFee,
        total,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending',
        deliveryAddress: {
          street: `${Math.floor(Math.random() * 500) + 1} Customer Street`,
          city: 'London',
          postalCode: 'E1 6AN',
          country: 'UK'
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      });
    }

    console.log(`✅ ${vendor.storeName} - ${orderCount} orders created`);
  }
};

// Save credentials to file
const saveCredentials = (credentials) => {
  const fs = require('fs');
  const content = `
╔════════════════════════════════════════════════════════════════════════════════╗
║                    AFRIMERCATO VENDOR LOGIN CREDENTIALS                        ║
║                         15 Fully Setup Stores                                  ║
╚════════════════════════════════════════════════════════════════════════════════╝

🔐 DEFAULT PASSWORD FOR ALL VENDORS: Password123

📋 VENDOR ACCOUNTS:
${credentials.map((cred, index) => `
─────────────────────────────────────────────────────────────────────────────────
${index + 1}. ${cred.storeName}
   📧 Email: ${cred.email}
   🔑 Password: ${cred.password}
   📍 Location: ${cred.location}
   🏷️  Category: ${cred.category}
   📦 Products: ${cred.productsCount} items
   🆔 Vendor ID: ${cred.vendorId}
─────────────────────────────────────────────────────────────────────────────────
`).join('\n')}

🌐 LOGIN URL: http://localhost:5180/afrimercato-frontend/#/login
🌐 PRODUCTION: https://afrimercato-backend-production-0329.up.railway.app/api

📊 DASHBOARD FEATURES:
   ✅ View orders and order history
   ✅ Manage products and inventory
   ✅ View sales analytics
   ✅ Generate reports
   ✅ Update store profile
   ✅ View customer reviews

🎯 TO LOGIN:
   1. Go to the login page
   2. Use any email from above
   3. Password: Password123
   4. You'll be redirected to vendor dashboard

Generated: ${new Date().toLocaleString()}
`;

  fs.writeFileSync('VENDOR_CREDENTIALS.txt', content);
  console.log('\n✅ Credentials saved to VENDOR_CREDENTIALS.txt');
};

// Main execution
const main = async () => {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║        AFRIMERCATO - COMPLETE VENDOR DATABASE SETUP            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

    await connectDB();
    await clearData();
    const credentials = await seedVendors();
    await generateOrders();
    saveCredentials(credentials);

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ SETUP COMPLETE!                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ ${credentials.length} vendors created`);
    console.log(`   ✅ Products added to all stores`);
    console.log(`   ✅ Order history generated`);
    console.log(`   ✅ All vendors ready to login`);
    console.log(`\n📄 Check VENDOR_CREDENTIALS.txt for login details`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

main();
