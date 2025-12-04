// =================================================================
// ADD COORDINATES TO UK VENDORS
// =================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('./src/models/Vendor');

// UK Cities with coordinates
const ukCityCoordinates = {
  'London': { latitude: 51.5074, longitude: -0.1278 },
  'Birmingham': { latitude: 52.4862, longitude: -1.8904 },
  'Manchester': { latitude: 53.4808, longitude: -2.2426 },
  'Leeds': { latitude: 53.8008, longitude: -1.5491 },
  'Liverpool': { latitude: 53.4084, longitude: -2.9916 },
  'Bristol': { latitude: 51.4545, longitude: -2.5879 },
  'Sheffield': { latitude: 53.3811, longitude: -1.4701 },
  'Newcastle': { latitude: 54.9783, longitude: -1.6178 },
  'Nottingham': { latitude: 52.9548, longitude: -1.1581 },
  'Leicester': { latitude: 52.6369, longitude: -1.1398 },
  'Edinburgh': { latitude: 55.9533, longitude: -3.1883 },
  'Glasgow': { latitude: 55.8642, longitude: -4.2518 },
  'Cardiff': { latitude: 51.4816, longitude: -3.1791 },
  'Belfast': { latitude: 54.5973, longitude: -5.9301 },
  'Southampton': { latitude: 50.9097, longitude: -1.4044 },
  'Portsmouth': { latitude: 50.8198, longitude: -1.0880 },
  'Coventry': { latitude: 52.4068, longitude: -1.5197 },
  'Reading': { latitude: 51.4543, longitude: -0.9781 },
  'Oxford': { latitude: 51.7520, longitude: -1.2577 },
  'Cambridge': { latitude: 52.2053, longitude: 0.1218 }
};

async function addCoordinatesToVendors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB');

    // Get all vendors without coordinates
    const vendorsWithoutCoords = await Vendor.find({
      'address.coordinates.latitude': { $exists: false }
    });

    console.log(`\n🔍 Found ${vendorsWithoutCoords.length} vendors without coordinates\n`);

    let updated = 0;
    let skipped = 0;

    for (const vendor of vendorsWithoutCoords) {
      const city = vendor.address?.city;

      if (!city) {
        console.log(`⚠️  ${vendor.storeName}: No city found`);
        skipped++;
        continue;
      }

      // Try to match city to coordinates
      let coords = null;

      // Exact match
      if (ukCityCoordinates[city]) {
        coords = ukCityCoordinates[city];
      }
      // Case-insensitive match
      else {
        const cityKey = Object.keys(ukCityCoordinates).find(
          key => key.toLowerCase() === city.toLowerCase()
        );
        if (cityKey) {
          coords = ukCityCoordinates[cityKey];
        }
      }

      if (coords) {
        // Add small random offset to spread vendors across the city
        const latOffset = (Math.random() - 0.5) * 0.05; // ±0.025 degrees (~2-3km)
        const lngOffset = (Math.random() - 0.5) * 0.05;

        vendor.address.coordinates = {
          latitude: coords.latitude + latOffset,
          longitude: coords.longitude + lngOffset
        };

        await vendor.save();
        console.log(`✅ ${vendor.storeName} (${city}): [${vendor.address.coordinates.latitude.toFixed(4)}, ${vendor.address.coordinates.longitude.toFixed(4)}]`);
        updated++;
      } else {
        console.log(`⚠️  ${vendor.storeName}: City "${city}" not in UK list`);
        skipped++;
      }
    }

    console.log(`\n✅ Updated: ${updated} vendors`);
    console.log(`⚠️  Skipped: ${skipped} vendors`);

    // Verify
    const withCoords = await Vendor.countDocuments({
      'address.coordinates.latitude': { $exists: true }
    });

    console.log(`\n📊 Total vendors with coordinates: ${withCoords}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCoordinatesToVendors();
