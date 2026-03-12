// Debug script to test vendor auth flow and identify redirect loop source
const API_URL = 'http://localhost:5000';

async function testVendorAuthFlow() {
  console.log('=== TESTING VENDOR AUTH FLOW ===');
  
  // Test 1: Register a new vendor
  console.log('\n1. Testing vendor registration...');
  const vendorData = {
    fullName: 'Test Vendor',
    email: `vendor-test-${Date.now()}@example.com`,
    phone: '+1234567890',
    password: 'test123',
    storeName: 'Test Store',
    storeDescription: 'Test description',
    category: 'general',
    address: 'Test address'
  };
  
  try {
    const registerResponse = await fetch(`${API_URL}/api/vendor/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData)
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration response:', {
      status: registerResponse.status,
      success: registerData.success,
      hasToken: !!registerData.data?.token,
      hasVendor: !!registerData.data?.vendor,
      message: registerData.message
    });
    
    if (!registerData.success) {
      console.error('Registration failed:', registerData.message);
      return;
    }
    
    const token = registerData.data.token;
    console.log('Token:', token ? token.substring(0, 50) + '...' : 'NULL');
    
    // Test 2: Try to fetch vendor profile using the token
    console.log('\n2. Testing vendor profile fetch...');
    const profileResponse = await fetch(`${API_URL}/api/vendor/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const profileData = await profileResponse.json();
    console.log('Profile response:', {
      status: profileResponse.status,
      success: profileData.success,
      message: profileData.message,
      errorCode: profileData.errorCode
    });
    
    // Test 3: Try the /auth/me endpoint
    console.log('\n3. Testing /auth/me endpoint...');
    const meResponse = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const meData = await meResponse.json();
    console.log('Auth/me response:', {
      status: meResponse.status,
      success: meData.success,
      role: meData.data?.role,
      roles: meData.data?.roles
    });
    
    // Test 4: Try dashboard stats
    console.log('\n4. Testing vendor dashboard stats...');
    const statsResponse = await fetch(`${API_URL}/api/vendor/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const statsData = await statsResponse.json();
    console.log('Dashboard stats response:', {
      status: statsResponse.status,
      success: statsData.success,
      message: statsData.message,
      errorCode: statsData.errorCode
    });
    
    // Test 5: Check what vendor records exist in database
    console.log('\n5. Token payload (decoded):');
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log({
        id: payload.id,
        email: payload.email,
        roles: payload.roles,
        exp: new Date(payload.exp * 1000).toISOString()
      });
    } catch (e) {
      console.log('Could not decode token:', e.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run test if this is run directly
if (typeof window === 'undefined') {
  testVendorAuthFlow();
}

// Also export for browser use
if (typeof window !== 'undefined') {
  window.testVendorAuthFlow = testVendorAuthFlow;
}