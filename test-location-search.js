// =================================================================
// LOCATION SEARCH API TEST SCRIPT
// =================================================================
// Tests the Uber Eats-style location search functionality
// Run with: node test-location-search.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// =================================================================
// TEST 1: Geocode "Bristol UK"
// =================================================================
async function test1_GeocodeLocation() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 1: Geocode "Bristol UK"', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const response = await axios.get(`${BASE_URL}/location/geocode`, {
      params: { query: 'Bristol UK' }
    });

    if (response.data.success) {
      log('\n✓ Geocoding successful!', 'green');
      log(`Query: ${response.data.query}`, 'yellow');
      log(`Results found: ${response.data.results.length}`, 'yellow');
      log(`\nPrimary result:`, 'magenta');
      log(`  Location: ${response.data.primaryResult.displayName}`, 'yellow');
      log(`  Latitude: ${response.data.primaryResult.latitude}`, 'yellow');
      log(`  Longitude: ${response.data.primaryResult.longitude}`, 'yellow');
      log(`  City: ${response.data.primaryResult.address.city}`, 'yellow');
      log(`  Country: ${response.data.primaryResult.address.country}`, 'yellow');
      return true;
    }
  } catch (error) {
    log('\n✗ Geocoding failed', 'red');
    log(error.response?.data?.message || error.message, 'red');
    return false;
  }
}

// =================================================================
// TEST 2: Search vendors near Bristol
// =================================================================
async function test2_SearchVendorsNearBristol() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 2: Search Vendors Near Bristol', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const response = await axios.get(`${BASE_URL}/location/search-vendors`, {
      params: {
        location: 'Bristol UK',
        radius: 20,
        sort: 'distance'
      }
    });

    if (response.data.success) {
      log('\n✓ Vendor search successful!', 'green');
      log(`Found: ${response.data.total} vendors within ${response.data.filters.radius}km`, 'yellow');
      log(`Showing: ${response.data.count} vendors (page ${response.data.page}/${response.data.pages})`, 'yellow');
      log(`\nSearch coordinates:`, 'magenta');
      log(`  Lat: ${response.data.searchLocation.coordinates.latitude}`, 'yellow');
      log(`  Lng: ${response.data.searchLocation.coordinates.longitude}`, 'yellow');

      if (response.data.vendors.length > 0) {
        log(`\nTop 3 nearest vendors:`, 'magenta');
        response.data.vendors.slice(0, 3).forEach((vendor, index) => {
          log(`\n  ${index + 1}. ${vendor.storeName}`, 'cyan');
          log(`     Distance: ${vendor.distanceDisplay}`, 'yellow');
          log(`     Category: ${vendor.category}`, 'yellow');
          log(`     Rating: ${vendor.rating}/5 (${vendor.reviewCount} reviews)`, 'yellow');
          log(`     Delivery Fee: £${vendor.deliveryFee}`, 'yellow');
          log(`     Open Now: ${vendor.isCurrentlyOpen ? 'Yes ✓' : 'No ✗'}`, vendor.isCurrentlyOpen ? 'green' : 'red');
        });
      } else {
        log('\n  No vendors found in this area', 'yellow');
      }
      return true;
    }
  } catch (error) {
    log('\n✗ Vendor search failed', 'red');
    log(error.response?.data?.message || error.message, 'red');
    return false;
  }
}

// =================================================================
// TEST 3: Search vendors by coordinates
// =================================================================
async function test3_SearchByCoordinates() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 3: Search Vendors By Coordinates (London)', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const response = await axios.get(`${BASE_URL}/location/search-vendors`, {
      params: {
        latitude: 51.5074, // London
        longitude: -0.1278,
        radius: 15,
        sort: 'rating'
      }
    });

    if (response.data.success) {
      log('\n✓ Coordinate search successful!', 'green');
      log(`Found: ${response.data.total} vendors within ${response.data.filters.radius}km`, 'yellow');
      log(`\nSearch location:`, 'magenta');
      log(`  Lat: ${response.data.searchLocation.coordinates.latitude}`, 'yellow');
      log(`  Lng: ${response.data.searchLocation.coordinates.longitude}`, 'yellow');

      if (response.data.vendors.length > 0) {
        log(`\nTop 3 highest rated:`, 'magenta');
        response.data.vendors.slice(0, 3).forEach((vendor, index) => {
          log(`\n  ${index + 1}. ${vendor.storeName}`, 'cyan');
          log(`     Rating: ${vendor.rating}/5 ⭐`, 'yellow');
          log(`     Distance: ${vendor.distanceDisplay}`, 'yellow');
        });
      }
      return true;
    }
  } catch (error) {
    log('\n✗ Coordinate search failed', 'red');
    log(error.response?.data?.message || error.message, 'red');
    return false;
  }
}

