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
  },

  // ── OUT-OF-LONDON STORES (5 cities) ────────────────────────────────────────
  {
    email: 'cheetham.african@afrimercato.dev',
    storeName: 'Cheetham Hill African Market',
    storeId: 'CHTHML11',
    category: 'African Groceries',
    description: 'Manchester\'s leading African grocery store with a wide selection of West and East African staples.',
    address: { street: '34 Cheetham Hill Road', city: 'Manchester', postcode: 'M8 8QS' },
    location: { address: 'Cheetham Hill, Manchester', postcode: 'M8 8QS', latitude: 53.5045, longitude: -2.2344 },
    phone: '+44 7911 123411',
    rating: 4.6,
    logo: IMG.spices,
    prepTime: 30,
    products: [
      { name: 'Egusi (Whole) 500g',          category: 'Soups & Seeds',       price: 7.49, unit: '500g', stock: 40, images: [IMG.spices],   rating: 4.7 },
      { name: 'Dried Crayfish 200g',          category: 'Spices & Seasonings', price: 4.99, unit: '200g', stock: 35, images: [IMG.spices],   rating: 4.6 },
      { name: 'Jollof Rice Mix 500g',         category: 'Grains & Rice',       price: 3.99, unit: '500g', stock: 55, images: [IMG.grains],   rating: 4.8 },
      { name: 'Palm Oil (Red) 2L',            category: 'Cooking Oils',        price: 10.99, unit: '2L',  stock: 30, images: [IMG.oil],      rating: 4.5 },
      { name: 'Eba (Garri Yellow) 1.5kg',     category: 'Grains & Flour',      price: 5.49, unit: '1.5kg', stock: 45, images: [IMG.grains], rating: 4.6 }
    ]
  },
  {
    email: 'soho.road.foods@afrimercato.dev',
    storeName: 'Soho Road African Foods',
    storeId: 'SOHORD12',
    category: 'African & Halal Groceries',
    description: 'Premium African and Halal groceries serving Birmingham\'s diverse Handsworth community.',
    address: { street: '23 Soho Road', city: 'Birmingham', postcode: 'B21 9BH' },
    location: { address: 'Handsworth, Birmingham', postcode: 'B21 9BH', latitude: 52.5000, longitude: -1.9310 },
    phone: '+44 7911 123412',
    rating: 4.8,
    logo: IMG.produce,
    prepTime: 25,
    products: [
      { name: 'Fresh Yam (Cut) 2kg',          category: 'Fresh Produce',       price: 8.49, unit: '2kg',  stock: 35, images: [IMG.yam],     rating: 4.8 },
      { name: 'Plantain (Ripe) 4 pcs',        category: 'Fresh Produce',       price: 2.99, unit: '4 pcs', stock: 50, images: [IMG.plantain], rating: 4.7 },
      { name: 'Stockfish (Medium) 300g',       category: 'Dried Fish',          price: 12.49, unit: '300g', stock: 20, images: [IMG.fish],   rating: 4.6 },
      { name: 'Suya Spice 100g',              category: 'Spices & Seasonings', price: 3.49, unit: '100g', stock: 60, images: [IMG.spices],  rating: 4.9 },
      { name: 'Orishirishi Mix 400g',         category: 'Soups & Seeds',       price: 6.99, unit: '400g', stock: 25, images: [IMG.spices],  rating: 4.5 }
    ]
  },
  {
    email: 'stapleton.rd.market@afrimercato.dev',
    storeName: 'Stapleton Road Market',
    storeId: 'STPLRD13',
    category: 'African Caribbean Groceries',
    description: 'Bristol\'s go-to African and Caribbean grocery store in the heart of Easton.',
    address: { street: '12 Stapleton Road', city: 'Bristol', postcode: 'BS5 0QH' },
    location: { address: 'Easton, Bristol', postcode: 'BS5 0QH', latitude: 51.4602, longitude: -2.5665 },
    phone: '+44 7911 123413',
    rating: 4.7,
    logo: IMG.general,
    prepTime: 28,
    products: [
      { name: 'Scotch Bonnet Peppers 500g',   category: 'Fresh Produce',       price: 4.99, unit: '500g', stock: 45, images: [IMG.peppers], rating: 4.8 },
      { name: 'Coconut Oil (Raw) 500ml',      category: 'Cooking Oils',        price: 7.49, unit: '500ml', stock: 30, images: [IMG.oil],    rating: 4.7 },
      { name: 'Black-Eyed Beans 1kg',         category: 'Legumes',             price: 3.29, unit: '1kg',  stock: 55, images: [IMG.grains],  rating: 4.5 },
      { name: 'Plantain Flour 500g',          category: 'Grains & Flour',      price: 5.99, unit: '500g', stock: 35, images: [IMG.grains],  rating: 4.6 },
      { name: 'Dried Tilapia 250g',           category: 'Dried Fish',          price: 8.99, unit: '250g', stock: 25, images: [IMG.fish],    rating: 4.4 }
    ]
  },
  {
    email: 'harehills.grocers@afrimercato.dev',
    storeName: 'Harehills African Grocers',
    storeId: 'HREHLS14',
    category: 'African Foods',
    description: 'Serving Leeds\' African community with authentic produce and pantry essentials since 2018.',
    address: { street: '67 Harehills Lane', city: 'Leeds', postcode: 'LS8 4DN' },
    location: { address: 'Harehills, Leeds', postcode: 'LS8 4DN', latitude: 53.8136, longitude: -1.5180 },
    phone: '+44 7911 123414',
    rating: 4.6,
    logo: IMG.grains,
    prepTime: 32,
    products: [
      { name: 'Ogbono Seeds 300g',            category: 'Soups & Seeds',       price: 7.99, unit: '300g', stock: 30, images: [IMG.spices],   rating: 4.7 },
      { name: 'White Beans 1kg',              category: 'Legumes',             price: 2.99, unit: '1kg',  stock: 60, images: [IMG.grains],   rating: 4.5 },
      { name: 'Groundnut Oil 1L',             category: 'Cooking Oils',        price: 5.99, unit: '1L',   stock: 40, images: [IMG.oil],      rating: 4.6 },
      { name: 'Semovita 1kg',                 category: 'Grains & Flour',      price: 4.49, unit: '1kg',  stock: 45, images: [IMG.grains],   rating: 4.8 },
      { name: 'Ede-Ede Spice Blend 150g',     category: 'Spices & Seasonings', price: 3.79, unit: '150g', stock: 35, images: [IMG.spices],   rating: 4.4 }
    ]
  },
  {
    email: 'granby.street.market@afrimercato.dev',
    storeName: 'Granby Street African Market',
    storeId: 'GRNBST15',
    category: 'African & Caribbean Foods',
    description: 'Liverpool\'s finest African and Caribbean food store in the vibrant Toxteth neighbourhood.',
    address: { street: '45 Granby Street', city: 'Liverpool', postcode: 'L8 2TU' },
    location: { address: 'Toxteth, Liverpool', postcode: 'L8 2TU', latitude: 53.3875, longitude: -2.9747 },
    phone: '+44 7911 123415',
    rating: 4.7,
    logo: IMG.produce,
    prepTime: 30,
    products: [
      { name: 'Fufu (Cocoyam) 1kg',           category: 'Grains & Flour',      price: 6.49, unit: '1kg',  stock: 40, images: [IMG.grains],   rating: 4.7 },
      { name: 'Bitter Leaf (Dried) 100g',     category: 'Spices & Seasonings', price: 3.49, unit: '100g', stock: 35, images: [IMG.produce],  rating: 4.5 },
      { name: 'Mackerel (Smoked) 2 pcs',      category: 'Dried Fish',          price: 5.49, unit: '2 pcs', stock: 30, images: [IMG.fish],    rating: 4.6 },
      { name: 'Fresh Okra 300g',              category: 'Fresh Produce',       price: 2.79, unit: '300g', stock: 55, images: [IMG.produce],  rating: 4.8 },
      { name: 'Dawadawa Powder 100g',         category: 'Spices & Seasonings', price: 4.29, unit: '100g', stock: 30, images: [IMG.spices],   rating: 4.6 }
    ]
  },

  // ── BATCH 3: 15 MORE CITIES ────────────────────────────────────────────────
  {
    email: 'sharrow.african@afrimercato.dev',
    storeName: 'Sharrow African Market',
    storeId: 'SHRWAF16',
    category: 'African Groceries',
    description: 'Sheffield\'s favourite African grocery store with fresh produce and pantry staples.',
    address: { street: '12 London Road', city: 'Sheffield', postcode: 'S2 4LA' },
    location: { address: 'Sharrow, Sheffield', postcode: 'S2 4LA', latitude: 53.3645, longitude: -1.4705 },
    phone: '+44 7911 123416',
    rating: 4.6,
    logo: IMG.produce,
    prepTime: 30,
    products: [
      { name: 'White Garri 1kg',              category: 'Grains & Flour',      price: 3.49, unit: '1kg',  stock: 50, images: [IMG.grains],  rating: 4.7 },
      { name: 'Egusi (Ground) 400g',          category: 'Soups & Seeds',       price: 6.99, unit: '400g', stock: 35, images: [IMG.spices],  rating: 4.6 },
      { name: 'Plantain (Green) 4 pcs',       category: 'Fresh Produce',       price: 2.49, unit: '4 pcs', stock: 45, images: [IMG.plantain], rating: 4.5 },
      { name: 'Palm Oil 1L',                  category: 'Cooking Oils',        price: 5.99, unit: '1L',   stock: 30, images: [IMG.oil],     rating: 4.6 },
      { name: 'Crayfish (Ground) 150g',       category: 'Spices & Seasonings', price: 4.49, unit: '150g', stock: 40, images: [IMG.spices],  rating: 4.5 }
    ]
  },
  {
    email: 'byker.african@afrimercato.dev',
    storeName: 'Byker African Store',
    storeId: 'BYKRAF17',
    category: 'African & Caribbean Foods',
    description: 'Bringing the best of African and Caribbean flavours to Newcastle upon Tyne.',
    address: { street: '34 Shields Road', city: 'Newcastle', postcode: 'NE6 1DN' },
    location: { address: 'Byker, Newcastle', postcode: 'NE6 1DN', latitude: 54.9749, longitude: -1.5782 },
    phone: '+44 7911 123417',
    rating: 4.5,
    logo: IMG.general,
    prepTime: 35,
    products: [
      { name: 'Fufu Flour 1kg',               category: 'Grains & Flour',      price: 5.49, unit: '1kg',  stock: 40, images: [IMG.grains],  rating: 4.6 },
      { name: 'Stockfish Pieces 200g',        category: 'Dried Fish',          price: 9.99, unit: '200g', stock: 20, images: [IMG.fish],    rating: 4.5 },
      { name: 'Suya Spice Mix 100g',          category: 'Spices & Seasonings', price: 3.29, unit: '100g', stock: 55, images: [IMG.spices],  rating: 4.7 },
      { name: 'Scotch Bonnet Sauce 250ml',    category: 'Sauces & Condiments', price: 3.99, unit: '250ml', stock: 40, images: [IMG.peppers], rating: 4.6 },
      { name: 'Basmati Rice 2kg',             category: 'Grains & Rice',       price: 4.99, unit: '2kg',  stock: 55, images: [IMG.grains],  rating: 4.5 }
    ]
  },
  {
    email: 'govanhill.african@afrimercato.dev',
    storeName: 'Govanhill African Foods',
    storeId: 'GVNHLF18',
    category: 'African Groceries',
    description: 'Glasgow\'s multicultural heart — authentic African ingredients and fresh produce.',
    address: { street: '56 Cathcart Road', city: 'Glasgow', postcode: 'G42 7RT' },
    location: { address: 'Govanhill, Glasgow', postcode: 'G42 7RT', latitude: 55.8405, longitude: -4.2594 },
    phone: '+44 7911 123418',
    rating: 4.7,
    logo: IMG.spices,
    prepTime: 28,
    products: [
      { name: 'Ogbono (Ground) 300g',         category: 'Soups & Seeds',       price: 7.49, unit: '300g', stock: 30, images: [IMG.spices],  rating: 4.7 },
      { name: 'Yam Flour 500g',               category: 'Grains & Flour',      price: 4.99, unit: '500g', stock: 45, images: [IMG.grains],  rating: 4.6 },
      { name: 'Dried Herrings 200g',          category: 'Dried Fish',          price: 4.29, unit: '200g', stock: 30, images: [IMG.fish],    rating: 4.4 },
      { name: 'Coconut Cream 400ml',          category: 'Cooking Essentials',  price: 2.29, unit: '400ml', stock: 50, images: [IMG.general], rating: 4.5 },
      { name: 'Groundnuts (Raw) 500g',        category: 'Nuts & Seeds',        price: 3.79, unit: '500g', stock: 55, images: [IMG.nuts],    rating: 4.6 }
    ]
  },
  {
    email: 'leith.african@afrimercato.dev',
    storeName: 'Leith African Pantry',
    storeId: 'LEITHP19',
    category: 'East & West African Provisions',
    description: 'Edinburgh\'s go-to pantry for African cooking essentials in the vibrant Leith area.',
    address: { street: '18 Leith Walk', city: 'Edinburgh', postcode: 'EH6 5EB' },
    location: { address: 'Leith, Edinburgh', postcode: 'EH6 5EB', latitude: 55.9701, longitude: -3.1718 },
    phone: '+44 7911 123419',
    rating: 4.6,
    logo: IMG.produce,
    prepTime: 32,
    products: [
      { name: 'Millet Flour 500g',            category: 'Grains & Flour',      price: 3.49, unit: '500g', stock: 40, images: [IMG.grains],  rating: 4.5 },
      { name: 'Raw Honey 250g',               category: 'Sweeteners',          price: 7.99, unit: '250g', stock: 25, images: [IMG.general], rating: 4.7 },
      { name: 'Bitter Kola 100g',             category: 'Spices & Seasonings', price: 5.99, unit: '100g', stock: 20, images: [IMG.spices],  rating: 4.6 },
      { name: 'Cassava Chips 200g',           category: 'Snacks',              price: 2.79, unit: '200g', stock: 50, images: [IMG.grains],  rating: 4.5 },
      { name: 'Zobo (Hibiscus) 100g',         category: 'Beverages',           price: 3.29, unit: '100g', stock: 35, images: [IMG.produce], rating: 4.6 }
    ]
  },
  {
    email: 'radford.african@afrimercato.dev',
    storeName: 'Radford African Grocers',
    storeId: 'RDFRAF20',
    category: 'Nigerian & Ghanaian Foods',
    description: 'Nottingham\'s finest Nigerian and Ghanaian grocery store with weekly fresh deliveries.',
    address: { street: '45 Alfreton Road', city: 'Nottingham', postcode: 'NG7 3JE' },
    location: { address: 'Radford, Nottingham', postcode: 'NG7 3JE', latitude: 52.9553, longitude: -1.1697 },
    phone: '+44 7911 123420',
    rating: 4.7,
    logo: IMG.grains,
    prepTime: 27,
    products: [
      { name: 'Semovita 2kg',                 category: 'Grains & Flour',      price: 7.99, unit: '2kg',  stock: 40, images: [IMG.grains],  rating: 4.8 },
      { name: 'Dried Titus Fish 300g',        category: 'Dried Fish',          price: 6.99, unit: '300g', stock: 25, images: [IMG.fish],    rating: 4.6 },
      { name: 'Tom Brown (Roasted) 500g',     category: 'Grains & Flour',      price: 4.49, unit: '500g', stock: 35, images: [IMG.grains],  rating: 4.5 },
      { name: 'Pounded Yam 1kg',              category: 'Grains & Flour',      price: 5.99, unit: '1kg',  stock: 45, images: [IMG.grains],  rating: 4.7 },
      { name: 'Agbalumo (Dried) 100g',        category: 'Snacks',              price: 4.99, unit: '100g', stock: 20, images: [IMG.produce], rating: 4.5 }
    ]
  },
  {
    email: 'belgrave.african@afrimercato.dev',
    storeName: 'Belgrave Road African Market',
    storeId: 'BLGRAV21',
    category: 'African & Asian Groceries',
    description: 'Leicester\'s multicultural market offering African and South Asian ingredients side by side.',
    address: { street: '67 Belgrave Road', city: 'Leicester', postcode: 'LE4 6AS' },
    location: { address: 'Belgrave, Leicester', postcode: 'LE4 6AS', latitude: 52.6400, longitude: -1.1200 },
    phone: '+44 7911 123421',
    rating: 4.6,
    logo: IMG.general,
    prepTime: 25,
    products: [
      { name: 'Red Beans 1kg',                category: 'Legumes',             price: 2.99, unit: '1kg',  stock: 60, images: [IMG.grains],  rating: 4.5 },
      { name: 'Dawadawa (Fermented) 100g',    category: 'Spices & Seasonings', price: 5.49, unit: '100g', stock: 30, images: [IMG.spices],  rating: 4.6 },
      { name: 'Coconut Oil 500ml',            category: 'Cooking Oils',        price: 6.99, unit: '500ml', stock: 35, images: [IMG.oil],    rating: 4.7 },
      { name: 'African Pepper Soup Mix 80g',  category: 'Spices & Seasonings', price: 2.99, unit: '80g',  stock: 50, images: [IMG.spices],  rating: 4.6 },
      { name: 'Ogi (Corn Pap) 500g',          category: 'Grains & Flour',      price: 3.99, unit: '500g', stock: 40, images: [IMG.grains],  rating: 4.4 }
    ]
  },
  {
    email: 'portswood.african@afrimercato.dev',
    storeName: 'Portswood African Store',
    storeId: 'PRTWDS22',
    category: 'African Foods',
    description: 'Southampton\'s leading African food store serving students and local community.',
    address: { street: '23 Portswood Road', city: 'Southampton', postcode: 'SO17 2NG' },
    location: { address: 'Portswood, Southampton', postcode: 'SO17 2NG', latitude: 50.9278, longitude: -1.3891 },
    phone: '+44 7911 123422',
    rating: 4.5,
    logo: IMG.spices,
    prepTime: 30,
    products: [
      { name: 'Jollof Seasoning 100g',        category: 'Spices & Seasonings', price: 2.99, unit: '100g', stock: 60, images: [IMG.spices],  rating: 4.7 },
      { name: 'Brown Rice 1kg',               category: 'Grains & Rice',       price: 3.99, unit: '1kg',  stock: 50, images: [IMG.grains],  rating: 4.5 },
      { name: 'Dried Pepper (Tatashe) 100g',  category: 'Spices & Seasonings', price: 3.49, unit: '100g', stock: 40, images: [IMG.peppers], rating: 4.6 },
      { name: 'Scotch Bonnet Peppers 200g',   category: 'Fresh Produce',       price: 2.99, unit: '200g', stock: 45, images: [IMG.peppers], rating: 4.5 },
      { name: 'Tomato Paste 400g',            category: 'Sauces & Pastes',     price: 1.49, unit: '400g', stock: 70, images: [IMG.produce], rating: 4.4 }
    ]
  },
  {
    email: 'roath.african@afrimercato.dev',
    storeName: 'Roath African Grocery',
    storeId: 'ROATAG23',
    category: 'African Groceries',
    description: 'Cardiff\'s friendly African grocery in the cosmopolitan Roath neighbourhood.',
    address: { street: '8 City Road', city: 'Cardiff', postcode: 'CF24 3DL' },
    location: { address: 'Roath, Cardiff', postcode: 'CF24 3DL', latitude: 51.4866, longitude: -3.1666 },
    phone: '+44 7911 123423',
    rating: 4.6,
    logo: IMG.produce,
    prepTime: 28,
    products: [
      { name: 'Fresh Catfish (Frozen) 1kg',   category: 'Fresh Fish',          price: 12.99, unit: '1kg', stock: 20, images: [IMG.fish],    rating: 4.7 },
      { name: 'Egusi Soup Mix 200g',          category: 'Soups & Seeds',       price: 5.99, unit: '200g', stock: 35, images: [IMG.spices],  rating: 4.6 },
      { name: 'Yam Pieces (Fresh) 1kg',       category: 'Fresh Produce',       price: 4.99, unit: '1kg',  stock: 30, images: [IMG.yam],     rating: 4.5 },
      { name: 'Locust Bean Powder 80g',       category: 'Spices & Seasonings', price: 4.29, unit: '80g',  stock: 40, images: [IMG.spices],  rating: 4.6 },
      { name: 'Gari (Yellow) 2kg',            category: 'Grains & Flour',      price: 6.49, unit: '2kg',  stock: 45, images: [IMG.grains],  rating: 4.5 }
    ]
  },
  {
    email: 'falls.african@afrimercato.dev',
    storeName: 'Falls Road African Market',
    storeId: 'FALLSAF24',
    category: 'African & Caribbean Groceries',
    description: 'Belfast\'s first dedicated African and Caribbean grocery store on the Falls Road.',
    address: { street: '112 Falls Road', city: 'Belfast', postcode: 'BT12 6AB' },
    location: { address: 'Falls Road, Belfast', postcode: 'BT12 6AB', latitude: 54.5952, longitude: -5.9459 },
    phone: '+44 7911 123424',
    rating: 4.5,
    logo: IMG.general,
    prepTime: 35,
    products: [
      { name: 'Plantain Flour 500g',          category: 'Grains & Flour',      price: 5.99, unit: '500g', stock: 35, images: [IMG.grains],  rating: 4.5 },
      { name: 'Dried Catfish 200g',           category: 'Dried Fish',          price: 7.49, unit: '200g', stock: 25, images: [IMG.fish],    rating: 4.6 },
      { name: 'Suya Spice (Yaji) 150g',       category: 'Spices & Seasonings', price: 3.99, unit: '150g', stock: 50, images: [IMG.spices],  rating: 4.7 },
      { name: 'Coconut Milk 400ml',           category: 'Cooking Essentials',  price: 1.69, unit: '400ml', stock: 60, images: [IMG.general], rating: 4.5 },
      { name: 'Ogiri (Fermented) 50g',        category: 'Spices & Seasonings', price: 2.99, unit: '50g',  stock: 30, images: [IMG.spices],  rating: 4.4 }
    ]
  },
  {
    email: 'kemptown.african@afrimercato.dev',
    storeName: 'Kemptown African Deli',
    storeId: 'KMPTAF25',
    category: 'Premium African Foods',
    description: 'Brighton\'s premier African deli with artisanal products and organic options.',
    address: { street: '33 St George\'s Road', city: 'Brighton', postcode: 'BN2 1EF' },
    location: { address: 'Kemptown, Brighton', postcode: 'BN2 1EF', latitude: 50.8202, longitude: -0.1217 },
    phone: '+44 7911 123425',
    rating: 4.8,
    logo: IMG.produce,
    prepTime: 22,
    products: [
      { name: 'Moringa Powder (Organic) 100g', category: 'Superfoods',         price: 9.99, unit: '100g', stock: 30, images: [IMG.produce], rating: 4.8 },
      { name: 'Baobab Powder 150g',           category: 'Superfoods',          price: 8.49, unit: '150g', stock: 25, images: [IMG.produce], rating: 4.7 },
      { name: 'Tiger Nuts 300g',              category: 'Nuts & Seeds',        price: 5.99, unit: '300g', stock: 40, images: [IMG.nuts],    rating: 4.6 },
      { name: 'Hibiscus Tea 50g',             category: 'Beverages',           price: 4.49, unit: '50g',  stock: 45, images: [IMG.produce], rating: 4.9 },
      { name: 'Shea Butter (Refined) 150g',   category: 'Cooking Oils',        price: 8.99, unit: '150g', stock: 20, images: [IMG.general], rating: 4.7 }
    ]
  },
  {
    email: 'holderness.african@afrimercato.dev',
    storeName: 'Holderness Road African Store',
    storeId: 'HLDRAF26',
    category: 'African Groceries',
    description: 'Hull\'s go-to African grocery for weekly essentials and fresh produce.',
    address: { street: '78 Holderness Road', city: 'Hull', postcode: 'HU8 7EA' },
    location: { address: 'East Hull, Hull', postcode: 'HU8 7EA', latitude: 53.7457, longitude: -0.3145 },
    phone: '+44 7911 123426',
    rating: 4.4,
    logo: IMG.grains,
    prepTime: 35,
    products: [
      { name: 'Yellow Garri 2kg',             category: 'Grains & Flour',      price: 5.49, unit: '2kg',  stock: 45, images: [IMG.grains],  rating: 4.5 },
      { name: 'Dried Mackerel 250g',          category: 'Dried Fish',          price: 5.99, unit: '250g', stock: 30, images: [IMG.fish],    rating: 4.4 },
      { name: 'Black-Eyed Peas 500g',         category: 'Legumes',             price: 2.49, unit: '500g', stock: 60, images: [IMG.grains],  rating: 4.5 },
      { name: 'Ground Pepper Mix 100g',       category: 'Spices & Seasonings', price: 2.99, unit: '100g', stock: 50, images: [IMG.peppers], rating: 4.4 },
      { name: 'Palm Kernel Oil 500ml',        category: 'Cooking Oils',        price: 6.49, unit: '500ml', stock: 25, images: [IMG.oil],    rating: 4.3 }
    ]
  },
  {
    email: 'manningham.african@afrimercato.dev',
    storeName: 'Manningham African Foods',
    storeId: 'MNNGHM27',
    category: 'African & Halal Groceries',
    description: 'Bradford\'s trusted source for African and Halal groceries in Manningham.',
    address: { street: '56 Oak Lane', city: 'Bradford', postcode: 'BD8 7QF' },
    location: { address: 'Manningham, Bradford', postcode: 'BD8 7QF', latitude: 53.8059, longitude: -1.7630 },
    phone: '+44 7911 123427',
    rating: 4.6,
    logo: IMG.spices,
    prepTime: 30,
    products: [
      { name: 'Egusi (Whole) 400g',           category: 'Soups & Seeds',       price: 6.49, unit: '400g', stock: 35, images: [IMG.spices],  rating: 4.6 },
      { name: 'Halal Suya Spice 100g',        category: 'Spices & Seasonings', price: 3.99, unit: '100g', stock: 55, images: [IMG.spices],  rating: 4.8 },
      { name: 'Fresh Plantain 4 pcs',         category: 'Fresh Produce',       price: 2.99, unit: '4 pcs', stock: 40, images: [IMG.plantain], rating: 4.6 },
      { name: 'Stockfish Head 300g',          category: 'Dried Fish',          price: 10.99, unit: '300g', stock: 20, images: [IMG.fish],   rating: 4.5 },
      { name: 'Brown Beans 1kg',              category: 'Legumes',             price: 3.49, unit: '1kg',  stock: 55, images: [IMG.grains],  rating: 4.5 }
    ]
  },
  {
    email: 'foleshill.african@afrimercato.dev',
    storeName: 'Foleshill African Market',
    storeId: 'FLSHLL28',
    category: 'African Groceries',
    description: 'Coventry\'s Foleshill neighbourhood specialist for African cooking ingredients.',
    address: { street: '34 Foleshill Road', city: 'Coventry', postcode: 'CV1 4JH' },
    location: { address: 'Foleshill, Coventry', postcode: 'CV1 4JH', latitude: 52.4250, longitude: -1.5020 },
    phone: '+44 7911 123428',
    rating: 4.5,
    logo: IMG.produce,
    prepTime: 28,
    products: [
      { name: 'Cassava Flour 1kg',            category: 'Grains & Flour',      price: 4.49, unit: '1kg',  stock: 40, images: [IMG.grains],  rating: 4.6 },
      { name: 'Palm Nut Cream 400g',          category: 'Soups & Sauces',      price: 3.29, unit: '400g', stock: 35, images: [IMG.oil],     rating: 4.5 },
      { name: 'Zobo Leaves (Dried) 80g',      category: 'Beverages',           price: 2.99, unit: '80g',  stock: 45, images: [IMG.produce], rating: 4.4 },
      { name: 'Smoked Catfish 150g',          category: 'Dried Fish',          price: 7.49, unit: '150g', stock: 25, images: [IMG.fish],    rating: 4.6 },
      { name: 'Dried Okra 100g',              category: 'Spices & Seasonings', price: 3.49, unit: '100g', stock: 40, images: [IMG.produce], rating: 4.5 }
    ]
  },
  {
    email: 'bilston.african@afrimercato.dev',
    storeName: 'Bilston Road African Store',
    storeId: 'BLSTNR29',
    category: 'West African Foods',
    description: 'Wolverhampton\'s community African food store with authentic West African produce.',
    address: { street: '89 Bilston Road', city: 'Wolverhampton', postcode: 'WV2 2JL' },
    location: { address: 'Bilston Road, Wolverhampton', postcode: 'WV2 2JL', latitude: 52.5785, longitude: -2.1175 },
    phone: '+44 7911 123429',
    rating: 4.6,
    logo: IMG.general,
    prepTime: 30,
    products: [
      { name: 'Ogbono Seeds 200g',            category: 'Soups & Seeds',       price: 6.49, unit: '200g', stock: 30, images: [IMG.spices],  rating: 4.7 },
      { name: 'Banga Spice Mix 100g',         category: 'Spices & Seasonings', price: 3.79, unit: '100g', stock: 45, images: [IMG.spices],  rating: 4.6 },
      { name: 'Dried Yam Slices 300g',        category: 'Fresh Produce',       price: 4.49, unit: '300g', stock: 35, images: [IMG.yam],     rating: 4.5 },
      { name: 'Groundnut Oil 1L',             category: 'Cooking Oils',        price: 6.49, unit: '1L',   stock: 40, images: [IMG.oil],     rating: 4.5 },
      { name: 'Crayfish (Whole) 100g',        category: 'Spices & Seasonings', price: 3.99, unit: '100g', stock: 35, images: [IMG.spices],  rating: 4.6 }
    ]
  },
  {
    email: 'cowley.african@afrimercato.dev',
    storeName: 'Cowley Road African Foods',
    storeId: 'CWLRAF30',
    category: 'African & World Foods',
    description: 'Oxford\'s vibrant Cowley Road African food shop loved by students and locals alike.',
    address: { street: '45 Cowley Road', city: 'Oxford', postcode: 'OX4 1HZ' },
    location: { address: 'Cowley Road, Oxford', postcode: 'OX4 1HZ', latitude: 51.7478, longitude: -1.2312 },
    phone: '+44 7911 123430',
    rating: 4.7,
    logo: IMG.spices,
    prepTime: 25,
    products: [
      { name: 'Jollof Spice Pack 150g',       category: 'Spices & Seasonings', price: 3.99, unit: '150g', stock: 55, images: [IMG.spices],  rating: 4.8 },
      { name: 'Plantain Chips (Salted) 150g', category: 'Snacks',              price: 2.79, unit: '150g', stock: 60, images: [IMG.plantain], rating: 4.7 },
      { name: 'Pounded Yam Flour 500g',       category: 'Grains & Flour',      price: 5.49, unit: '500g', stock: 40, images: [IMG.grains],  rating: 4.6 },
      { name: 'Bitter Leaf (Fresh) 200g',     category: 'Fresh Produce',       price: 2.29, unit: '200g', stock: 35, images: [IMG.produce], rating: 4.5 },
      { name: 'Smoked Herrings 200g',         category: 'Dried Fish',          price: 4.99, unit: '200g', stock: 30, images: [IMG.fish],    rating: 4.6 }
    ]
  }
];

