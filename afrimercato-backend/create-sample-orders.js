/**
 * Create sample orders for demo purposes
 * Creates orders with different statuses: pending, confirmed, preparing, ready, out_for_delivery
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Vendor = require('./src/models/Vendor');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Sample customer names
const customerNames = [
  'John Smith', 'Emma Johnson', 'Oliver Williams', 'Sophia Brown', 'James Davis',
  'Isabella Miller', 'Liam Wilson', 'Mia Moore', 'Noah Taylor', 'Ava Anderson'
];

// Generate a random UK address
const generateAddress = () => {
  const streets = ['High Street', 'Church Road', 'Station Road', 'Main Street', 'Park Lane'];
  const cities = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'];
  const streetNumber = Math.floor(Math.random() * 200) + 1;
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const postcode = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

  return {
    street: `${streetNumber} ${street}`,
    city,
    state: 'England',
    postcode,
    country: 'United Kingdom'
  };
};

// Create orders for each vendor
const createSampleOrders = async () => {
  console.log('\n🚀 Starting Sample Orders Creation...\n');

  try {
    // Step 1: Create sample customer users first
    console.log('👥 Creating sample customer users...\n');

    const sampleCustomers = [];
    for (let i = 0; i < 5; i++) {
      const customerName = customerNames[i];
      const customerEmail = `customer${i + 1}@example.com`;

      // Check if customer already exists
      let customer = await User.findOne({ email: customerEmail });

      if (!customer) {
        customer = await User.create({
          name: customerName,
          email: customerEmail,
          password: 'Password123', // Will be hashed by User model
          role: 'customer',
          isEmailVerified: true
        });
        console.log(`  ✅ Created customer: ${customerName}`);
      } else {
        console.log(`  ℹ️  Customer exists: ${customerName}`);
      }

      sampleCustomers.push(customer);
    }

    console.log(`\n📦 Created/Found ${sampleCustomers.length} customers\n`);

    // Step 2: Find all sample vendors
    const vendors = await Vendor.find({
      storeName: {
        $in: ['Fresh Valley Farms', 'The Butcher\'s Block', 'Daily Dairy Delights']
      }
    }).populate('user');

    if (vendors.length === 0) {
      console.log('❌ No sample vendors found. Run create-sample-vendors.js first!');
      process.exit(1);
    }

    console.log(`📦 Found ${vendors.length} vendors\n`);

    // Order statuses to create
    const orderTemplates = [
      { count: 2, status: 'pending', label: 'Pending' },
      { count: 3, status: 'confirmed', label: 'Confirmed' },
      { count: 5, status: 'preparing', label: 'Preparing' },
      { count: 2, status: 'ready', label: 'Ready' },
      { count: 3, status: 'out-for-delivery', label: 'Out for Delivery' }
    ];

    let totalOrders = 0;

    for (const vendor of vendors) {
      console.log(`\n📍 Creating orders for: ${vendor.storeName}`);

      // Get vendor's products
      const products = await Product.find({ vendor: vendor._id }).limit(10);

      if (products.length === 0) {
        console.log(`  ⚠️  No products found for ${vendor.storeName}, skipping...`);
        continue;
      }

      // Create orders for each status
      for (const template of orderTemplates) {
        for (let i = 0; i < template.count; i++) {
          // Select random products (2-4 items per order)
          const itemCount = Math.floor(Math.random() * 3) + 2; // 2-4 items
          const orderItems = [];
          let subtotal = 0;

          for (let j = 0; j < itemCount; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
            const itemTotal = product.price * quantity;

            orderItems.push({
              product: product._id,
              name: product.name,
              price: product.price,
              quantity,
              unit: product.unit
            });

            subtotal += itemTotal;
          }

          const deliveryFee = 5.99;
          const total = subtotal + deliveryFee;

          // Pick a random customer from our pre-created pool
          const customer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
          const address = generateAddress();

          // Create order with proper schema
          const order = await Order.create({
            orderNumber: `AFM${Date.now()}${Math.floor(Math.random() * 1000)}`,
            vendor: vendor._id,
            customer: customer._id,
            items: orderItems,
            pricing: {
              subtotal,
              deliveryFee,
              total
            },
            deliveryAddress: {
              fullName: customer.name,
              phone: `+44-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`,
              street: address.street,
              city: address.city,
              state: address.state,
              postcode: address.postcode,
              country: address.country
            },
            status: template.status,
            payment: {
              status: template.status === 'pending' ? 'pending' : 'paid',
              method: 'card',
              transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`
            },
            notes: `Sample ${template.label} order for demo`
          });

          totalOrders++;
        }

        console.log(`  ✅ Created ${template.count} ${template.label} orders`);
      }
    }

    console.log(`\n🎉 Successfully created ${totalOrders} sample orders across all vendors!\n`);

    // Show summary
    console.log('📊 Summary:');
    console.log('  - 2 Pending orders per vendor');
    console.log('  - 3 Confirmed orders per vendor');
    console.log('  - 5 Preparing orders per vendor');
    console.log('  - 2 Ready orders per vendor');
    console.log('  - 3 Out for Delivery orders per vendor\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating orders:', error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(() => {
  createSampleOrders();
});
