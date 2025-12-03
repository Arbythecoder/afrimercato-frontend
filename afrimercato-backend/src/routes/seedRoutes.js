// =================================================================
// SEED ROUTES - Administrative endpoint to seed production database
// =================================================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');

// Real UK Vendors with Authentic African Stores
const realVendors = [
  {
    email: 'greenvalley@afrimercato.com',
    name: 'Green Valley Farms',
    phone: '+44207946000',
    storeName: 'Green Valley Farms',
    storeId: 'GVF-LONDON-001',
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
    storeName: 'Africa Spice Market',
    storeId: 'ASM-LONDON-002',
    businessName: 'Africa Spice Market Ltd',
    businessType: 'company',
    category: 'groceries',
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
    storeName: 'Lagos Kitchen Store',
    storeId: 'LKS-LONDON-003',
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
    storeName: 'Tropical Fruits Hub',
    storeId: 'TFH-MANCH-004',
    businessName: 'Tropical Fruits Hub',
    businessType: 'individual',
    category: 'fresh-produce',
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
    storeName: 'Fresh Meat & Halal',
    storeId: 'FMH-BIRM-005',
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
  ],
  'tropicalfruits@afrimercato.com': [
    {
      name: 'Fresh Mango',
      description: 'Sweet and juicy tropical mangoes.',
      category: 'fruits',
      price: 4.49,
      unit: 'kg',
      stock: 120,
      lowStockThreshold: 20,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', isPrimary: true }]
    },
    {
      name: 'Papaya',
      description: 'Ripe papayas perfect for smoothies and desserts.',
      category: 'fruits',
      price: 3.99,
      unit: 'piece',
      stock: 80,
      lowStockThreshold: 15,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400', isPrimary: true }]
    }
  ],
  'freshmeathalal@afrimercato.com': [
    {
      name: 'Halal Chicken (Whole)',
      description: 'Fresh halal chicken, ethically sourced.',
      category: 'meat',
      price: 12.99,
      unit: 'kg',
      stock: 50,
      lowStockThreshold: 10,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400', isPrimary: true }]
    },
    {
      name: 'Beef Steak',
      description: 'Premium halal beef steak cuts.',
      category: 'meat',
      price: 15.99,
      unit: 'kg',
      stock: 40,
      lowStockThreshold: 10,
      inStock: true,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400', isPrimary: true }]
    }
  ]
};

/**
 * POST /api/seed/vendors
 * Seeds 5 UK vendors with products to production database
 *
 * Security: In production, protect this endpoint with admin auth
 * For now, it's open for initial setup
 */
router.post('/vendors', async (req, res) => {
  try {
    console.log('🌱 Starting vendor seeding via API...');

    // Clear existing seed data (only the specific vendors we're about to create)
    const vendorEmails = realVendors.map(v => v.email);

    await User.deleteMany({ email: { $in: vendorEmails } });
    await Vendor.deleteMany({ 'user.email': { $in: vendorEmails } });

    console.log('✅ Cleared old seed data');

    let successCount = 0;
    const results = [];

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
          storeName: vendorData.storeName,
          storeId: vendorData.storeId,
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
        let productCount = 0;

        if (products.length > 0) {
          const productsWithVendor = products.map(p => ({
            ...p,
            vendor: vendor._id
          }));

          await Product.insertMany(productsWithVendor);
          productCount = products.length;
          console.log(`  ✅ Created ${products.length} products`);
        }

        console.log(`  ✅ Created vendor: ${vendorData.name}`);

        results.push({
          name: vendorData.name,
          email: vendorData.email,
          city: vendorData.address.city,
          productsCreated: productCount,
          success: true
        });

        successCount++;
      } catch (error) {
        console.error(`  ❌ Failed to create ${vendorData.name}:`, error.message);
        results.push({
          name: vendorData.name,
          email: vendorData.email,
          error: error.message,
          success: false
        });
      }
    }

    // Get summary counts
    const vendorCount = await Vendor.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments({ role: 'vendor' });

    res.status(200).json({
      success: true,
      message: `Successfully seeded ${successCount}/${realVendors.length} vendors!`,
      summary: {
        totalVendors: vendorCount,
        totalProducts: productCount,
        totalVendorUsers: userCount
      },
      vendors: results,
      credentials: realVendors.map(v => ({
        name: v.name,
        email: v.email,
        password: 'Password123',
        location: `${v.address.city}, ${v.address.postcode}`
      }))
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed vendors',
      error: error.message
    });
  }
});

/**
 * GET /api/seed/status
 * Check current database status
 */
router.get('/status', async (req, res) => {
  try {
    const vendorCount = await Vendor.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments({ role: 'vendor' });

    res.json({
      success: true,
      database: {
        vendors: vendorCount,
        products: productCount,
        vendorUsers: userCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: error.message
    });
  }
});

module.exports = router;