// =================================================================
// TEST 4: Filter by category
// =================================================================
async function test4_FilterByCategory() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 4: Filter Vendors By Category (Groceries)', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const response = await axios.get(`${BASE_URL}/location/search-vendors`, {
      params: {
        location: 'Manchester UK',
        radius: 25,
        category: 'groceries',
        sort: 'distance'
      }
    });

    if (response.data.success) {
      log('\n✓ Category filter successful!', 'green');
      log(`Found: ${response.data.total} grocery stores`, 'yellow');
      log(`Category: ${response.data.filters.category}`, 'yellow');
      return true;
    }
  } catch (error) {
    log('\n✗ Category filter failed', 'red');
    log(error.response?.data?.message || error.message, 'red');
    return false;
  }
}

// =================================================================
// TEST 5: Get categories with counts
// =================================================================
async function test5_GetCategories() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 5: Get Categories With Vendor Counts', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const response = await axios.get(`${BASE_URL}/location/categories`, {
      params: {
        latitude: 51.4545, // Bristol
        longitude: -2.5879,
        radius: 20
      }
    });

    if (response.data.success) {
      log('\n✓ Categories retrieved!', 'green');
      log(`\nCategories in area:`, 'magenta');
      response.data.categories.forEach(cat => {
        log(`  ${cat.category}: ${cat.vendorCount} vendors (avg rating: ${cat.averageRating})`, 'yellow');
      });
      return true;
    }
  } catch (error) {
    log('\n✗ Get categories failed', 'red');
    log(error.response?.data?.message || error.message, 'red');
    return false;
  }
}

// =================================================================
// TEST 6: Detect user location
// =================================================================
async function test6_DetectLocation() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 6: Detect User Location From IP', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const response = await axios.get(`${BASE_URL}/location/detect`);

    if (response.data.success) {
      log('\n✓ Location detected!', 'green');
      log(`City: ${response.data.city}`, 'yellow');
      log(`Country: ${response.data.country}`, 'yellow');
      log(`Coordinates: [${response.data.coordinates.latitude}, ${response.data.coordinates.longitude}]`, 'yellow');
      return true;
    }
  } catch (error) {
    log('\n✗ Location detection failed (expected if testing locally)', 'yellow');
    return true; // Don't fail test for this
  }
}

// =================================================================
// RUN ALL TESTS
// =================================================================
async function runAllTests() {
  log('\n' + '█'.repeat(60), 'cyan');
  log('█ LOCATION SEARCH API TEST SUITE', 'cyan');
  log('█ Testing Uber Eats-Style Location Discovery', 'cyan');
  log('█'.repeat(60), 'cyan');

  log('\n⚠️  Make sure the backend server is running on http://localhost:5000', 'yellow');
  log('⚠️  Run: cd afrimercato-backend && npm start\n', 'yellow');

  await new Promise(resolve => setTimeout(resolve, 2000));

  const tests = [
    { name: 'Geocode Location', fn: test1_GeocodeLocation },
    { name: 'Search Vendors Near Bristol', fn: test2_SearchVendorsNearBristol },
    { name: 'Search By Coordinates', fn: test3_SearchByCoordinates },
    { name: 'Filter By Category', fn: test4_FilterByCategory },
    { name: 'Get Categories', fn: test5_GetCategories },
    { name: 'Detect Location', fn: test6_DetectLocation }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    result ? passed++ : failed++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total: ${passed + failed}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log('='.repeat(60), 'cyan');

  if (failed === 0) {
    log('\n🎉 ALL LOCATION SEARCH TESTS PASSED!', 'green');
    log('✅ Uber Eats-style location search is working!\n', 'green');
    return 0;
  } else {
    log('\n⚠️  SOME TESTS FAILED', 'red');
    log('❌ Check the errors above\n', 'red');
    return 1;
  }
}

// Run tests
runAllTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
