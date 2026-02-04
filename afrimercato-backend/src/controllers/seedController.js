// =================================================================
// SEED CONTROLLER
// =================================================================
// Creates 10 fictional vendor storefronts with products.
// Idempotent: skips records that already exist.
// No real brands, logos, or copyrighted material used.

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');

// ---------------------------------------------------------------------------
// IMAGE URLS — same Unsplash URLs used throughout the app already
// ---------------------------------------------------------------------------
const IMG = {
  grains:   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
  spices:   'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
  plantain: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400',
  yam:      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
  produce:  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
  fish:     'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
  general:  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
  peppers:  'https://images.unsplash.com/photo-1583119022894-0e3e0f695b83?w=400',
  oil:      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
  nuts:     'https://images.unsplash.com/photo-1499378332846-529ce26d9f90?w=400'
};

// ---------------------------------------------------------------------------
// SEED DATA — 10 fictional vendors, ordered by rating descending
// ---------------------------------------------------------------------------
const SEED_VENDORS = [
  {
    email: 'sahel.spice@afrimercato.dev',
    storeName: 'Sahel Spice House',
    storeId: 'SAHELSP01',
    category: 'Spices & Seasonings',
    description: 'Hand-picked West African spices and seasonings for authentic flavour.',
    address: { street: '8 Brick Lane', city: 'London', postcode: 'E1 6RF' },
    location: { address: 'East London', postcode: 'E1 6RF', latitude: 51.5194, longitude: -0.0749 },
    phone: '+44 7911 123401',
    rating: 4.9,
    logo: IMG.spices,
    prepTime: 20,
    products: [
      { name: 'Suya Spice Mix 200g',        category: 'Spices & Seasonings', price: 3.99,  unit: '200g', stock: 70, images: [IMG.spices],  rating: 4.9 },
      { name: 'Dawadawa (Locust Bean) 100g', category: 'Spices & Seasonings', price: 5.49,  unit: '100g', stock: 40, images: [IMG.spices],  rating: 4.7 },
      { name: 'Scotch Bonnet Peppers 250g',  category: 'Fresh Produce',       price: 2.99,  unit: '250g', stock: 60, images: [IMG.peppers], rating: 4.8 },
      { name: 'Ground Crayfish 200g',        category: 'Spices & Seasonings', price: 4.49,  unit: '200g', stock: 45, images: [IMG.spices],  rating: 4.6 },
      { name: 'Dried Turkey Tails 500g',     category: 'Dried Meats',         price: 9.99,  unit: '500g', stock: 30, images: [IMG.fish],    rating: 4.5 }
    ]
  },
  {
    email: 'baobab.organics@afrimercato.dev',
    storeName: 'Baobab Organics',
    storeId: 'BAOBOR02',
    category: 'Organic African Produce',
    description: 'Certified organic African ingredients, sustainably sourced.',
    address: { street: '3 Dalston Junction', city: 'London', postcode: 'E8 3BX' },
    location: { address: 'Dalston, London', postcode: 'E8 3BX', latitude: 51.5451, longitude: -0.0727 },
    phone: '+44 7911 123402',
    rating: 4.9,
    logo: IMG.produce,
    prepTime: 30,
    products: [
      { name: 'Organic Brown Rice 1kg',      category: 'Grains & Rice', price: 6.99, unit: '1kg',  stock: 40, images: [IMG.grains],  rating: 4.9 },
      { name: 'Raw Honey (African) 350g',    category: 'Sweeteners',    price: 9.49, unit: '350g', stock: 25, images: [IMG.general], rating: 4.8 },
      { name: 'Shea Butter (Raw) 200g',      category: 'Cooking Oils',  price: 7.99, unit: '200g', stock: 30, images: [IMG.general], rating: 4.7 },
      { name: 'Organic Moringa Powder 100g', category: 'Superfoods',    price: 8.99, unit: '100g', stock: 35, images: [IMG.produce], rating: 4.6 }
    ]
  },
  {
    email: 'mama.ade@afrimercato.dev',
    storeName: "Mama Ade's Kitchen",
    storeId: 'MAMAADE03',
    category: 'Nigerian Groceries',
    description: 'Authentic Nigerian staples sourced from trusted suppliers across Lagos.',
    address: { street: '14 Brixton Road', city: 'London', postcode: 'SW2 1AA' },
    location: { address: 'Brixton, London', postcode: 'SW2 1AA', latitude: 51.4613, longitude: -0.1055 },
    phone: '+44 7911 123403',
    rating: 4.8,
    logo: IMG.general,
    prepTime: 25,
    products: [
      { name: 'Egusi (Ground) 500g',   category: 'Soups & Seeds',   price: 7.99,  unit: '500g', stock: 40, images: [IMG.spices], rating: 4.8 },
      { name: 'Stockfish (Whole) 300g', category: 'Dried Fish',     price: 11.99, unit: '300g', stock: 25, images: [IMG.fish],   rating: 4.6 },
      { name: 'White Garri 2kg',        category: 'Grains & Flour', price: 4.49,  unit: '2kg',  stock: 60, images: [IMG.grains], rating: 4.9 },
      { name: 'Fresh Yam 2kg',          category: 'Fresh Produce',  price: 8.99,  unit: '2kg',  stock: 30, images: [IMG.yam],    rating: 4.7 },
      { name: 'Palm Oil (Red) 1L',      category: 'Cooking Oils',   price: 6.49,  unit: '1L',   stock: 35, images: [IMG.oil],    rating: 4.5 }
    ]
  },
  {
    email: 'calabash.co@afrimercato.dev',
    storeName: 'Calabash & Co',
    storeId: 'CALABSH04',
    category: 'Nigerian Specialty',
    description: 'Premium Nigerian specialty foods for the discerning palate.',
    address: { street: '18 Lewisham High St', city: 'London', postcode: 'SE13 6EG' },
    location: { address: 'Lewisham, London', postcode: 'SE13 6EG', latitude: 51.4551, longitude: -0.0085 },
    phone: '+44 7911 123404',
    rating: 4.8,
    logo: IMG.general,
    prepTime: 22,
    products: [
      { name: 'Ogbono (Ground) 400g',   category: 'Soups & Seeds',         price: 8.49, unit: '400g', stock: 35, images: [IMG.spices], rating: 4.8 },
      { name: 'Jollof Rice Spice 150g',  category: 'Spices & Seasonings',  price: 4.29, unit: '150g', stock: 55, images: [IMG.spices], rating: 4.9 },
      { name: 'Dried Beans (Brown) 1kg', category: 'Legumes',              price: 3.99, unit: '1kg',  stock: 50, images: [IMG.grains], rating: 4.5 },
      { name: 'Pounded Yam Flour 500g',  category: 'Grains & Flour',       price: 5.49, unit: '500g', stock: 40, images: [IMG.grains], rating: 4.7 },
      { name: 'Smoked Fish 200g',        category: 'Dried Fish',           price: 6.99, unit: '200g', stock: 25, images: [IMG.fish],   rating: 4.6 }
    ]
  },
  {
    email: 'fresh.roots@afrimercato.dev',
    storeName: 'Fresh Roots Produce',
    storeId: 'FRESHRT05',
    category: 'Fresh Produce',
    description: 'Farm-fresh African vegetables and fruits, delivered within 24 hours.',
    address: { street: '31 Borough Market', city: 'London', postcode: 'SE1 9AE' },
    location: { address: 'Borough, London', postcode: 'SE1 9AE', latitude: 51.5045, longitude: -0.0891 },
    phone: '+44 7911 123405',
    rating: 4.7,
    logo: IMG.produce,
    prepTime: 15,
    products: [
      { name: 'Fresh Okra 500g',          category: 'Fresh Produce', price: 3.29, unit: '500g', stock: 50, images: [IMG.produce], rating: 4.7 },
      { name: 'Bitter Leaf (Fresh) 300g', category: 'Fresh Produce', price: 2.49, unit: '300g', stock: 35, images: [IMG.produce], rating: 4.5 },
      { name: 'Sweet Potato 1kg',         category: 'Fresh Produce', price: 2.99, unit: '1kg',  stock: 55, images: [IMG.yam],     rating: 4.8 },
      { name: 'Roma Tomatoes 1kg',        category: 'Fresh Produce', price: 1.99, unit: '1kg',  stock: 65, images: [IMG.produce], rating: 4.6 }
    ]
  },
  {
    email: 'palmtree.kitchen@afrimercato.dev',
    storeName: 'The Palm Tree Kitchen',
    storeId: 'PALMTK06',
    category: 'African Caribbean Fusion',
    description: 'Caribbean and West African fusion ingredients for adventurous cooking.',
    address: { street: '19 Coldharbour Lane', city: 'London', postcode: 'SE5 9NR' },
    location: { address: 'Camberwell, London', postcode: 'SE5 9NR', latitude: 51.4739, longitude: -0.1027 },
    phone: '+44 7911 123406',
    rating: 4.7,
    logo: IMG.general,
    prepTime: 28,
    products: [
      { name: 'Coconut Cream 250ml',           category: 'Cooking Essentials',      price: 2.49, unit: '250ml', stock: 40, images: [IMG.general],  rating: 4.6 },
      { name: 'Plantain Chips 150g',           category: 'Snacks',                  price: 2.99, unit: '150g',  stock: 50, images: [IMG.plantain], rating: 4.8 },
      { name: 'Scotch Bonnet Hot Sauce 300ml', category: 'Sauces & Condiments',     price: 4.49, unit: '300ml', stock: 35, images: [IMG.peppers],  rating: 4.7 },
      { name: 'Dried Chilli Peppers 100g',     category: 'Spices & Seasonings',     price: 3.29, unit: '100g',  stock: 45, images: [IMG.peppers],  rating: 4.5 }
    ]
  },
  {
    email: 'golden.grains@afrimercato.dev',
    storeName: 'Golden Grains Market',
    storeId: 'GOLDGR07',
    category: 'Ghanaian Staples',
    description: 'Premium Ghanaian staples and traditional foods delivered fresh.',
    address: { street: '22 Tottenham Court Road', city: 'London', postcode: 'W1T 3NJ' },
    location: { address: 'Central London', postcode: 'W1T 3NJ', latitude: 51.5145, longitude: -0.1340 },
    phone: '+44 7911 123407',
    rating: 4.6,
    logo: IMG.grains,
    prepTime: 20,
    products: [
      { name: 'Fufu Flour (Cassava) 1kg', category: 'Grains & Flour', price: 5.99, unit: '1kg',  stock: 50, images: [IMG.grains],    rating: 4.7 },
      { name: 'Ripe Plantain (6 pcs)',     category: 'Fresh Produce',  price: 3.49, unit: '6 pcs', stock: 45, images: [IMG.plantain], rating: 4.8 },
      { name: 'Groundnuts (Roasted) 500g', category: 'Nuts & Seeds',   price: 4.99, unit: '500g', stock: 55, images: [IMG.nuts],      rating: 4.6 },
      { name: 'Cassava Flour 1kg',         category: 'Grains & Flour', price: 4.29, unit: '1kg',  stock: 40, images: [IMG.grains],    rating: 4.5 }
    ]
  },
  {
    email: 'abigails.market@afrimercato.dev',
    storeName: "Abigail's Fresh Market",
    storeId: 'ABIGMK08',
    category: 'African Groceries',
    description: 'One-stop shop for all your African grocery needs.',
    address: { street: '7 Norwood Road', city: 'London', postcode: 'SE27 9AW' },
    location: { address: 'West Norwood, London', postcode: 'SE27 9AW', latitude: 51.4295, longitude: -0.1073 },
    phone: '+44 7911 123408',
    rating: 4.6,
    logo: IMG.produce,
    prepTime: 25,
    products: [
      { name: 'Basmati Rice 2kg',      category: 'Grains & Rice',       price: 4.99, unit: '2kg',  stock: 60, images: [IMG.grains],  rating: 4.7 },
      { name: 'Macaroni 500g',         category: 'Pasta & Noodles',     price: 1.79, unit: '500g', stock: 55, images: [IMG.general], rating: 4.4 },
      { name: 'Sunflower Oil 1L',      category: 'Cooking Oils',        price: 3.29, unit: '1L',   stock: 45, images: [IMG.oil],     rating: 4.6 },
      { name: 'Tomato Paste 140g',     category: 'Sauces & Pastes',     price: 0.99, unit: '140g', stock: 75, images: [IMG.produce], rating: 4.5 }
    ]
  },
  {
    email: 'uncle.kwame@afrimercato.dev',
    storeName: "Uncle Kwame's Store",
    storeId: 'UNCKWA09',
    category: 'Ghanaian Traditional',
    description: 'Traditional Ghanaian foods and everyday essentials.',
    address: { street: '5 Peckham High St', city: 'London', postcode: 'SE15 4NA' },
    location: { address: 'Peckham, London', postcode: 'SE15 4NA', latitude: 51.4888, longitude: -0.0924 },
    phone: '+44 7911 123409',
    rating: 4.5,
    logo: IMG.general,
    prepTime: 30,
    products: [
      { name: 'Corn Flour 1kg',              category: 'Grains & Flour', price: 3.49, unit: '1kg',   stock: 50, images: [IMG.grains], rating: 4.5 },
      { name: 'Palm Nut (Canned) 400ml',     category: 'Soups & Sauces', price: 2.79, unit: '400ml', stock: 40, images: [IMG.oil],    rating: 4.6 },
      { name: 'Dried Herrings 250g',         category: 'Dried Fish',     price: 4.99, unit: '250g', stock: 30, images: [IMG.fish],   rating: 4.4 },
      { name: 'Groundnut Oil 500ml',         category: 'Cooking Oils',   price: 5.29, unit: '500ml', stock: 45, images: [IMG.oil],    rating: 4.7 }
    ]
  },
  {
    email: 'titis.pantry@afrimercato.dev',
    storeName: "Titi's Pantry",
    storeId: 'TITPNT10',
    category: 'East African Provisions',
    description: 'East African staples and provisions from Kenya, Uganda, and Tanzania.',
    address: { street: '42 Shepherd Bush Market', city: 'London', postcode: 'W12 7PS' },
    location: { address: 'Shepherd Bush, London', postcode: 'W12 7PS', latitude: 51.5085, longitude: -0.2244 },
    phone: '+44 7911 123410',
    rating: 4.4,
    logo: IMG.general,
    prepTime: 35,
    products: [
      { name: 'Chapati Flour 1kg',          category: 'Grains & Flour',      price: 3.79, unit: '1kg',   stock: 50, images: [IMG.grains],  rating: 4.5 },
      { name: 'Millet (Whole) 500g',        category: 'Grains & Flour',      price: 2.99, unit: '500g', stock: 45, images: [IMG.grains],  rating: 4.3 },
      { name: 'Sorghum 1kg',               category: 'Grains & Flour',      price: 3.49, unit: '1kg',  stock: 40, images: [IMG.grains],  rating: 4.4 },
      { name: 'Coconut Milk (Tin) 400ml',   category: 'Cooking Essentials',  price: 1.49, unit: '400ml', stock: 70, images: [IMG.general], rating: 4.6 }
    ]
  }
];

