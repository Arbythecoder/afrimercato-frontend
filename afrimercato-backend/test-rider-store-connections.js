// =================================================================
// RIDER-STORE CONNECTION TESTING SCRIPT
// =================================================================
// Tests the complete rider-store connection workflow
// Per SRS Section 2.1.4.1.a
// Run with: node test-rider-store-connections.js

const axios = require('axios');

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Test data
let riderToken = '';
let riderId = '';
let vendorToken = '';
let vendorId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Helper function to print colored messages
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to print test results
function printResult(testName, success, data = null) {
  if (success) {
    log(`✓ ${testName}`, 'green');
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  } else {
    log(`✗ ${testName}`, 'red');
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
  console.log('');
}

// =================================================================
// SETUP: Create Test Rider and Vendor
// =================================================================

// Step 1: Register a test rider
async function setupTestRider() {
  try {
    log('='.repeat(60), 'cyan');
    log('SETUP: Registering Test Rider', 'cyan');
    log('='.repeat(60), 'cyan');

    const testRider = {
      fullName: 'Test Rider Connection',
      email: `rider-connection-${Date.now()}@test.com`,
      phone: '+2348035550001',
      password: 'Password123',
      vehicleType: 'motorcycle',
      vehiclePlate: 'ABC123',
      vehicleColor: 'Red',
      vehicleModel: 'Honda CB125R',
      postcodes: ['SW1A 1AA', 'W1A 0AX'],
      cities: ['London', 'Westminster'],
      maxDistance: 15,
      isAlsoPicker: false,
      bankName: 'First Bank',
      accountNumber: '1234567890',
      accountName: 'Test Rider Connection',
      sortCode: '123456'
    };

    const response = await axios.post(`${API_URL}/rider/auth/register`, testRider);

    if (response.data.success) {
      riderToken = response.data.data.token;
      riderId = response.data.data.rider.riderId;

      printResult('Test Rider Registered', true, {
        riderId: riderId,
        fullName: response.data.data.rider.fullName,
        serviceAreas: response.data.data.rider.serviceAreas
      });

      return true;
    }
  } catch (error) {
    printResult('Test Rider Registration', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// Step 2: Login as existing vendor (or register one)
async function setupTestVendor() {
  try {
    log('='.repeat(60), 'cyan');
    log('SETUP: Using Existing Vendor (Fresh Valley Farms)', 'cyan');
    log('='.repeat(60), 'cyan');

    // Try to login as existing vendor
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'freshvalley@afrimercato.com',
      password: 'Password123'
    });

    if (response.data.success) {
      vendorToken = response.data.data.token;
      vendorId = response.data.data.user._id;

      printResult('Vendor Login Successful', true, {
        vendorId: vendorId,
        businessName: response.data.data.user.businessName,
        city: response.data.data.user.address?.city
      });

      return true;
    }
  } catch (error) {
    log('Could not login as Fresh Valley Farms. Will try creating new vendor...', 'yellow');
    return await createNewVendor();
  }
}

// Alternative: Create a new vendor if Fresh Valley doesn't exist
async function createNewVendor() {
  try {
    const testVendor = {
      name: 'Test Store Connection',
      email: `vendor-connection-${Date.now()}@test.com`,
      password: 'Password123',
      confirmPassword: 'Password123',
      role: 'vendor'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, testVendor);

    if (registerResponse.data.success) {
      vendorToken = registerResponse.data.data.token;
      const userId = registerResponse.data.data.user._id;

      // Create vendor profile
      const profileData = {
        storeName: 'Test Store Connection',
        businessName: 'Test Store Connection',
        businessType: 'individual',
        category: 'fresh-produce',
        description: 'Test store for rider connections',
        phone: '+2348035559999',
        address: {
          street: '123 Test Street',
          city: 'London',
          state: 'London',
          postcode: 'SW1A 1AA',
          country: 'United Kingdom'
        }
      };

      const profileResponse = await axios.post(`${API_URL}/vendor/profile`, profileData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });

      // Get vendorId from profile response
      vendorId = profileResponse.data.data.vendor._id || userId;

      // Manually verify the vendor in DB (for testing purposes)
      const User = require('./src/models/User');
      await User.findByIdAndUpdate(userId, {
        isVerified: true,
        verificationStatus: 'approved'
      });

      printResult('New Test Vendor Created & Verified', true, {
        vendorId: vendorId,
        businessName: profileData.businessName
      });

      return true;
    }
  } catch (error) {
    printResult('Vendor Setup', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 1: Rider Finds Nearby Stores
// =================================================================
async function testFindNearbyStores() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 1: Rider Finds Nearby Stores', 'magenta');
    log('='.repeat(60), 'magenta');

    const response = await axios.get(`${API_URL}/rider/stores/nearby`, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });

    if (response.data.success) {
      printResult('Find Nearby Stores', true, {
        storesFound: response.data.data.stores.length,
        stores: response.data.data.stores.map(s => ({
          businessName: s.businessName,
          city: s.address?.city,
          postcode: s.address?.postcode,
          connectionStatus: s.connectionStatus
        }))
      });

      return true;
    }
  } catch (error) {
    printResult('Find Nearby Stores', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 2: Rider Requests Connection with Store
// =================================================================
async function testRequestConnection() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 2: Rider Requests Connection with Store', 'magenta');
    log('='.repeat(60), 'magenta');

    const response = await axios.post(
      `${API_URL}/rider/stores/${vendorId}/connect`,
      {},
      {
        headers: { Authorization: `Bearer ${riderToken}` }
      }
    );

    if (response.data.success) {
      printResult('Connection Request Sent', true, {
        message: response.data.message,
        status: response.data.data.connection.status
      });

      return true;
    }
  } catch (error) {
    printResult('Connection Request', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 3: Vendor Views Rider Connection Requests
// =================================================================
async function testVendorViewRequests() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 3: Vendor Views Pending Rider Requests', 'magenta');
    log('='.repeat(60), 'magenta');

    const response = await axios.get(`${API_URL}/vendor/riders/requests`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });

    if (response.data.success) {
      printResult('Vendor Views Requests', true, {
        requestsFound: response.data.data.requests.length,
        requests: response.data.data.requests.map(r => ({
          riderName: r.fullName,
          riderId: r.riderId,
          vehicleType: r.vehicle?.type,
          rating: r.averageRating,
          status: r.connectionStatus
        }))
      });

      return true;
    }
  } catch (error) {
    printResult('Vendor Views Requests', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 4: Vendor Approves Rider Connection
// =================================================================
async function testVendorApproveRider() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 4: Vendor Approves Rider Connection', 'magenta');
    log('='.repeat(60), 'magenta');

    // First, get the rider's MongoDB ID
    const riderResponse = await axios.get(`${API_URL}/rider/auth/profile`, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });

    const riderMongoId = riderResponse.data.data.rider._id;

    const response = await axios.post(
      `${API_URL}/vendor/riders/${riderMongoId}/approve`,
      {},
      {
        headers: { Authorization: `Bearer ${vendorToken}` }
      }
    );

    if (response.data.success) {
      printResult('Rider Approved', true, {
        message: response.data.message,
        riderName: response.data.data.rider.fullName,
        connectionStatus: response.data.data.connectionStatus
      });

      return true;
    }
  } catch (error) {
    printResult('Approve Rider', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 5: Rider Views Connected Stores
// =================================================================
async function testRiderViewConnectedStores() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 5: Rider Views Connected Stores', 'magenta');
    log('='.repeat(60), 'magenta');

    const response = await axios.get(`${API_URL}/rider/stores/connected`, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });

    if (response.data.success) {
      printResult('Rider Views Connected Stores', true, {
        connectedStores: response.data.data.stores.length,
        stores: response.data.data.stores.map(s => ({
          businessName: s.businessName,
          city: s.address?.city,
          status: s.connectionStatus
        }))
      });

      return true;
    }
  } catch (error) {
    printResult('Rider Views Connected Stores', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 6: Vendor Views Connected Riders
// =================================================================
async function testVendorViewConnectedRiders() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 6: Vendor Views Connected Riders', 'magenta');
    log('='.repeat(60), 'magenta');

    const response = await axios.get(`${API_URL}/vendor/riders/connected`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });

    if (response.data.success) {
      printResult('Vendor Views Connected Riders', true, {
        connectedRiders: response.data.data.riders.length,
        riders: response.data.data.riders.map(r => ({
          fullName: r.fullName,
          riderId: r.riderId,
          vehicleType: r.vehicle?.type,
          status: r.connectionStatus,
          isAvailable: r.isAvailable
        }))
      });

      return true;
    }
  } catch (error) {
    printResult('Vendor Views Connected Riders', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 7: Vendor Views Available Riders (Online)
// =================================================================
async function testVendorViewAvailableRiders() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 7: Vendor Views Currently Available Riders', 'magenta');
    log('='.repeat(60), 'magenta');

    const response = await axios.get(`${API_URL}/vendor/riders/available`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });

    if (response.data.success) {
      printResult('Vendor Views Available Riders', true, {
        availableRiders: response.data.data.riders.length,
        riders: response.data.data.riders.map(r => ({
          fullName: r.fullName,
          vehicleType: r.vehicle?.type,
          currentLocation: r.currentLocation?.coordinates || 'Not set',
          isAvailable: r.isAvailable
        }))
      });

      return true;
    }
  } catch (error) {
    printResult('Vendor Views Available Riders', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 8: Rider Gets Specific Store Details
// =================================================================
async function testRiderGetStoreDetails() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 8: Rider Gets Store Details', 'magenta');
    log('='.repeat(60), 'magenta');

    const response = await axios.get(`${API_URL}/rider/stores/${vendorId}`, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });

    if (response.data.success) {
      printResult('Rider Gets Store Details', true, {
        businessName: response.data.data.store.businessName,
        category: response.data.data.store.category,
        rating: response.data.data.store.averageRating,
        address: response.data.data.store.address,
        connectionStatus: response.data.data.connectionStatus
      });

      return true;
    }
  } catch (error) {
    printResult('Rider Gets Store Details', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 9: Vendor Gets Specific Rider Details
// =================================================================
async function testVendorGetRiderDetails() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 9: Vendor Gets Rider Details', 'magenta');
    log('='.repeat(60), 'magenta');

    // Get rider's MongoDB ID
    const riderResponse = await axios.get(`${API_URL}/rider/auth/profile`, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });

    const riderMongoId = riderResponse.data.data.rider._id;

    const response = await axios.get(`${API_URL}/vendor/riders/${riderMongoId}`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });

    if (response.data.success) {
      printResult('Vendor Gets Rider Details', true, {
        fullName: response.data.data.rider.fullName,
        riderId: response.data.data.rider.riderId,
        vehicle: response.data.data.rider.vehicle,
        rating: response.data.data.rider.averageRating,
        performance: response.data.data.rider.performance,
        connectionStatus: response.data.data.connectionStatus
      });

      return true;
    }
  } catch (error) {
    printResult('Vendor Gets Rider Details', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 10: Rider Disconnects from Store
// =================================================================
async function testRiderDisconnect() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 10: Rider Disconnects from Store', 'magenta');
    log('='.repeat(60), 'magenta');

    const response = await axios.delete(`${API_URL}/rider/stores/${vendorId}/disconnect`, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });

    if (response.data.success) {
      printResult('Rider Disconnected', true, {
        message: response.data.message
      });

      return true;
    }
  } catch (error) {
    printResult('Rider Disconnect', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 11: Test Connection Request Rejection Flow
// =================================================================
async function testRejectionFlow() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 11: Test Rejection Flow', 'magenta');
    log('='.repeat(60), 'magenta');

    // Step 1: Rider requests connection again
    await axios.post(
      `${API_URL}/rider/stores/${vendorId}/connect`,
      {},
      { headers: { Authorization: `Bearer ${riderToken}` } }
    );

    log('Step 1: Connection request sent', 'cyan');

    // Step 2: Get rider's MongoDB ID
    const riderResponse = await axios.get(`${API_URL}/rider/auth/profile`, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });
    const riderMongoId = riderResponse.data.data.rider._id;

    // Step 3: Vendor rejects
    const response = await axios.post(
      `${API_URL}/vendor/riders/${riderMongoId}/reject`,
      {},
      { headers: { Authorization: `Bearer ${vendorToken}` } }
    );

    if (response.data.success) {
      printResult('Rejection Flow', true, {
        message: response.data.message
      });

      return true;
    }
  } catch (error) {
    printResult('Rejection Flow', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// TEST 12: Test Cancel Request Flow (Rider cancels pending request)
// =================================================================
async function testCancelRequestFlow() {
  try {
    log('='.repeat(60), 'magenta');
    log('TEST 12: Test Cancel Request Flow', 'magenta');
    log('='.repeat(60), 'magenta');

    // Step 1: Rider requests connection
    await axios.post(
      `${API_URL}/rider/stores/${vendorId}/connect`,
      {},
      { headers: { Authorization: `Bearer ${riderToken}` } }
    );

    log('Step 1: Connection request sent', 'cyan');

    // Step 2: Rider cancels the request
    const response = await axios.post(
      `${API_URL}/rider/stores/${vendorId}/cancel-request`,
      {},
      { headers: { Authorization: `Bearer ${riderToken}` } }
    );

    if (response.data.success) {
      printResult('Cancel Request Flow', true, {
        message: response.data.message
      });

      return true;
    }
  } catch (error) {
    printResult('Cancel Request Flow', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// =================================================================
// RUN ALL TESTS
// =================================================================
async function runAllTests() {
  log('\n', 'cyan');
  log('█'.repeat(60), 'blue');
  log('█ RIDER-STORE CONNECTION TEST SUITE', 'blue');
  log('█ Testing Store Discovery & Connection Workflow', 'blue');
  log('█ Per SRS Section 2.1.4.1.a', 'blue');
  log('█'.repeat(60), 'blue');
  log('\n', 'cyan');

  log('Make sure the backend server is running on http://localhost:5000', 'yellow');
  log('Press Ctrl+C to stop', 'yellow');
  log('\n', 'cyan');

  const results = {
    passed: 0,
    failed: 0
  };

  // Setup phase
  log('█'.repeat(60), 'cyan');
  log('█ SETUP PHASE: Creating Test Data', 'cyan');
  log('█'.repeat(60), 'cyan');
  log('', 'cyan');

  const setupTests = [
    { name: 'Setup Rider', fn: setupTestRider },
    { name: 'Setup Vendor', fn: setupTestVendor }
  ];

  for (const test of setupTests) {
    const result = await test.fn();
    if (!result) {
      log('❌ Setup failed! Cannot continue tests.', 'red');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  log('✅ Setup complete! Starting connection tests...', 'green');
  log('\n', 'cyan');

  // Main test phase
  log('█'.repeat(60), 'cyan');
  log('█ TEST PHASE: Connection Workflow', 'cyan');
  log('█'.repeat(60), 'cyan');
  log('', 'cyan');

  const tests = [
    { name: 'Find Nearby Stores', fn: testFindNearbyStores },
    { name: 'Request Connection', fn: testRequestConnection },
    { name: 'Vendor View Requests', fn: testVendorViewRequests },
    { name: 'Vendor Approve Rider', fn: testVendorApproveRider },
    { name: 'Rider View Connected Stores', fn: testRiderViewConnectedStores },
    { name: 'Vendor View Connected Riders', fn: testVendorViewConnectedRiders },
    { name: 'Vendor View Available Riders', fn: testVendorViewAvailableRiders },
    { name: 'Rider Get Store Details', fn: testRiderGetStoreDetails },
    { name: 'Vendor Get Rider Details', fn: testVendorGetRiderDetails },
    { name: 'Rider Disconnect', fn: testRiderDisconnect },
    { name: 'Test Rejection Flow', fn: testRejectionFlow },
    { name: 'Test Cancel Request', fn: testCancelRequestFlow }
  ];

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }

    // Wait 500ms between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  log('\n', 'cyan');
  log('='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total Tests: ${results.passed + results.failed}`, 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log('='.repeat(60), 'cyan');
  log('\n', 'cyan');

  if (results.failed === 0) {
    log('🎉 ALL TESTS PASSED! Rider-Store connection system is working correctly.', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED. Check the output above for details.', 'red');
  }

  log('\n', 'cyan');
  log('Test Credentials:', 'blue');
  log(`Rider ID: ${riderId}`, 'blue');
  log(`Vendor ID: ${vendorId}`, 'blue');
  log('\n', 'cyan');
}

// Start tests
runAllTests().catch(console.error);
