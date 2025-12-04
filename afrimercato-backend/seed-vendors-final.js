const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const Product = require('./src/models/Product');

// VALID VALUES FROM MODELS:
// Vendor categories: 'fresh-produce', 'groceries', 'meat-fish', 'bakery', 'beverages', 'household', 'beauty-health', 'other'
// Product categories: 'fruits', 'vegetables', 'grains', 'dairy', 'meat', 'fish', 'poultry', 'bakery', 'beverages', 'spices', 'snacks', 'household', 'beauty', 'other'
// Product units: 'kg', 'g', 'lb', 'piece', 'bunch', 'pack', 'liter', 'ml', 'dozen'

const VENDORS = [
  {
    storeId: "GVF001",
    name: "Green Valley Farms",
    email: "greenvalley@afrimercato.com",
    category: "fresh-produce",
    city: "London",
    area: "Hackney",
    postcode: "E8 1DU",
    description: "Organic vegetables and fruits sourced directly from local farms across the UK",
    products: [
      { name: "Organic Plantains (Green)", price: 2.50, unit: "kg", category: "fruits" },
      { name: "Fresh Yam", price: 3.99, unit: "kg", category: "vegetables" },
      { name: "Sweet Potato (Red)", price: 2.99, unit: "kg", category: "vegetables" },
      { name: "Fresh Okra", price: 4.50, unit: "kg", category: "vegetables" },
      { name: "Garden Eggs (Eggplant)", price: 3.50, unit: "kg", category: "vegetables" },
      { name: "Scotch Bonnet Peppers", price: 6.99, unit: "pack", category: "vegetables" },
      { name: "Fresh Cassava Root", price: 3.20, unit: "kg", category: "vegetables" },
      { name: "African Basil Bunch", price: 2.50, unit: "bunch", category: "vegetables" }
    ]
  },
  {
    storeId: "LKE002",
    name: "Lagos Kitchen Essentials",
    email: "lagoskitchen@afrimercato.com",
    category: "groceries",
    city: "London",
    area: "Peckham",
    postcode: "SE15 5EB",
    description: "Authentic Nigerian ingredients and West African specialties",
    products: [
      { name: "Red Palm Oil", price: 8.99, unit: "liter", category: "other" },
      { name: "Ground Egusi Seeds", price: 6.50, unit: "pack", category: "spices" },
      { name: "White Garri", price: 4.99, unit: "kg", category: "grains" },
      { name: "Fufu Flour", price: 5.50, unit: "kg", category: "grains" },
      { name: "Ground Ogbono", price: 7.99, unit: "pack", category: "spices" },
      { name: "Dried Crayfish", price: 9.99, unit: "pack", category: "fish" },
      { name: "Premium Stockfish", price: 15.99, unit: "piece", category: "fish" },
      { name: "Suya Spice Blend", price: 3.99, unit: "pack", category: "spices" }
    ]
  },
  {
    storeId: "TFH003",
    name: "Tropical Fruits Hub",
    email: "tropicalfruits@afrimercato.com",
    category: "fresh-produce",
    city: "London",
    area: "Brixton",
    postcode: "SW9 8EJ",
    description: "Exotic tropical fruits from Africa, Caribbean and beyond",
    products: [
      { name: "Ripe Plantains (Yellow)", price: 2.75, unit: "kg", category: "fruits" },
      { name: "Fresh Mangoes", price: 5.99, unit: "kg", category: "fruits" },
      { name: "Papaya", price: 4.50, unit: "kg", category: "fruits" },
      { name: "Pineapple", price: 3.99, unit: "piece", category: "fruits" },
      { name: "Coconut (Whole)", price: 2.50, unit: "piece", category: "fruits" },
      { name: "Passion Fruit", price: 6.99, unit: "pack", category: "fruits" }
    ]
  },
  {
    storeId: "ASM004",
    name: "African Spice Market",
    email: "africanspice@afrimercato.com",
    category: "groceries",
    city: "London",
    area: "Tottenham",
    postcode: "N15 4NE",
    description: "Premium spices and condiments from across Africa",
    products: [
      { name: "Berbere Spice Blend", price: 5.99, unit: "pack", category: "spices" },
      { name: "Ras el Hanout", price: 6.50, unit: "pack", category: "spices" },
      { name: "Harissa Paste", price: 4.99, unit: "pack", category: "spices" },
      { name: "African Curry Powder", price: 3.50, unit: "pack", category: "spices" },
      { name: "Peri Peri Seasoning", price: 4.50, unit: "pack", category: "spices" },
      { name: "Cameroon Pepper", price: 7.99, unit: "pack", category: "spices" }
    ]
  },
  {
    storeId: "MKS005",
    name: "Mama's Kitchen Store",
    email: "mamaskitchen@afrimercato.com",
    category: "groceries",
    city: "Birmingham",
    area: "Handsworth",
    postcode: "B21 9DP",
    description: "Traditional African and Caribbean groceries for authentic home cooking",
    products: [
      { name: "Yellow Garri", price: 4.99, unit: "kg", category: "grains" },
      { name: "Pounded Yam Flour", price: 6.50, unit: "kg", category: "grains" },
      { name: "Eba (Cassava Flour)", price: 5.25, unit: "kg", category: "grains" },
      { name: "Smoked Fish", price: 12.99, unit: "pack", category: "fish" },
      { name: "African Nutmeg", price: 3.99, unit: "pack", category: "spices" },
      { name: "Dried Bitter Leaf", price: 4.50, unit: "pack", category: "vegetables" }
    ]
  },
  {
    storeId: "CDM006",
    name: "Caribbean Delights MCR",
    email: "caribbeandelights@afrimercato.com",
    category: "groceries",
    city: "Manchester",
    area: "Moss Side",
    postcode: "M14 4GP",
    description: "Authentic Caribbean ingredients and ready-to-eat meals",
    products: [
      { name: "Ackee (Canned)", price: 5.99, unit: "pack", category: "other" },
      { name: "Saltfish", price: 12.99, unit: "pack", category: "fish" },
      { name: "Scotch Bonnet Sauce", price: 4.50, unit: "pack", category: "spices" },
      { name: "Jerk Seasoning", price: 3.99, unit: "pack", category: "spices" },
      { name: "Coconut Milk", price: 2.50, unit: "pack", category: "other" },
      { name: "Callaloo (Canned)", price: 3.99, unit: "pack", category: "vegetables" }
    ]
  },
  {
    storeId: "NVG007",
    name: "Nile Valley Grocers",
    email: "nilevalley@afrimercato.com",
    category: "groceries",
    city: "Leeds",
    area: "Harehills",
    postcode: "LS8 5HS",
    description: "Egyptian and North African specialties",
    products: [
      { name: "Molokhia (Dried)", price: 4.99, unit: "pack", category: "vegetables" },
      { name: "Koshari Rice Mix", price: 3.99, unit: "kg", category: "grains" },
      { name: "Tahini Paste", price: 5.50, unit: "pack", category: "other" },
      { name: "Halal Lamb Mince", price: 8.99, unit: "kg", category: "meat" },
      { name: "Dukkah Spice Mix", price: 4.50, unit: "pack", category: "spices" }
    ]
  },
  {
    storeId: "GFM008",
    name: "Ghana Fresh Market",
    email: "ghanafresh@afrimercato.com",
    category: "groceries",
    city: "Liverpool",
    area: "Toxteth",
    postcode: "L8 0RJ",
    description: "Ghanaian ingredients and West African staples",
    products: [
      { name: "Kontomire (Garden Eggs Leaves)", price: 3.50, unit: "bunch", category: "vegetables" },
      { name: "African Garden Eggs", price: 4.99, unit: "kg", category: "vegetables" },
      { name: "Shito (Black Pepper Sauce)", price: 6.50, unit: "pack", category: "spices" },
      { name: "Banku Flour", price: 5.99, unit: "kg", category: "grains" },
      { name: "Kenkey (Fermented Corn)", price: 4.50, unit: "pack", category: "grains" }
    ]
  },
  {
    storeId: "SAO009",
    name: "Safari Organics",
    email: "safariorganics@afrimercato.com",
    category: "fresh-produce",
    city: "Bristol",
    area: "St Pauls",
    postcode: "BS2 8QU",
    description: "Certified organic African vegetables and grains",
    products: [
      { name: "Organic Okra", price: 5.50, unit: "kg", category: "vegetables" },
      { name: "Organic Amaranth Leaves", price: 4.99, unit: "bunch", category: "vegetables" },
      { name: "Teff Grain (Organic)", price: 9.99, unit: "kg", category: "grains" },
      { name: "Moringa Leaves (Fresh)", price: 6.50, unit: "bunch", category: "vegetables" },
      { name: "Organic Sweet Potato", price: 3.50, unit: "kg", category: "vegetables" }
    ]
  },
  {
    storeId: "ZBB010",
    name: "Zulu Butcher Block",
    email: "zulubutcher@afrimercato.com",
    category: "meat-fish",
    city: "Sheffield",
    area: "Burngreave",
    postcode: "S3 9DA",
    description: "Premium halal meats and traditional African cuts",
    products: [
      { name: "Halal Goat Meat", price: 11.99, unit: "kg", category: "meat" },
      { name: "Halal Lamb Chops", price: 13.99, unit: "kg", category: "meat" },
      { name: "Free Range Chicken", price: 7.99, unit: "kg", category: "poultry" },
      { name: "Beef Suya Cuts", price: 10.99, unit: "kg", category: "meat" },
      { name: "Oxtail", price: 12.50, unit: "kg", category: "meat" },
      { name: "Chicken Wings", price: 6.99, unit: "kg", category: "poultry" }
    ]
  },
  {
    storeId: "KSF011",
    name: "Kente Superfoods",
    email: "kentesuperfoods@afrimercato.com",
    category: "beauty-health",
    city: "Nottingham",
    area: "Radford",
    postcode: "NG7 5FU",
    description: "African superfoods and health products",
    products: [
      { name: "Moringa Powder (Organic)", price: 12.99, unit: "pack", category: "beauty" },
      { name: "Baobab Powder", price: 9.99, unit: "pack", category: "beauty" },
      { name: "Hibiscus Tea", price: 5.99, unit: "pack", category: "beverages" },
      { name: "African Black Soap", price: 4.99, unit: "piece", category: "beauty" },
      { name: "Shea Butter (Raw)", price: 8.99, unit: "pack", category: "beauty" }
    ]
  },
  {
    storeId: "JKD012",
    name: "Jollof Kingdom",
    email: "jollofkingdom@afrimercato.com",
    category: "groceries",
    city: "Leicester",
    area: "Highfields",
    postcode: "LE2 0DN",
    description: "Premium rice and grains for perfect jollof every time",
    products: [
      { name: "Basmati Rice", price: 7.99, unit: "kg", category: "grains" },
      { name: "Jasmine Rice", price: 8.50, unit: "kg", category: "grains" },
      { name: "Jollof Spice Mix", price: 4.99, unit: "pack", category: "spices" },
      { name: "Long Grain Rice", price: 6.99, unit: "kg", category: "grains" },
      { name: "Brown Rice", price: 9.50, unit: "kg", category: "grains" }
    ]
  },
  {
    storeId: "ECH013",
    name: "Ethiopian Coffee House",
    email: "ethiopiancoffee@afrimercato.com",
    category: "beverages",
    city: "Edinburgh",
    area: "Leith",
    postcode: "EH6 8HB",
    description: "Authentic Ethiopian coffee beans and traditional brewing equipment",
    products: [
      { name: "Ethiopian Coffee Beans", price: 15.99, unit: "pack", category: "beverages" },
      { name: "Rooibos Tea", price: 6.99, unit: "pack", category: "beverages" },
      { name: "Zobo Drink Mix", price: 4.50, unit: "pack", category: "beverages" },
      { name: "Kola Nut", price: 5.99, unit: "pack", category: "beverages" },
      { name: "Palm Wine (Fresh)", price: 7.99, unit: "liter", category: "beverages" }
    ]
  },
  {
    storeId: "AVE014",
    name: "Afro-Vegan Essentials",
    email: "afrovegan@afrimercato.com",
    category: "beauty-health",
    city: "Cardiff",
    area: "Butetown",
    postcode: "CF10 5LR",
    description: "Plant-based African ingredients and vegan alternatives",
    products: [
      { name: "Vegan Fufu Mix", price: 6.99, unit: "pack", category: "grains" },
      { name: "Plant-Based Egusi", price: 8.50, unit: "pack", category: "other" },
      { name: "Vegan Suya Spice", price: 4.50, unit: "pack", category: "spices" },
      { name: "Chickpea Flour", price: 5.99, unit: "kg", category: "grains" },
      { name: "Nutritional Yeast", price: 7.99, unit: "pack", category: "other" }
    ]
  },
  {
    storeId: "SSS015",
    name: "Sahara Seafood Supplies",
    email: "saharaseafood@afrimercato.com",
    category: "meat-fish",
    city: "Glasgow",
    area: "Govanhill",
    postcode: "G42 8JU",
    description: "Fresh and dried African seafood specialties",
    products: [
      { name: "Fresh Tilapia", price: 9.99, unit: "kg", category: "fish" },
      { name: "Dried Crayfish Premium", price: 12.99, unit: "pack", category: "fish" },
      { name: "Smoked Catfish", price: 16.99, unit: "piece", category: "fish" },
      { name: "King Fish Steaks", price: 14.99, unit: "kg", category: "fish" },
      { name: "Shrimp (Prawns)", price: 18.99, unit: "kg", category: "fish" }
    ]
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    process.exit(1);
  }
};