// ---------------------------------------------------------------------------
// SEED VENDORS + PRODUCTS
// ---------------------------------------------------------------------------
const seedVendors = async (req, res) => {
  try {
    let vendorsCreated = 0;
    let productsCreated = 0;
    const vendorNames = [];

    for (const data of SEED_VENDORS) {
      // 1. User — skip if email already exists
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create({
          email: data.email,
          password: 'seed@afrimercato2024',
          name: data.storeName,
          roles: ['vendor'],
          verified: true,
          emailVerified: true
        });
      }

      // 2. Vendor — skip if user already has one
      let vendor = await Vendor.findOne({ user: user._id });
      if (!vendor) {
        vendor = await Vendor.create({
          user: user._id,
          storeName: data.storeName,
          storeId: data.storeId,
          category: data.category,
          description: data.description,
          address: data.address,
          location: data.location,
          phone: data.phone,
          logo: data.logo,
          rating: data.rating,
          isVerified: true,
          approvalStatus: 'approved',
          isPublic: true,
          isActive: true,
          deliverySettings: {
            estimatedPrepTime: data.prepTime,
            minimumOrderValue: 5,
            acceptingOrders: true
          },
          stats: {
            totalProducts: data.products.length,
            totalOrders: 12 + (SEED_VENDORS.indexOf(data) * 7),
            totalRevenue: 600 + (SEED_VENDORS.indexOf(data) * 340)
          }
        });
        vendorsCreated++;
        vendorNames.push(vendor.storeName);
      }

      // 3. Products — skip each one individually if it already exists for this vendor
      for (const p of data.products) {
        const exists = await Product.findOne({ vendor: vendor._id, name: p.name });
        if (!exists) {
          await Product.create({
            vendor: vendor._id,
            name: p.name,
            category: p.category,
            price: p.price,
            unit: p.unit,
            stock: p.stock,
            images: p.images,
            isActive: true,
            inStock: true,
            rating: p.rating,
            tags: [p.category.toLowerCase().replace(/\s+/g, '-')]
          });
          productsCreated++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Seed complete. ${vendorsCreated} vendors and ${productsCreated} products created.`,
      data: { vendorsCreated, productsCreated, vendorNames }
    });
  } catch (error) {
    console.error('[Seed] Vendor seed failed:', error);
    res.status(500).json({ success: false, message: 'Seed failed: ' + error.message });
  }
};

// ---------------------------------------------------------------------------
// SEED PRODUCTS ONLY (for existing vendors)
// ---------------------------------------------------------------------------
const seedProducts = async (req, res) => {
  try {
    let productsCreated = 0;

    for (const data of SEED_VENDORS) {
      const user = await User.findOne({ email: data.email });
      if (!user) continue;

      const vendor = await Vendor.findOne({ user: user._id });
      if (!vendor) continue;

      for (const p of data.products) {
        const exists = await Product.findOne({ vendor: vendor._id, name: p.name });
        if (!exists) {
          await Product.create({
            vendor: vendor._id,
            name: p.name,
            category: p.category,
            price: p.price,
            unit: p.unit,
            stock: p.stock,
            images: p.images,
            isActive: true,
            inStock: true,
            rating: p.rating,
            tags: [p.category.toLowerCase().replace(/\s+/g, '-')]
          });
          productsCreated++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `${productsCreated} products created.`,
      data: { productsCreated }
    });
  } catch (error) {
    console.error('[Seed] Product seed failed:', error);
    res.status(500).json({ success: false, message: 'Seed failed: ' + error.message });
  }
};

// ---------------------------------------------------------------------------
// CLEAR SEED DATA
// ---------------------------------------------------------------------------
const clearVendors = async (req, res) => {
  try {
    const emails = SEED_VENDORS.map(v => v.email);
    const users = await User.find({ email: { $in: emails } });
    const userIds = users.map(u => u._id);

    const products = await Product.deleteMany({ vendor: { $in: userIds } });
    const vendors = await Vendor.deleteMany({ user: { $in: userIds } });
    const deletedUsers = await User.deleteMany({ _id: { $in: userIds } });

    res.status(200).json({
      success: true,
      message: 'Seed data cleared.',
      data: { users: deletedUsers.deletedCount, vendors: vendors.deletedCount, products: products.deletedCount }
    });
  } catch (error) {
    console.error('[Seed] Clear vendors failed:', error);
    res.status(500).json({ success: false, message: 'Clear failed: ' + error.message });
  }
};

const clearProducts = async (req, res) => {
  try {
    const emails = SEED_VENDORS.map(v => v.email);
    const users = await User.find({ email: { $in: emails } });
    const userIds = users.map(u => u._id);

    const vendors = await Vendor.find({ user: { $in: userIds } });
    const vendorIds = vendors.map(v => v._id);

    const result = await Product.deleteMany({ vendor: { $in: vendorIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} seed products cleared.`,
      data: { productsDeleted: result.deletedCount }
    });
  } catch (error) {
    console.error('[Seed] Clear products failed:', error);
    res.status(500).json({ success: false, message: 'Clear failed: ' + error.message });
  }
};

