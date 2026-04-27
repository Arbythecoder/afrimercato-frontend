// =================================================================
// TEST DEPLOYMENT - Verify Backend is Working
// =================================================================
// This script tests the deployed backend to ensure everything works

const API_URL = 'https://afrimercato-backend.fly.dev/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper to log with colors
const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Test data
const testVendor = {
  name: 'Test Vendor QA',
  email: `vendor.qa.${Date.now()}@test.com`,
  password: 'Password123',
  confirmPassword: 'Password123',
  role: 'vendor'
};

const testCustomer = {
  name: 'Test Customer QA',
  email: `customer.qa.${Date.now()}@test.com`,
  password: 'Password123',
  confirmPassword: 'Password123',
  role: 'customer'
};

async function testHealthCheck() {
  log.info('Testing health check endpoint...');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();

    if (response.ok && data.mongodb === 'Connected') {
      log.success('Health check passed - MongoDB connected!');
      return true;
    } else {
      log.error(`Health check failed: MongoDB status = ${data.mongodb}`);
      return false;
    }
  } catch (error) {
    log.error(`Health check error: ${error.message}`);
    return false;
  }
}

async function testVendorRegistration() {
  log.info('Testing vendor registration...');
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testVendor)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log.success('Vendor registration successful!');
      console.log('Vendor ID:', data.userId);
      console.log('Token received:', data.token ? 'Yes' : 'No');
      return { success: true, data };
    } else {
      log.error(`Vendor registration failed: ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error) {
    log.error(`Vendor registration error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testCustomerRegistration() {
  log.info('Testing customer registration...');
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCustomer)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log.success('Customer registration successful!');
      console.log('Customer ID:', data.userId);
      console.log('Token received:', data.token ? 'Yes' : 'No');
      return { success: true, data };
    } else {
      log.error(`Customer registration failed: ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error) {
    log.error(`Customer registration error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testLogin(email, password, role) {
  log.info(`Testing ${role} login...`);
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log.success(`${role} login successful!`);
      return { success: true, token: data.token, userId: data.userId };
    } else {
      log.error(`${role} login failed: ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error) {
    log.error(`${role} login error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 AFRIMERCATO DEPLOYMENT TEST SUITE');
  console.log('='.repeat(60) + '\n');

  // Test 1: Health Check
  console.log('\n📊 Test 1: Health Check');
  console.log('-'.repeat(60));
  const healthOk = await testHealthCheck();

  if (!healthOk) {
    log.error('Health check failed - aborting tests');
    process.exit(1);
  }

  // Test 2: Vendor Registration
  console.log('\n👨‍💼 Test 2: Vendor Registration');
  console.log('-'.repeat(60));
  const vendorReg = await testVendorRegistration();

  // Test 3: Customer Registration
  console.log('\n👤 Test 3: Customer Registration');
  console.log('-'.repeat(60));
  const customerReg = await testCustomerRegistration();

  // Test 4: Vendor Login
  if (vendorReg.success) {
    console.log('\n🔐 Test 4: Vendor Login');
    console.log('-'.repeat(60));
    await testLogin(testVendor.email, testVendor.password, 'Vendor');
  }

  // Test 5: Customer Login
  if (customerReg.success) {
    console.log('\n🔐 Test 5: Customer Login');
    console.log('-'.repeat(60));
    await testLogin(testCustomer.email, testCustomer.password, 'Customer');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📝 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Health Check: ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Vendor Registration: ${vendorReg.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Customer Registration: ${customerReg.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60) + '\n');

  if (healthOk && vendorReg.success && customerReg.success) {
    log.success('ALL TESTS PASSED! 🎉');
    log.info('QA team can start testing with the credentials above');
  } else {
    log.warning('Some tests failed - check the details above');
  }
}

// Run the tests
runAllTests().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