const clearData = async () => {
  console.log('\n🗑️  Clearing existing vendor data...');
  const vendorEmails = VENDORS.map(v => v.email);
  await User.deleteMany({ email: { $in: vendorEmails } });
  await Vendor.deleteMany({});
  await Product.deleteMany({});
  console.log('✅ Data cleared');
};

const seedDatabase = async () => {
  const password = 'Password123';
  const credentials = [];

  console.log('\n🌱 Creating 15 vendor stores...\n');

  for (const vendorData of VENDORS) {
    try {
      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: vendorData.name,
        email: vendorData.email,
        password: hashedPassword,
        role: 'vendor',
        isEmailVerified: true
      });

      // Create vendor profile
      const vendor = await Vendor.create({
        storeId: vendorData.storeId,
        user: user._id,
        storeName: vendorData.name,
        businessName: vendorData.name,
        businessType: 'individual',
        category: vendorData.category,
        description: vendorData.description,
        phone: `+44-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: {
          street: `${Math.floor(Math.random() * 500) + 1} High Street`,
          city: vendorData.city,
          state: vendorData.area,
          postalCode: vendorData.postcode,
          country: 'United Kingdom'
        },
        location: {
          type: 'Point',
          coordinates: [-3.5 + Math.random() * 5, 51.0 + Math.random() * 4]
        },
        isActive: true,
        isVerified: true,
        verificationStatus: 'verified',
        rating: (4.2 + Math.random() * 0.8).toFixed(1),
        totalReviews: Math.floor(Math.random() * 150) + 50
      });

      // Create products
      let productCount = 0;
      for (const prod of vendorData.products) {
        await Product.create({
          vendor: vendor._id,
          name: prod.name,
          description: `High quality ${prod.name}. ${vendorData.description}`,
          category: prod.category,
          price: prod.price,
          unit: prod.unit,
          stock: Math.floor(Math.random() * 200) + 50,
          lowStockThreshold: 10,
          inStock: true,
          isActive: true,
          images: [{
            url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}`,
            isPrimary: true
          }]
        });
        productCount++;
      }

      credentials.push({
        storeName: vendorData.name,
        email: vendorData.email,
        password: password,
        location: `${vendorData.area}, ${vendorData.city}`,
        category: vendorData.category,
        productsCount: productCount
      });

      console.log(`✅ ${vendorData.name} - ${productCount} products created`);
    } catch (error) {
      console.error(`❌ ${vendorData.name}: ${error.message}`);
    }
  }

  return credentials;
};