// ---------------------------------------------------------------------------
// SEED STATUS
// ---------------------------------------------------------------------------
const getSeedStatus = async (req, res) => {
  try {
    const emails = SEED_VENDORS.map(v => v.email);
    const users = await User.find({ email: { $in: emails } });
    const userIds = users.map(u => u._id);

    const vendors = await Vendor.find({ user: { $in: userIds } })
      .select('storeName category rating isPublic isVerified approvalStatus');
    const vendorIds = vendors.map(v => v._id);
    const productCount = await Product.countDocuments({ vendor: { $in: vendorIds } });

    res.status(200).json({
      success: true,
      data: {
        users: users.length,
        vendors: vendors.length,
        products: productCount,
        expectedVendors: SEED_VENDORS.length,
        expectedProducts: SEED_VENDORS.reduce((sum, v) => sum + v.products.length, 0),
        stores: vendors.map(v => ({
          name: v.storeName,
          category: v.category,
          rating: v.rating,
          public: v.isPublic,
          verified: v.isVerified,
          approved: v.approvalStatus === 'approved'
        }))
      }
    });
  } catch (error) {
    console.error('[Seed] Status check failed:', error);
    res.status(500).json({ success: false, message: 'Status check failed: ' + error.message });
  }
};

module.exports = {
  seedVendors,
  seedProducts,
  clearVendors,
  clearProducts,
  getSeedStatus
};
