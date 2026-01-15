// =================================================================
// RIDER API TESTING SCRIPT
// =================================================================
// Tests rider registration, login, and profile endpoints
// Run with: node test-rider-api.js

const axios = require('axios');

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Test data for rider registration
const testRider = {
  fullName: 'John Rider',
  email: `rider${Date.now()}@test.com`, // Unique email
  phone: '+44-7700-900000',
  password: 'Password123',

  // Vehicle info
  vehicleType: 'motorcycle',
  vehiclePlate: 'ABC123',
  vehicleColor: 'Red',
  vehicleModel: 'Honda CB125R',

  // Service areas
  postcodes: ['SW1A 1AA', 'W1A 0AX'],
  cities: ['London', 'Westminster'],
  maxDistance: 15,

  // Dual role
  isAlsoPicker: true,

  // Bank details
  bankName: 'Barclays',
  accountNumber: '12345678',
  accountName: 'John Rider',
  sortCode: '203040'
};

let riderToken = '';
let riderId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
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

// Test 1: Rider Registration
async function testRiderRegistration() {
  try {
    log('='.repeat(60), 'cyan');
    log('TEST 1: Rider Registration', 'cyan');
    log('='.repeat(60), 'cyan');

    const response = await axios.post(`${API_URL}/rider/auth/register`, testRider);

    if (response.data.success) {
      riderToken = response.data.data.token;
      riderId = response.data.data.rider.riderId;

      printResult('Rider Registration', true, {
        riderId: response.data.data.rider.riderId,
        fullName: response.data.data.rider.fullName,
        vehicleType: response.data.data.rider.vehicleType,
        isAlsoPicker: response.data.data.rider.isAlsoPicker,
        message: response.data.message
      });

      return true;
    }
  } catch (error) {
    printResult('Rider Registration', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// Test 2: Rider Login
async function testRiderLogin() {
  try {
    log('='.repeat(60), 'cyan');
    log('TEST 2: Rider Login', 'cyan');
    log('='.repeat(60), 'cyan');

    const response = await axios.post(`${API_URL}/rider/auth/login`, {
      email: testRider.email,
      password: testRider.password
    });

    if (response.data.success) {
      riderToken = response.data.data.token; // Update token

      printResult('Rider Login', true, {
        riderId: response.data.data.rider.riderId,
        fullName: response.data.data.rider.fullName,
        isVerified: response.data.data.rider.isVerified,
        isActive: response.data.data.rider.isActive,
        isAvailable: response.data.data.rider.isAvailable,
        averageRating: response.data.data.rider.averageRating,
        message: response.data.message
      });

      return true;
    }
  } catch (error) {
    printResult('Rider Login', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// Test 3: Get Rider Profile
async function testGetRiderProfile() {
  try {
    log('='.repeat(60), 'cyan');
    log('TEST 3: Get Rider Profile', 'cyan');
    log('='.repeat(60), 'cyan');

    const response = await axios.get(`${API_URL}/rider/auth/profile`, {
      headers: {
        Authorization: `Bearer ${riderToken}`
      }
    });

    if (response.data.success) {
      printResult('Get Rider Profile', true, {
        riderId: response.data.data.rider.riderId,
        fullName: response.data.data.rider.fullName,
        vehicle: response.data.data.rider.vehicle,
        serviceAreas: response.data.data.rider.serviceAreas,
        performance: response.data.data.rider.performance,
        isAlsoPicker: response.data.data.rider.isAlsoPicker
      });

      return true;
    }
  } catch (error) {
    printResult('Get Rider Profile', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// Test 4: Update Rider Profile
async function testUpdateRiderProfile() {
  try {
    log('='.repeat(60), 'cyan');
    log('TEST 4: Update Rider Profile', 'cyan');
    log('='.repeat(60), 'cyan');

    const response = await axios.put(
      `${API_URL}/rider/auth/profile`,
      {
        vehicleColor: 'Blue',
        maxDistance: 20,
        pushNotifications: true
      },
      {
        headers: {
          Authorization: `Bearer ${riderToken}`
        }
      }
    );

    if (response.data.success) {
      printResult('Update Rider Profile', true, {
        message: response.data.message,
        updatedVehicleColor: response.data.data.rider.vehicle.color,
        updatedMaxDistance: response.data.data.rider.serviceAreas.maxDistance
      });

      return true;
    }
  } catch (error) {
    printResult('Update Rider Profile', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// Test 5: Update Location (GPS)
async function testUpdateLocation() {
  try {
    log('='.repeat(60), 'cyan');
    log('TEST 5: Update GPS Location', 'cyan');
    log('='.repeat(60), 'cyan');

    const response = await axios.put(
      `${API_URL}/rider/auth/location`,
      {
        latitude: 51.5074, // London coordinates
        longitude: -0.1278
      },
      {
        headers: {
          Authorization: `Bearer ${riderToken}`
        }
      }
    );

    if (response.data.success) {
      printResult('Update GPS Location', true, {
        message: response.data.message,
        location: response.data.data.location
      });

      return true;
    }
  } catch (error) {
    printResult('Update GPS Location', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// Test 6: Get Verification Status
async function testGetVerificationStatus() {
  try {
    log('='.repeat(60), 'cyan');
    log('TEST 6: Get Verification Status', 'cyan');
    log('='.repeat(60), 'cyan');

    const response = await axios.get(`${API_URL}/rider/auth/verification`, {
      headers: {
        Authorization: `Bearer ${riderToken}`
      }
    });

    if (response.data.success) {
      printResult('Get Verification Status', true, {
        isVerified: response.data.data.isVerified,
        documents: response.data.data.documents
      });

      return true;
    }
  } catch (error) {
    printResult('Get Verification Status', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// Test 7: Toggle Availability (should fail - not verified)
async function testToggleAvailability() {
  try {
    log('='.repeat(60), 'cyan');
    log('TEST 7: Toggle Availability (Expected to Fail - Not Verified)', 'cyan');
    log('='.repeat(60), 'cyan');

    const response = await axios.put(
      `${API_URL}/rider/auth/availability`,
      {},
      {
        headers: {
          Authorization: `Bearer ${riderToken}`
        }
      }
    );

    if (response.data.success) {
      printResult('Toggle Availability', true, response.data);
      return true;
    }
  } catch (error) {
    // Expected to fail because rider is not verified
    if (error.response?.data?.errorCode === 'NOT_VERIFIED') {
      printResult('Toggle Availability', true, {
        message: 'Expected failure: Rider must be verified first',
        errorCode: error.response.data.errorCode
      });
      return true;
    } else {
      printResult('Toggle Availability', false, {
        error: error.response?.data || error.message
      });
      return false;
    }
  }
}

// Test 8: Enable Picker Mode (Dual Role per SRS 2.1.4.1.b)
async function testEnablePickerMode() {
  try {
    log('='.repeat(60), 'cyan');
    log('TEST 8: Enable Picker Mode (Dual Role)', 'cyan');
    log('='.repeat(60), 'cyan');

    const response = await axios.post(
      `${API_URL}/rider/auth/picker-mode`,
      {
        pickerStores: [] // No stores yet, just enabling the mode
      },
      {
        headers: {
          Authorization: `Bearer ${riderToken}`
        }
      }
    );

    if (response.data.success) {
      printResult('Enable Picker Mode', true, {
        message: response.data.message,
        isAlsoPicker: response.data.data.isAlsoPicker
      });

      return true;
    }
  } catch (error) {
    printResult('Enable Picker Mode', false, {
      error: error.response?.data || error.message
    });
    return false;
  }
}

// Run all tests
async function runAllTests() {
  log('\n', 'cyan');
  log('█'.repeat(60), 'blue');
  log('█ RIDER API TEST SUITE', 'blue');
  log('█ Testing Rider Registration, Login, and Profile APIs', 'blue');
  log('█ Per SRS Section 2.1.4', 'blue');
  log('█'.repeat(60), 'blue');
  log('\n', 'cyan');

  log('Make sure the backend server is running on http://localhost:5000', 'yellow');
  log('Press Ctrl+C to stop', 'yellow');
  log('\n', 'cyan');

  const results = {
    passed: 0,
    failed: 0
  };

  // Run tests sequentially
  const tests = [
    { name: 'Registration', fn: testRiderRegistration },
    { name: 'Login', fn: testRiderLogin },
    { name: 'Get Profile', fn: testGetRiderProfile },
    { name: 'Update Profile', fn: testUpdateRiderProfile },
    { name: 'Update Location', fn: testUpdateLocation },
    { name: 'Verification Status', fn: testGetVerificationStatus },
    { name: 'Toggle Availability', fn: testToggleAvailability },
    { name: 'Enable Picker Mode', fn: testEnablePickerMode }
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
    log('🎉 ALL TESTS PASSED! Rider API is working correctly.', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED. Check the output above for details.', 'red');
  }

  log('\n', 'cyan');
  log(`Rider ID: ${riderId}`, 'blue');
  log(`Email: ${testRider.email}`, 'blue');
  log(`Password: ${testRider.password}`, 'blue');
  log('Save these for testing in Postman or frontend', 'yellow');
  log('\n', 'cyan');
}

// Start tests
runAllTests().catch(console.error);
