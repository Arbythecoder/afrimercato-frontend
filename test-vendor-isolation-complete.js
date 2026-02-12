/**
 * COMPREHENSIVE VENDOR ISOLATION TEST
 * Tests all critical vendor data isolation endpoints
 */

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function testAPI(url, options = {}) {
  const baseURL = process.env.API_URL || 'http://localhost:8082';
  
  try {
    const response = await fetch(`${baseURL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return {
      status: response.status,
      success: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
}

async function testVendorIsolation() {
  console.log(`${colors.bold}🔐 VENDOR DATA ISOLATION TEST${colors.reset}\n`);
  
  const tests = [
    {
      name: 'Health Check',
      url: '/api/health',
      expectedStatus: 200
    },
    {
      name: 'Public Vendor List (No Auth)',
      url: '/api/vendors',
      expectedStatus: 200
    },
    {
      name: 'Slug Resolution Test', 
      url: '/api/vendors/slug/sample-accra-fresh-market',
      expectedStatus: [200, 404], // Could be 404 if vendor doesn't exist
      note: 'Should handle non-existent vendors gracefully'
    },
    {
      name: 'Vendor Products by Slug',
      url: '/api/vendor/products/sample-accra-fresh-market',
      expectedStatus: [200, 404]
    },
    {
      name: 'Dashboard Access Without Auth',
      url: '/api/vendor/dashboard',
      expectedStatus: 401,
      note: 'Should reject unauthorized access'
    },
    {
      name: 'Vendor Profile Without Auth', 
      url: '/api/vendor/profile',
      expectedStatus: 401,
      note: 'Should require authentication'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`${colors.blue}●${colors.reset} ${test.name}... `);
    
    const result = await testAPI(test.url);
    const expectedStatuses = Array.isArray(test.expectedStatus) 
      ? test.expectedStatus 
      : [test.expectedStatus];
    
    if (expectedStatuses.includes(result.status)) {
      console.log(`${colors.green}✓ PASS${colors.reset} (${result.status})`);
      passed++;
      
      if (test.note) {
        console.log(`  ${colors.yellow}Note: ${test.note}${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} (Expected: ${test.expectedStatus}, Got: ${result.status})`);
      console.log(`  ${colors.red}Error: ${result.data?.message || result.error}${colors.reset}`);
      failed++;
    }
    
    // Show data sample for successful responses
    if (result.success && result.data?.data) {
      const count = Array.isArray(result.data.data) ? result.data.data.length : 'object';
      console.log(`  ${colors.yellow}Data: ${count} items returned${colors.reset}`);
    }
  }

  console.log(`\n${colors.bold}📊 TEST RESULTS:${colors.reset}`);
  console.log(`${colors.green}✓ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${failed}${colors.reset}`);
  
  return { passed, failed };
}

async function testVendorAuth() {
  console.log(`\n${colors.bold}🔑 VENDOR AUTHENTICATION TEST${colors.reset}\n`);
  
  // Test with demo vendor credentials
  const loginData = {
    email: 'vendor@demo.com',
    password: 'password123'
  };
  
  console.log(`${colors.blue}●${colors.reset} Attempting vendor login...`);
  
  const loginResult = await testAPI('/api/vendor/login', {
    method: 'POST',
    body: JSON.stringify(loginData)
  });
  
  if (loginResult.success && loginResult.data.token) {
    console.log(`${colors.green}✓ Login successful${colors.reset}`);
    
    const token = loginResult.data.token;
    const vendorId = loginResult.data.user._id;
    
    console.log(`  Vendor ID: ${vendorId}`);
    console.log(`  Token: ${token.substring(0, 20)}...`);
    
    // Test authenticated dashboard access
    console.log(`\n${colors.blue}●${colors.reset} Testing dashboard with valid token...`);
    
    const dashboardResult = await testAPI('/api/vendor/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (dashboardResult.success) {
      console.log(`${colors.green}✓ Dashboard access successful${colors.reset}`);
      console.log(`  Data isolation working: ${dashboardResult.data.vendor?.id === vendorId ? 'YES' : 'NO'}`);
      
      // Test that vendor only sees their own data
      if (dashboardResult.data.orders) {
        console.log(`  Orders visible: ${dashboardResult.data.orders.length}`);
        console.log(`  Revenue: £${dashboardResult.data.revenue || 0}`);
      }
    } else {
      console.log(`${colors.red}✗ Dashboard access failed: ${dashboardResult.data?.message}${colors.reset}`);
    }
    
    return { token, vendorId };
  } else {
    console.log(`${colors.red}✗ Login failed: ${loginResult.data?.message}${colors.reset}`);
    console.log(`${colors.yellow}Note: Create demo vendor with: npm run seed:vendors${colors.reset}`);
    return null;
  }
}

async function testSlugResolution() {
  console.log(`\n${colors.bold}🏷️ SLUG RESOLUTION TEST${colors.reset}\n`);
  
  const slugs = [
    'sample-accra-fresh-market',
    'mama-nkechi-african-mart', 
    'nonexistent-vendor-slug'
  ];
  
  for (const slug of slugs) {
    process.stdout.write(`${colors.blue}●${colors.reset} Testing slug '${slug}'... `);
    
    const result = await testAPI(`/api/vendors/slug/${slug}`);
    
    if (result.success) {
      console.log(`${colors.green}✓ RESOLVED${colors.reset}`);
      console.log(`  Vendor: ${result.data.vendor.storeName}`);
      console.log(`  ID: ${result.data.vendor._id}`);
    } else if (result.status === 404) {
      console.log(`${colors.yellow}○ NOT FOUND${colors.reset} (Expected for test data)`);
    } else {
      console.log(`${colors.red}✗ ERROR${colors.reset}: ${result.data?.message}`);
    }
  }
}

async function main() {
  console.log(`${colors.bold}🚀 AFRIMERCATO VENDOR ISOLATION TEST SUITE${colors.reset}\n`);
  console.log(`${colors.yellow}Testing critical vendor data isolation and auth flows...${colors.reset}\n`);
  
  // Run all tests
  const isolationResults = await testVendorIsolation();
  const authResults = await testVendorAuth(); 
  await testSlugResolution();
  
  console.log(`\n${colors.bold}🏁 TEST COMPLETE${colors.reset}`);
  console.log(`${colors.yellow}Check the results above to ensure vendor data isolation is working.${colors.reset}`);
  
  if (isolationResults.failed === 0) {
    console.log(`${colors.green}✅ All isolation tests passed!${colors.reset}`);
  } else {
    console.log(`${colors.red}⚠️ Some tests failed - check vendor middleware and auth setup${colors.reset}`);
  }
}

main().catch(console.error);