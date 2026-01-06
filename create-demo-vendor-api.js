/**
 * CREATE DEMO VENDOR VIA API
 * Creates a demo vendor using the Railway production API
 */

const API_BASE = 'https://afrimercato-backend-production-0329.up.railway.app/api';

// Sample vendor data
const vendor = {
  name: 'Demo Vendor Store',
  email: 'demo@afrimercato.com',
  password: 'Password123',
  confirmPassword: 'Password123',
  role: 'vendor'
};

const vendorProfile = {
  storeName: 'Demo Fresh Market',
  category: 'fresh-produce',
  description: 'Fresh organic produce and groceries delivered to your doorstep. Quality guaranteed!',
  phone: '+447911123456',
  address: {
    street: '123 Market Street',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom'
  }
};

const sampleProducts = [
  {
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes grown without pesticides. Perfect for salads and cooking.',
    category: 'vegetables',
    price: 2.99,
    unit: 'kg',
    stock: 150,
    lowStockThreshold: 20,
    inStock: true,
    isActive: true
  },
  {
    name: 'Fresh Carrots',
    description: 'Crunchy orange carrots packed with vitamins. Great for cooking and snacking.',
    category: 'vegetables',
    price: 1.49,
    unit: 'kg',
    stock: 200,
    lowStockThreshold: 30,
    inStock: true,
    isActive: true
  },
  {
    name: 'Whole Chicken',
    description: 'Fresh whole chicken, farm-raised and hormone-free.',
    category: 'meat',
    price: 8.99,
    unit: 'kg',
    stock: 50,
    lowStockThreshold: 10,
    inStock: true,
    isActive: true
  },
  {
    name: 'Fresh Milk',
    description: 'Fresh full-fat milk, delivered daily from local farms.',
    category: 'dairy',
    price: 1.29,
    unit: 'liter',
    stock: 100,
    lowStockThreshold: 15,
    inStock: true,
    isActive: true
  }
];

async function createDemoVendor() {
  try {
    console.log('🚀 Creating demo vendor account...\n');

    // Step 1: Register vendor
    console.log('📝 Step 1: Registering vendor...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor)
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      console.error('❌ Registration failed:', registerData.message);
      if (registerData.message.includes('already exists')) {
        console.log('✅ Vendor account already exists, attempting login...');
        return await loginAndSetup();
      }
      throw new Error(registerData.message);
    }

    const token = registerData.data.token;
    console.log('✅ Vendor registered successfully!');
    console.log(`📧 Email: ${vendor.email}`);
    console.log(`🔑 Password: ${vendor.password}\n`);

    // Step 2: Create vendor profile
    console.log('📝 Step 2: Creating vendor profile...');
    const profileResponse = await fetch(`${API_BASE}/vendor/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(vendorProfile)
    });

    const profileData = await profileResponse.json();
    if (!profileResponse.ok) {
      console.error('❌ Profile creation failed:', profileData.message);
      throw new Error(profileData.message);
    }
    console.log('✅ Vendor profile created!\n');

    // Step 3: Create products
    console.log('📝 Step 3: Creating sample products...');
    for (const product of sampleProducts) {
      const productResponse = await fetch(`${API_BASE}/vendor/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      const productData = await productResponse.json();
      if (productResponse.ok) {
        console.log(`  ✅ Created: ${product.name}`);
      } else {
        console.log(`  ❌ Failed: ${product.name} - ${productData.message}`);
      }
    }

    console.log('\n🎉 Demo vendor setup complete!');
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${vendor.email}`);
    console.log(`   Password: ${vendor.password}`);
    console.log('\n🌐 Access the app at: http://localhost:5173');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Tips:');
    console.log('   1. Make sure the Railway backend is running');
    console.log('   2. Check your internet connection');
    console.log('   3. Try again in a few moments');
  }
}

async function loginAndSetup() {
  try {
    // Login with existing credentials
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: vendor.email, password: vendor.password })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginData.message);
      console.log('\n💡 The vendor account exists but password might be different.');
      console.log('   Try logging in with: demo@afrimercato.com / Password123');
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Logged in successfully!\n');

    // Check if profile exists
    const profileCheckResponse = await fetch(`${API_BASE}/vendor/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!profileCheckResponse.ok) {
      // Create profile
      console.log('📝 Creating vendor profile...');
      const profileResponse = await fetch(`${API_BASE}/vendor/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vendorProfile)
      });

      if (profileResponse.ok) {
        console.log('✅ Vendor profile created!\n');
      }
    }

    // Create products if they don't exist
    console.log('📝 Creating sample products...');
    for (const product of sampleProducts) {
      const productResponse = await fetch(`${API_BASE}/vendor/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      if (productResponse.ok) {
        console.log(`  ✅ Created: ${product.name}`);
      }
    }

    console.log('\n🎉 Demo vendor setup complete!');
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${vendor.email}`);
    console.log(`   Password: ${vendor.password}`);
    console.log('\n🌐 Access the app at: http://localhost:5173');

  } catch (error) {
    console.error('\n❌ Error during login:', error.message);
  }
}

// Run the script
createDemoVendor();
