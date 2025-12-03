/**
 * Customer Model
 * Extends User model with customer-specific fields
 * Handles shopping, orders, addresses, payment methods
 */

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Link to User account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Customer profile
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    }
  },

  // Delivery addresses
  addresses: [{
    label: {
      type: String, // 'Home', 'Work', 'Other'
      default: 'Home'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    street: {
      type: String,
      required: true
    },
    apartment: String,
    city: {
      type: String,
      required: true
    },
    state: String,
    postcode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Ireland'
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    deliveryInstructions: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Payment methods
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'paystack'],
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    // Paystack authorization details
    paystackAuthorization: {
      authorizationCode: String,
      bin: String, // First 6 digits
      last4: String, // Last 4 digits
      cardType: String, // 'visa', 'mastercard'
      bank: String,
      expiryMonth: String,
      expiryYear: String
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Shopping preferences
  preferences: {
    // Favorite vendors
    favoriteVendors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    }],

    // Favorite products
    favoriteProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],

    // Communication preferences
    notifications: {
      email: {
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: false }
      },
      sms: {
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false }
      },
      push: {
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true }
      }
    },

    // Dietary restrictions / preferences
    dietary: {
      vegetarian: Boolean,
      vegan: Boolean,
      glutenFree: Boolean,
      dairyFree: Boolean,
      halal: Boolean,
      kosher: Boolean,
      allergies: [String]
    }
  },

  // Order statistics
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    completedOrders: {
      type: Number,
      default: 0
    },
    cancelledOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date,
    firstOrderDate: Date
  },

  // Loyalty program
  loyalty: {
    points: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    pointsHistory: [{
      points: Number,
      type: {
        type: String,
        enum: ['earned', 'redeemed', 'expired']
      },
      description: String,
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Reviews and ratings given by customer
  reviews: [{
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    photos: [String],
    helpful: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Account status
  status: {
    isActive: {
      type: Boolean,
      default: true
    },
    isSuspended: {
      type: Boolean,
      default: false
    },
    suspensionReason: String,
    suspendedAt: Date,
    suspendedUntil: Date
  },

  // Metadata
  metadata: {
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'referral', 'social'],
      default: 'web'
    },
    deviceInfo: {
      platform: String,
      browser: String,
      os: String
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
customerSchema.index({ user: 1 });
customerSchema.index({ 'profile.phone': 1 });
customerSchema.index({ 'addresses.postcode': 1 });
customerSchema.index({ 'addresses.coordinates': '2dsphere' });
customerSchema.index({ 'stats.totalOrders': -1 });
customerSchema.index({ createdAt: -1 });

/**
 * Generate unique referral code
 */
customerSchema.methods.generateReferralCode = async function() {
  const code = `AF${this.user.toString().slice(-6).toUpperCase()}`;
  this.metadata.referralCode = code;
  await this.save();
  return code;
};

/**
 * Add address
 */
customerSchema.methods.addAddress = async function(addressData) {
  // If this is the first address, make it default
  if (this.addresses.length === 0) {
    addressData.isDefault = true;
  }

  // If marking as default, unset others
  if (addressData.isDefault) {
    this.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  this.addresses.push(addressData);
  await this.save();
  return this.addresses[this.addresses.length - 1];
};

/**
 * Update address
 */
customerSchema.methods.updateAddress = async function(addressId, updateData) {
  const address = this.addresses.id(addressId);

  if (!address) {
    throw new Error('Address not found');
  }

  // If marking as default, unset others
  if (updateData.isDefault) {
    this.addresses.forEach(addr => {
      if (addr._id.toString() !== addressId.toString()) {
        addr.isDefault = false;
      }
    });
  }

  Object.assign(address, updateData);
  await this.save();
  return address;
};

/**
 * Delete address
 */
customerSchema.methods.deleteAddress = async function(addressId) {
  const address = this.addresses.id(addressId);

  if (!address) {
    throw new Error('Address not found');
  }

  const wasDefault = address.isDefault;
  this.addresses.pull(addressId);

  // If deleted address was default, make first address default
  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
  }

  await this.save();
  return this.addresses;
};

/**
 * Get default address
 */
customerSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0] || null;
};

/**
 * Add payment method
 */
customerSchema.methods.addPaymentMethod = async function(paymentData) {
  // If this is the first payment method, make it default
  if (this.paymentMethods.length === 0) {
    paymentData.isDefault = true;
  }

  // If marking as default, unset others
  if (paymentData.isDefault) {
    this.paymentMethods.forEach(pm => {
      pm.isDefault = false;
    });
  }

  this.paymentMethods.push(paymentData);
  await this.save();
  return this.paymentMethods[this.paymentMethods.length - 1];
};

/**
 * Update order statistics
 */
customerSchema.methods.updateStats = async function(order) {
  this.stats.totalOrders += 1;

  if (order.status === 'delivered') {
    this.stats.completedOrders += 1;
    this.stats.totalSpent += order.pricing.total;
    this.stats.averageOrderValue = this.stats.totalSpent / this.stats.completedOrders;
  }

  if (order.status === 'cancelled') {
    this.stats.cancelledOrders += 1;
  }

  this.stats.lastOrderDate = new Date();

  if (!this.stats.firstOrderDate) {
    this.stats.firstOrderDate = new Date();
  }

  await this.save();
};

/**
 * Add loyalty points
 */
customerSchema.methods.addLoyaltyPoints = async function(points, description, orderId = null) {
  this.loyalty.points += points;

  this.loyalty.pointsHistory.push({
    points,
    type: 'earned',
    description,
    orderId,
    date: new Date()
  });

  // Update tier based on points
  if (this.loyalty.points >= 10000) {
    this.loyalty.tier = 'platinum';
  } else if (this.loyalty.points >= 5000) {
    this.loyalty.tier = 'gold';
  } else if (this.loyalty.points >= 1000) {
    this.loyalty.tier = 'silver';
  } else {
    this.loyalty.tier = 'bronze';
  }

  await this.save();
  return this.loyalty.points;
};

/**
 * Redeem loyalty points
 */
customerSchema.methods.redeemLoyaltyPoints = async function(points, description) {
  if (this.loyalty.points < points) {
    throw new Error('Insufficient loyalty points');
  }

  this.loyalty.points -= points;

  this.loyalty.pointsHistory.push({
    points: -points,
    type: 'redeemed',
    description,
    date: new Date()
  });

  await this.save();
  return this.loyalty.points;
};

/**
 * Add to favorites
 */
customerSchema.methods.addFavoriteVendor = async function(vendorId) {
  if (!this.preferences.favoriteVendors.includes(vendorId)) {
    this.preferences.favoriteVendors.push(vendorId);
    await this.save();
  }
  return this.preferences.favoriteVendors;
};

customerSchema.methods.removeFavoriteVendor = async function(vendorId) {
  this.preferences.favoriteVendors = this.preferences.favoriteVendors.filter(
    v => v.toString() !== vendorId.toString()
  );
  await this.save();
  return this.preferences.favoriteVendors;
};

customerSchema.methods.addFavoriteProduct = async function(productId) {
  if (!this.preferences.favoriteProducts.includes(productId)) {
    this.preferences.favoriteProducts.push(productId);
    await this.save();
  }
  return this.preferences.favoriteProducts;
};

customerSchema.methods.removeFavoriteProduct = async function(productId) {
  this.preferences.favoriteProducts = this.preferences.favoriteProducts.filter(
    p => p.toString() !== productId.toString()
  );
  await this.save();
  return this.preferences.favoriteProducts;
};

/**
 * Static method: Find customers by postcode/location
 */
customerSchema.statics.findByLocation = function(postcode) {
  return this.find({ 'addresses.postcode': postcode });
};

/**
 * Static method: Find top customers
 */
customerSchema.statics.findTopCustomers = function(limit = 10) {
  return this.find()
    .sort({ 'stats.totalSpent': -1 })
    .limit(limit)
    .populate('user', 'email name');
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
