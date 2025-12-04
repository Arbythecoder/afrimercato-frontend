// Seed UK vendors with locations for AfriHub
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const Product = require('./src/models/Product');

const ukVendors = [
  // LONDON (5 vendors)
  {
    name: 'Green Valley Farms London',
    email: 'greenvalley@afrihub.uk',
    location: 'London',
    address: { street: '123 High Street', city: 'London', state: 'Greater London', postcode: 'E1 6AN', country: 'United Kingdom' },
    businessName: 'Green Valley Farms',
    category: 'fresh-produce',
    description: 'Fresh organic vegetables and fruits delivered daily',
    products: [
      { name: 'Fresh Tomatoes', price: 2.99, category: 'vegetables', unit: 'kg', stock: 100 },
      { name: 'Organic Bananas', price: 1.49, category: 'fruits', unit: 'bunch', stock: 80 }
    ]
  },
  {
    name: 'African Spice Market',
    email: 'spicemarket@afrihub.uk',
    location: 'London',
    address: { street: '45 Peckham High St', city: 'London', state: 'Greater London', postcode: 'SE15 5EB', country: 'United Kingdom' },
    businessName: 'African Spice Market',
    category: 'spices-seasonings',
    description: 'Authentic African spices, grains, and cooking essentials',
    products: [
      { name: 'Nigerian Pepper Mix', price: 4.99, category: 'spices', unit: 'pack', stock: 50 },
      { name: 'Palm Oil (1L)', price: 8.99, category: 'oils', unit: 'bottle', stock: 30 }
    ]
  },
  {
    name: 'Lagos Kitchen Store',
    email: 'lagos@afrihub.uk',
    location: 'London',
    address: { street: '78 Brixton Road', city: 'London', state: 'Greater London', postcode: 'SW9 6BE', country: 'United Kingdom' },
    businessName: 'Lagos Kitchen Store',
    category: 'packaged-goods',
    description: 'Nigerian foods, cassava, plantain, and African groceries',
    products: [
      { name: 'Plantains (Ripe)', price: 3.49, category: 'fruits', unit: 'bunch', stock: 60 },
      { name: 'Cassava Flour', price: 5.99, category: 'grains', unit: 'kg', stock: 40 }
    ]
  },
  {
    name: 'Tropical Fruits Hub',
    email: 'tropical@afrihub.uk',
    location: 'London',
    address: { street: '12 Ridley Road Market', city: 'London', state: 'Greater London', postcode: 'E8 2NP', country: 'United Kingdom' },
    businessName: 'Tropical Fruits Hub',
    category: 'fresh-produce',
    description: 'Exotic tropical fruits: mango, papaya, yam, plantain',
    products: [
      { name: 'Fresh Mangoes', price: 4.99, category: 'fruits', unit: 'kg', stock: 70 },
      { name: 'Yam (White)', price: 6.99, category: 'vegetables', unit: 'kg', stock: 50 }
    ]
  },
  {
    name: 'Hackney Fresh Foods',
    email: 'hackney@afrihub.uk',
    location: 'London',
    address: { street: 'Hackney Market', city: 'London', state: 'Greater London', postcode: 'E8 5RT', country: 'United Kingdom' },
    businessName: 'Hackney Fresh Foods',
    category: 'fresh-produce',
    description: 'Daily fresh vegetables, fruits, and salads',
    products: [
      { name: 'Mixed Salad Box', price: 3.99, category: 'vegetables', unit: 'box', stock: 90 },
      { name: 'Fresh Spinach', price: 2.29, category: 'vegetables', unit: 'bunch', stock: 100 }
    ]
  },

  // MANCHESTER (3 vendors)
  {
    name: 'Manchester African Market',
    email: 'mcrafricanmarket@afrihub.uk',
    location: 'Manchester',
    address: { street: '34 Cheetham Hill Road', city: 'Manchester', state: 'Greater Manchester', postcode: 'M8 8EW', country: 'United Kingdom' },
    businessName: 'Manchester African Market',
    category: 'spices-seasonings',
    description: 'African groceries, spices, and grains',
    products: [
      { name: 'Jollof Rice Mix', price: 6.99, category: 'grains', unit: 'pack', stock: 45 },
      { name: 'Egusi Seeds', price: 7.99, category: 'spices', unit: 'pack', stock: 35 }
    ]
  },
  {
    name: 'Moss Side Grocers',
    email: 'mossside@afrihub.uk',
    location: 'Manchester',
    address: { street: '56 Great Western Street', city: 'Manchester', state: 'Greater Manchester', postcode: 'M14 4AG', country: 'United Kingdom' },
    businessName: 'Moss Side Grocers',
    category: 'fresh-produce',
    description: 'Fresh vegetables and fruits for Manchester',
    products: [
      { name: 'Red Onions', price: 1.99, category: 'vegetables', unit: 'kg', stock: 80 },
      { name: 'Bell Peppers', price: 3.49, category: 'vegetables', unit: 'kg', stock: 60 }
    ]
  },
  {
    name: 'Afro-Caribbean Store MCR',
    email: 'afrocaribmcr@afrihub.uk',
    location: 'Manchester',
    address: { street: '89 Princess Road', city: 'Manchester', state: 'Greater Manchester', postcode: 'M14 4RB', country: 'United Kingdom' },
    businessName: 'Afro-Caribbean Store MCR',
    category: 'packaged-goods',
    description: 'Caribbean and African food specialties',
    products: [
      { name: 'Basmati Rice (5kg)', price: 12.99, category: 'grains', unit: 'pack', stock: 50 },
      { name: 'Black Beans', price: 4.99, category: 'grains', unit: 'kg', stock: 40 }
    ]
  },

  // BIRMINGHAM (2 vendors)
  {
    name: 'Handsworth African Foods',
    email: 'handsworth@afrihub.uk',
    location: 'Birmingham',
    address: { street: '23 Soho Road', city: 'Birmingham', state: 'West Midlands', postcode: 'B21 9ST', country: 'United Kingdom' },
    businessName: 'Handsworth African Foods',
    category: 'meat-fish',
    description: 'Fresh halal meat, fish, and African groceries',
    products: [
      { name: 'Halal Chicken', price: 8.99, category: 'meat', unit: 'kg', stock: 30 },
      { name: 'Fresh Tilapia', price: 9.99, category: 'fish', unit: 'kg', stock: 25 }
    ]
  },
  {
    name: 'Birmingham Tropical Market',
    email: 'bhamtropical@afrihub.uk',
    location: 'Birmingham',
    address: { street: '45 Stratford Road', city: 'Birmingham', state: 'West Midlands', postcode: 'B11 1AR', country: 'United Kingdom' },
    businessName: 'Birmingham Tropical Market',
    category: 'fresh-produce',
    description: 'Tropical fruits and vegetables',
    products: [
      { name: 'Sweet Potatoes', price: 2.79, category: 'vegetables', unit: 'kg', stock: 70 },
      { name: 'Pineapples', price: 2.99, category: 'fruits', unit: 'each', stock: 40 }
    ]
  },

  // BRISTOL (2 vendors)
  {
    name: 'Bristol African Store',
    email: 'bristolafrican@afrihub.uk',
    location: 'Bristol',
    address: { street: '12 Stapleton Road', city: 'Bristol', state: 'Bristol', postcode: 'BS5 0QW', country: 'United Kingdom' },
    businessName: 'Bristol African Store',
    category: 'packaged-goods',
    description: 'African and Caribbean groceries',
    products: [
      { name: 'Fufu Flour', price: 5.99, category: 'grains', unit: 'kg', stock: 45 },
      { name: 'Coconut Milk', price: 2.49, category: 'dairy', unit: 'can', stock: 60 }
    ]
  },
  {
    name: 'St Pauls Fresh Market',
    email: 'stpauls@afrihub.uk',
    location: 'Bristol',
    address: { street: '34 Grosvenor Road', city: 'Bristol', state: 'Bristol', postcode: 'BS2 8XQ', country: 'United Kingdom' },
    businessName: 'St Pauls Fresh Market',
    category: 'fresh-produce',
    description: 'Fresh daily vegetables and fruits',
    products: [
      { name: 'Carrots', price: 1.89, category: 'vegetables', unit: 'kg', stock: 90 },
      { name: 'Oranges', price: 3.99, category: 'fruits', unit: 'kg', stock: 70 }
    ]
  },

  // LEEDS (2 vendors)
  {
    name: 'Leeds African Groceries',
    email: 'leedsafrican@afrihub.uk',
    location: 'Leeds',
    address: { street: '67 Harehills Lane', city: 'Leeds', state: 'West Yorkshire', postcode: 'LS8 3QB', country: 'United Kingdom' },
    businessName: 'Leeds African Groceries',
    category: 'spices-seasonings',
    description: 'African spices, grains, and cooking essentials',
    products: [
      { name: 'Curry Powder', price: 3.99, category: 'spices', unit: 'pack', stock: 55 },
      { name: 'Ground Nutmeg', price: 4.49, category: 'spices', unit: 'pack', stock: 40 }
    ]
  },
  {
    name: 'Chapeltown Fresh Foods',
    email: 'chapeltown@afrihub.uk',
    location: 'Leeds',
    address: { street: '89 Chapeltown Road', city: 'Leeds', state: 'West Yorkshire', postcode: 'LS7 3HY', country: 'United Kingdom' },
    businessName: 'Chapeltown Fresh Foods',
    category: 'fresh-produce',
    description: 'Fresh vegetables and fruits',
    products: [
      { name: 'Green Beans', price: 3.29, category: 'vegetables', unit: 'kg', stock: 65 },
      { name: 'Avocados', price: 4.49, category: 'fruits', unit: 'kg', stock: 50 }
    ]
  },

  // LIVERPOOL (2 vendors)
  {
    name: 'Liverpool African Market',
    email: 'liverpolafrican@afrihub.uk',
    location: 'Liverpool',
    address: { street: '45 Granby Street', city: 'Liverpool', state: 'Merseyside', postcode: 'L8 2RN', country: 'United Kingdom' },
    businessName: 'Liverpool African Market',
    category: 'meat-fish',
    description: 'Fresh halal meat and Caribbean specialties',
    products: [
      { name: 'Goat Meat', price: 10.99, category: 'meat', unit: 'kg', stock: 20 },
      { name: 'Dried Fish', price: 12.99, category: 'fish', unit: 'pack', stock: 15 }
    ]
  },
  {
    name: 'Toxteth Tropical Foods',
    email: 'toxteth@afrihub.uk',
    location: 'Liverpool',
    address: { street: '23 Upper Parliament Street', city: 'Liverpool', state: 'Merseyside', postcode: 'L8 7LA', country: 'United Kingdom' },
    businessName: 'Toxteth Tropical Foods',
    category: 'fresh-produce',
    description: 'Tropical fruits and vegetables',
    products: [
      { name: 'Okra', price: 2.99, category: 'vegetables', unit: 'kg', stock: 55 },
      { name: 'Papayas', price: 3.49, category: 'fruits', unit: 'each', stock: 35 }
    ]
  }
];

