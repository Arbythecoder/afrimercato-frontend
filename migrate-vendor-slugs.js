/**
 * VENDOR SLUG MIGRATION
 * 
 * Adds slugs to existing vendors in the database.
 * Run this after deploying the updated Vendor model.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Helper function to generate slug from store name
function generateSlug(storeName) {
  return storeName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Migration function
async function migrateVendorSlugs() {
  await connectDB();
  
  console.log('🔄 Starting vendor slug migration...\n');
  
  try {
    // Get the Vendor model (make sure it includes the slug field)
    const Vendor = mongoose.model('Vendor');
    
    // Find all vendors without slugs
    const vendorsWithoutSlugs = await Vendor.find({ 
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });
    
    console.log(`📊 Found ${vendorsWithoutSlugs.length} vendors without slugs`);
    
    if (vendorsWithoutSlugs.length === 0) {
      console.log('✅ All vendors already have slugs!');
      return;
    }
    
    let updated = 0;
    let skipped = 0;
    const errors = [];
    
    for (const vendor of vendorsWithoutSlugs) {
      try {
        if (!vendor.storeName) {
          console.log(`⚠️  Skipping vendor ${vendor._id}: No store name`);
          skipped++;
          continue;
        }
        
        let baseSlug = generateSlug(vendor.storeName);
        let slugToTry = baseSlug;
        let counter = 1;
        
        // Ensure slug uniqueness
        while (await Vendor.findOne({ slug: slugToTry, _id: { $ne: vendor._id } })) {
          slugToTry = `${baseSlug}-${counter}`;
          counter++;
        }
        
        // Update the vendor
        vendor.slug = slugToTry;
        await vendor.save();
        
        console.log(`✅ ${vendor.storeName} → "${slugToTry}"`);
        updated++;
        
      } catch (error) {
        const errorMsg = `Failed to update ${vendor.storeName}: ${error.message}`;
        console.log(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    console.log(`\n📋 Migration Summary:`);
    console.log(`   ✅ Updated: ${updated} vendors`);
    console.log(`   ⚠️  Skipped: ${skipped} vendors`);
    console.log(`   ❌ Errors: ${errors.length} vendors`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Error Details:`);
      errors.forEach(error => console.log(`   ${error}`));
    }
    
    console.log('\n🎉 Slug migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('📌 Database connection closed');
  }
}

// Test slug generation
function testSlugGeneration() {
  console.log('🧪 Testing slug generation...\n');
  
  const testNames = [
    'Mama Nkechi African Mart',
    'Sahara Foods & Spices',
    'AfroTaste Groceries',
    'Accra Fresh Market',
    'The Nigerian Store Ltd.',
    'Spice World (Birmingham)',
    'Fresh & Tasty Foods'
  ];
  
  testNames.forEach(name => {
    const slug = generateSlug(name);
    console.log(`"${name}" → "${slug}"`);
  });
  
  console.log('\n✅ Slug generation test completed!');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    testSlugGeneration();
    return;
  }
  
  if (args.includes('--dry-run')) {
    console.log('🧪 DRY RUN MODE - No changes will be made\n');
    // Add dry run logic here if needed
  }
  
  try {
    await migrateVendorSlugs();
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateSlug, migrateVendorSlugs };