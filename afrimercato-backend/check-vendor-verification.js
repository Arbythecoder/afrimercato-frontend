// =================================================================
// CHECK VENDOR VERIFICATION STATUS
// =================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('./src/models/Vendor');

async function checkVendors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB\n');

    // Check vendors with coordinates
    const vendorsWithCoords = await Vendor.find({
      'address.coordinates.latitude': { $exists: true }
    }).select('storeName isActive isVerified address.city address.coordinates').lean();

    console.log(`Total vendors with coordinates: ${vendorsWithCoords.length}\n`);

    vendorsWithCoords.forEach(v => {
      console.log(`${v.storeName} (${v.address.city})`);
      console.log(`  - isActive: ${v.isActive}`);
      console.log(`  - isVerified: ${v.isVerified}`);
      console.log(`  - Coords: [${v.address.coordinates.latitude.toFixed(4)}, ${v.address.coordinates.longitude.toFixed(4)}]`);
      console.log('');
    });

    // Check how many meet all criteria
    const searchableVendors = await Vendor.find({
      isActive: true,
      isVerified: true,
      'address.coordinates.latitude': { $exists: true },
      'address.coordinates.longitude': { $exists: true }
    }).select('storeName address.city').lean();

    console.log(`\n✅ Vendors meeting search criteria (active + verified + coords): ${searchableVendors.length}`);
    searchableVendors.forEach(v => console.log(`  - ${v.storeName} (${v.address.city})`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkVendors();