// ---------------------------------------------------------------------------
// SEED RIDERS — 5 riders across UK cities (loginable test accounts)
// ---------------------------------------------------------------------------
// ALL RIDER ACCOUNTS: password = seed@afrimercato2024
// ┌─────────────────────────────────────────────────────────────────────┐
// │  Rider #1  ride.london@afrimercato.dev      — London               │
// │  Rider #2  ride.manchester@afrimercato.dev  — Manchester           │
// │  Rider #3  ride.birmingham@afrimercato.dev  — Birmingham           │
// │  Rider #4  ride.bristol@afrimercato.dev     — Bristol              │
// │  Rider #5  ride.leeds@afrimercato.dev       — Leeds                │
// └─────────────────────────────────────────────────────────────────────┘
const SEED_RIDERS = [
  { email: 'ride.london@afrimercato.dev',     name: 'James Osei',      phone: '+44 7911 200101', city: 'London' },
  { email: 'ride.manchester@afrimercato.dev', name: 'Kweku Mensah',    phone: '+44 7911 200102', city: 'Manchester' },
  { email: 'ride.birmingham@afrimercato.dev', name: 'Tunde Bakare',    phone: '+44 7911 200103', city: 'Birmingham' },
  { email: 'ride.bristol@afrimercato.dev',    name: 'Samuel Asante',   phone: '+44 7911 200104', city: 'Bristol' },
  { email: 'ride.leeds@afrimercato.dev',      name: 'Emmanuel Adjei',  phone: '+44 7911 200105', city: 'Leeds' }
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

// ---------------------------------------------------------------------------
// SEED RIDERS
// ---------------------------------------------------------------------------
const seedRiders = async (req, res) => {
  try {
    let ridersCreated = 0;
    const riderNames = [];

    for (const data of SEED_RIDERS) {
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create({
          email: data.email,
          password: 'seed@afrimercato2024',
          name: data.name,
          phone: data.phone,
          roles: ['rider'],
          verified: true,
          emailVerified: true
        });
        ridersCreated++;
        riderNames.push(data.name);
      }
    }

    res.status(200).json({
      success: true,
      message: `Rider seed complete. ${ridersCreated} riders created.`,
      data: { ridersCreated, riderNames }
    });
  } catch (error) {
    console.error('[Seed] Rider seed failed:', error);
    res.status(500).json({ success: false, message: 'Rider seed failed: ' + error.message });
  }
};

// ---------------------------------------------------------------------------
// CLEAR RIDERS
// ---------------------------------------------------------------------------
const clearRiders = async (req, res) => {
  try {
    const emails = SEED_RIDERS.map(r => r.email);
    const result = await User.deleteMany({ email: { $in: emails } });
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} rider accounts cleared.`,
      data: { ridersDeleted: result.deletedCount }
    });
  } catch (error) {
    console.error('[Seed] Clear riders failed:', error);
    res.status(500).json({ success: false, message: 'Clear riders failed: ' + error.message });
  }
};

module.exports = {
  seedVendors,
  seedProducts,
  clearVendors,
  clearProducts,
  getSeedStatus,
  seedRiders,
  clearRiders
};
