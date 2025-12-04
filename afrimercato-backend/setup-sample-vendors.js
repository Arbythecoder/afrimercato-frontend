// =================================================================
// SAMPLE VENDORS SETUP SCRIPT
// =================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');

const sampleVendors = [
  {
    user: {
      name: "Fresh Foods Market",
      email: "fresh@afrihub.com",
      password: "Password123",
      phone: "+234 801 234 5678",
      role: "vendor"
    },
    vendor: {
      storeName: "Fresh Foods Market",
      description: "Premium fresh fruits and vegetables direct from local farms",
      category: "fresh-produce",
      address: {
        street: "123 Market Street",
        city: "Lagos",
        state: "Lagos State",
        postalCode: "100001",
        coordinates: {
          latitude: 6.5244,
          longitude: 3.3792
        }
      },
      phone: "+234 801 234 5678",
      bankDetails: {
        bankName: "First Bank",
        accountNumber: "1234567890",
        accountName: "John's Fresh Market Ltd"
      },
      isVerified: true,
      verifiedAt: new Date(),
      deliveryRadius: 15,
      deliveryFee: 1000,
      freeDeliveryAbove: 10000
    }
  },
  {
    user: {
      name: "Global Groceries",
      email: "global@afrihub.com",
      password: "Password123",
      phone: "+234 802 345 6789",
      role: "vendor"
    },
    vendor: {
      storeName: "Global Groceries",
      description: "Freshly baked bread, pastries, and cakes",
      category: "bakery",
      address: {
        street: "45 Baker's Avenue",
        city: "Lagos",
        state: "Lagos State",
        postalCode: "100002",
        coordinates: {
          latitude: 6.5145,
          longitude: 3.3841
        }
      },
      phone: "+234 802 345 6789",
      bankDetails: {
        bankName: "GTBank",
        accountNumber: "0987654321",
        accountName: "Sarah's Bakery Ltd"
      },
      isVerified: true,
      verifiedAt: new Date(),
      deliveryRadius: 10,
      deliveryFee: 800,
      freeDeliveryAbove: 5000
    }
  },
  {
    user: {
      name: "Quick Mart",
      email: "quick@afrihub.com",
      password: "Password123",
      phone: "+234 803 456 7890",
      role: "vendor"
    },
    vendor: {
      storeName: "Quick Mart",
      description: "Your one-stop shop for all daily needs",
      category: "groceries",
      address: {
        street: "78 Main Street",
        city: "Lagos",
        state: "Lagos State",
        postalCode: "100003",
        coordinates: {
          latitude: 6.5178,
          longitude: 3.3912
        }
      },
      phone: "+234 803 456 7890",
      bankDetails: {
        bankName: "Access Bank",
        accountNumber: "1122334455",
        accountName: "Quick Mart Ltd"
      },
      isVerified: true,
      verifiedAt: new Date(),
      deliveryRadius: 12,
      deliveryFee: 900,
      freeDeliveryAbove: 7500
    }
  },
  {
    user: {
      name: "Super Store",
      email: "super@afrihub.com",
      password: "Password123",
      phone: "+234 804 567 8901",
      role: "vendor"
    },
    vendor: {
      storeName: "Super Store",
      description: "Quality products at affordable prices",
      category: "groceries",
      address: {
        street: "15 Shopping Avenue",
        city: "Lagos",
        state: "Lagos State",
        postalCode: "100004",
        coordinates: {
          latitude: 6.5201,
          longitude: 3.3965
        }
      },
      phone: "+234 804 567 8901",
      bankDetails: {
        bankName: "Zenith Bank",
        accountNumber: "2233445566",
        accountName: "Super Store Ltd"
      },
      isVerified: true,
      verifiedAt: new Date(),
      deliveryRadius: 15,
      deliveryFee: 1000,
      freeDeliveryAbove: 8000
    }
  },
  {
    user: {
      name: "Daily Fresh",
      email: "daily@afrihub.com",
      password: "Password123",
      phone: "+234 805 678 9012",
      role: "vendor"
    },
    vendor: {
      storeName: "Daily Fresh",
      description: "Fresh produce and groceries delivered daily",
      category: "fresh-produce",
      address: {
        street: "92 Fresh Road",
        city: "Lagos",
        state: "Lagos State",
        postalCode: "100005",
        coordinates: {
          latitude: 6.5225,
          longitude: 3.4001
        }
      },
      phone: "+234 805 678 9012",
      bankDetails: {
        bankName: "UBA Bank",
        accountNumber: "3344556677",
        accountName: "Daily Fresh Ltd"
      },
      isVerified: true,
      verifiedAt: new Date(),
      deliveryRadius: 10,
      deliveryFee: 850,
      freeDeliveryAbove: 6000
    }
  }
];

async function setupSampleVendors() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create vendors
    for (const sample of sampleVendors) {
      // Create user account
      const user = await User.create(sample.user);
      console.log(`Created user: ${user.email}`);

      // Create vendor profile
      const vendor = await Vendor.create({
        ...sample.vendor,
        user: user._id
      });
      console.log(`Created vendor: ${vendor.storeName}`);
    }

    console.log('\nSample Vendors Created Successfully!');
    console.log('\nVendor Login Credentials:');
    console.log('----------------------------');
    sampleVendors.forEach(v => {
      console.log(`\nStore: ${v.vendor.storeName}`);
      console.log(`Email: ${v.user.email}`);
      console.log(`Password: ${v.user.password}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupSampleVendors();