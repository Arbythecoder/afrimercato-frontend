/**
 * Update existing sample products with proper Unsplash images
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Vendor = require('./src/models/Vendor');

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

// Product images from Unsplash (high quality food photos)
const productImages = {
  // Vegetables
  'tomatoes': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=400&fit=crop',
  'carrots': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
  'potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop',
  'peppers': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop',
  'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
  'broccoli': 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=400&h=400&fit=crop',
  'lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=400&fit=crop',
  'onions': 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&h=400&fit=crop',
  'cucumber': 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&h=400&fit=crop',
  'cabbage': 'https://images.unsplash.com/photo-1594759207583-3c5c87e30ca4?w=400&h=400&fit=crop',

  // Fruits
  'apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
  'bananas': 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=400&fit=crop',
  'strawberries': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop',
  'oranges': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop',

  // Meat
  'beef': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop',
  'chicken': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop',
  'pork': 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=400&fit=crop',
  'lamb': 'https://images.unsplash.com/photo-1588347818036-e77e39b8faa6?w=400&h=400&fit=crop',
  'steak': 'https://images.unsplash.com/photo-1588347818036-e77e39b8faa6?w=400&h=400&fit=crop',
  'sausages': 'https://images.unsplash.com/photo-1633964913295-ceb43826a270?w=400&h=400&fit=crop',
  'bacon': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=400&h=400&fit=crop',
  'turkey': 'https://images.unsplash.com/photo-1629944628916-2d56d112fce4?w=400&h=400&fit=crop',

  // Fish
  'salmon': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=400&fit=crop',
  'cod': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=400&fit=crop',
  'tuna': 'https://images.unsplash.com/photo-1580497898043-b2a0b1c0d81e?w=400&h=400&fit=crop',
  'prawns': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop',
  'fish': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=400&fit=crop',

  // Dairy
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
  'cheese': 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=400&fit=crop',
  'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
  'butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop',
  'eggs': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop',
  'cream': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop',
  'cottage cheese': 'https://images.unsplash.com/photo-1628773822534-7049a61ee0c2?w=400&h=400&fit=crop',
};

// Function to find matching image URL based on product name
const findImageForProduct = (productName) => {
  const nameLower = productName.toLowerCase();

  for (const [keyword, imageUrl] of Object.entries(productImages)) {
    if (nameLower.includes(keyword)) {
      return imageUrl;
    }
  }

  // Default fallback image
  return 'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=400&h=400&fit=crop';
};

// Update products with images
const updateProductsWithImages = async () => {
  console.log('\n🚀 Starting Product Image Update...\n');

  try {
    // Get all products
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products to update\n`);

    let updated = 0;
    let skipped = 0;
    for (const product of products) {
      try {
        // Find appropriate image
        const imageUrl = findImageForProduct(product.name);

        // Update product with image
        product.images = [{
          url: imageUrl,
          isPrimary: true
        }];

        await product.save();
        console.log(`✅ Updated: ${product.name} → ${imageUrl}`);
        updated++;
      } catch (error) {
        console.log(`⚠️  Skipped invalid product: ${product.name} (${error.message})`);
        skipped++;
      }
    }

    console.log(`\n🎉 Successfully updated ${updated} products with images!`);
    if (skipped > 0) {
      console.log(`⚠️  Skipped ${skipped} invalid products\n`);
    }
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(() => {
  updateProductsWithImages();
});