const seedVendors = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing vendors...');
    await User.deleteMany({ role: 'vendor' });
    await Vendor.deleteMany({});
    await Product.deleteMany({});

    console.log('📦 Creating UK vendors...');

    for (const vendorData of ukVendors) {
      // Create user
      const user = await User.create({
        name: vendorData.name,
        email: vendorData.email,
        password: 'Password123', // Default password
        role: 'vendor',
        isVerified: true // Auto-verify for seed data
      });

      // Get coordinates for location
      const coordinates = getCoordinates(vendorData.location);

      // Generate unique store ID
      const storeId = `STORE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create vendor profile
      const vendor = await Vendor.create({
        storeId: storeId,
        user: user._id,
        storeName: vendorData.businessName,
        category: vendorData.category,
        description: vendorData.description,
        phone: '+44-800-555-0001',
        address: {
          street: vendorData.address.street,
          city: vendorData.address.city,
          state: vendorData.address.state,
          postalCode: vendorData.address.postcode,
          country: vendorData.address.country,
          coordinates: {
            latitude: coordinates[1],
            longitude: coordinates[0]
          }
        },
        isVerified: true, // Auto-verify
        isActive: true
      });

      // Create products
      for (const productData of vendorData.products) {
        await Product.create({
          vendor: user._id,
          name: productData.name,
          description: `Fresh ${productData.name} from ${vendorData.businessName}`,
          category: productData.category,
          price: productData.price,
          unit: productData.unit,
          stock: productData.stock,
          lowStockThreshold: 10,
          inStock: true,
          isActive: true,
          images: [{
            url: `https://images.unsplash.com/photo-${getRandomImageId()}?w=400`,
            isPrimary: true
          }]
        });
      }

      console.log(`✅ Created: ${vendorData.name} in ${vendorData.location}`);
    }

    console.log('\n🎉 Successfully seeded 16 UK vendors!');
    console.log('📍 Locations: London (5), Manchester (3), Birmingham (2), Bristol (2), Leeds (2), Liverpool (2)');
    console.log('🔐 Default password for all vendors: Password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding vendors:', error);
    process.exit(1);
  }
};

// Helper: Get coordinates for UK cities
function getCoordinates(city) {
  const coords = {
    'London': [-0.1276, 51.5074],
    'Manchester': [-2.2426, 53.4808],
    'Birmingham': [-1.8904, 52.4862],
    'Bristol': [-2.5879, 51.4545],
    'Leeds': [-1.5491, 53.8008],
    'Liverpool': [-2.9916, 53.4084]
  };
  return coords[city] || [-0.1276, 51.5074]; // Default to London
}

// Helper: Random Unsplash image IDs
function getRandomImageId() {
  const ids = [
    '1542838132-92c53300491e', // vegetables
    '1488459716781-31db52582fe9', // market
    '1555939594-58d7cb561ad1', // fresh produce
    '1619566636858-adf3ef46400b', // fruits
    '1607623814075-e51df1bdc82f', // meat
    '1563636619-e9143da7973b' // dairy
  ];
  return ids[Math.floor(Math.random() * ids.length)];
}

seedVendors();