const saveCredentials = (credentials) => {
  const fs = require('fs');
  const content = `
╔════════════════════════════════════════════════════════════════════════════════╗
║                    AFRIMERCATO VENDOR LOGIN CREDENTIALS                        ║
║                         15 Fully Populated Stores                              ║
╚════════════════════════════════════════════════════════════════════════════════╝

🔐 PASSWORD FOR ALL VENDORS: Password123

📋 VENDOR ACCOUNTS:
${credentials.map((cred, index) => `
─────────────────────────────────────────────────────────────────────────────────
${index + 1}. ${cred.storeName}
   📧 Email: ${cred.email}
   🔑 Password: ${cred.password}
   📍 Location: ${cred.location}
   🏷️  Category: ${cred.category}
   📦 Products: ${cred.productsCount} items
─────────────────────────────────────────────────────────────────────────────────
`).join('\n')}

🌐 LOCAL LOGIN: http://localhost:5180/afrimercato-frontend/#/login
🌐 PRODUCTION: https://afrimercato-backend-production-0329.up.railway.app

📊 VENDOR DASHBOARD FEATURES:
   ✅ View all orders and order history
   ✅ Manage products and inventory
   ✅ View sales analytics and reports
   ✅ Update store profile and settings
   ✅ Track revenue and performance

Generated: ${new Date().toLocaleString()}
`;

  fs.writeFileSync('VENDOR_CREDENTIALS.txt', content);
  console.log('\n✅ Credentials saved to VENDOR_CREDENTIALS.txt\n');
};

const main = async () => {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║             AFRIMERCATO - 15 VENDOR STORES SETUP               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

    await connectDB();
    await clearData();
    const credentials = await seedDatabase();
    saveCredentials(credentials);

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ SETUP COMPLETE!                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ ${credentials.length} vendors created`);
    console.log(`   ✅ ${credentials.reduce((sum, c) => sum + c.productsCount, 0)} products added`);
    console.log(`   ✅ All vendors can login immediately`);
    console.log(`\n📄 Check VENDOR_CREDENTIALS.txt for complete login details\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

main();
