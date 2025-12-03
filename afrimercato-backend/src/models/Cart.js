/**
 * Cart Model
 * Manages customer shopping cart
 * Handles item management, pricing, and checkout preparation
 */

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  // Customer who owns this cart
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true,
    index: true
  },

  // Cart items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    // Snapshot of product details at time of adding to cart
    productSnapshot: {
      name: String,
      image: String,
      unit: String,
      inStock: Boolean
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Pricing summary
  pricing: {
    subtotal: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    serviceFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },

  // Applied discount/promo codes
  appliedCoupons: [{
    code: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    discountValue: Number,
    appliedAmount: Number,
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Delivery details for pricing calculation
  deliveryAddress: {
    postcode: String,
    city: String,
    coordinates: {
      type: [Number] // [longitude, latitude]
    }
  },

  // Cart status
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted'],
    default: 'active'
  },

  // Cart expiry (for abandoned cart recovery)
  expiresAt: {
    type: Date,
    index: true
  },

  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
cartSchema.index({ customer: 1, status: 1 });
cartSchema.index({ expiresAt: 1 });
cartSchema.index({ 'items.product': 1 });

/**
 * Add item to cart
 */
cartSchema.methods.addItem = async function(productData) {
  const { product, vendor, quantity, price, productSnapshot } = productData;

  // Check if product already in cart
  const existingItem = this.items.find(
    item => item.product.toString() === product.toString()
  );

  if (existingItem) {
    // Update quantity
    existingItem.quantity += quantity;
    existingItem.price = price; // Update to latest price
    existingItem.productSnapshot = productSnapshot;
    existingItem.addedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      product,
      vendor,
      quantity,
      price,
      productSnapshot,
      addedAt: new Date()
    });
  }

  // Recalculate pricing
  await this.calculatePricing();

  // Reset expiry
  this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await this.save();
  return this;
};

/**
 * Update item quantity
 */
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString()
  );

  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0
    return this.removeItem(productId);
  }

  item.quantity = quantity;

  await this.calculatePricing();
  await this.save();
  return this;
};

/**
 * Remove item from cart
 */
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );

  await this.calculatePricing();
  await this.save();
  return this;
};

/**
 * Clear all items from cart
 */
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.pricing = {
    subtotal: 0,
    deliveryFee: 0,
    serviceFee: 0,
    tax: 0,
    discount: 0,
    total: 0
  };
  this.appliedCoupons = [];
  await this.save();
  return this;
};

/**
 * Calculate pricing
 */
cartSchema.methods.calculatePricing = async function() {
  // Calculate subtotal
  const subtotal = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  this.pricing.subtotal = subtotal;

  // Calculate delivery fee (based on delivery address if set)
  // For now, use flat rate per vendor
  const uniqueVendors = [...new Set(this.items.map(item => item.vendor.toString()))];
  const deliveryFeePerVendor = 3.50; // €3.50 per vendor
  this.pricing.deliveryFee = uniqueVendors.length * deliveryFeePerVendor;

  // Calculate service fee (2.5% of subtotal)
  this.pricing.serviceFee = subtotal * 0.025;

  // Calculate tax (VAT 23% in Ireland - but included in product prices)
  // For transparency, we can show it separately
  this.pricing.tax = 0; // Already included in prices

  // Apply discount from coupons
  let discount = 0;
  for (const coupon of this.appliedCoupons) {
    if (coupon.discountType === 'percentage') {
      discount += subtotal * (coupon.discountValue / 100);
    } else {
      discount += coupon.discountValue;
    }
  }
  this.pricing.discount = Math.min(discount, subtotal); // Can't discount more than subtotal

  // Calculate total
  this.pricing.total = Math.max(
    subtotal + this.pricing.deliveryFee + this.pricing.serviceFee - this.pricing.discount,
    0
  );

  return this.pricing;
};

/**
 * Apply coupon/promo code
 */
cartSchema.methods.applyCoupon = async function(couponCode, couponData) {
  // Check if coupon already applied
  if (this.appliedCoupons.find(c => c.code === couponCode)) {
    throw new Error('Coupon already applied');
  }

  const { discountType, discountValue } = couponData;

  let appliedAmount = 0;
  if (discountType === 'percentage') {
    appliedAmount = this.pricing.subtotal * (discountValue / 100);
  } else {
    appliedAmount = discountValue;
  }

  this.appliedCoupons.push({
    code: couponCode,
    discountType,
    discountValue,
    appliedAmount,
    appliedAt: new Date()
  });

  await this.calculatePricing();
  await this.save();
  return this;
};

/**
 * Remove coupon
 */
cartSchema.methods.removeCoupon = async function(couponCode) {
  this.appliedCoupons = this.appliedCoupons.filter(c => c.code !== couponCode);
  await this.calculatePricing();
  await this.save();
  return this;
};

/**
 * Set delivery address for pricing calculation
 */
cartSchema.methods.setDeliveryAddress = async function(addressData) {
  this.deliveryAddress = {
    postcode: addressData.postcode,
    city: addressData.city,
    coordinates: addressData.coordinates
  };

  // Recalculate delivery fee based on address
  await this.calculatePricing();
  await this.save();
  return this;
};

/**
 * Check if cart is empty
 */
cartSchema.methods.isEmpty = function() {
  return this.items.length === 0;
};

/**
 * Get total item count
 */
cartSchema.methods.getTotalItems = function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Get vendors in cart
 */
cartSchema.methods.getVendors = function() {
  const vendorIds = [...new Set(this.items.map(item => item.vendor.toString()))];
  return vendorIds;
};

/**
 * Group items by vendor (for multi-vendor checkout)
 */
cartSchema.methods.groupByVendor = function() {
  const grouped = {};

  this.items.forEach(item => {
    const vendorId = item.vendor.toString();

    if (!grouped[vendorId]) {
      grouped[vendorId] = {
        vendor: item.vendor,
        items: [],
        subtotal: 0
      };
    }

    grouped[vendorId].items.push(item);
    grouped[vendorId].subtotal += item.price * item.quantity;
  });

  return Object.values(grouped);
};

/**
 * Mark cart as abandoned
 */
cartSchema.methods.markAbandoned = async function() {
  this.status = 'abandoned';
  await this.save();
  return this;
};

/**
 * Mark cart as converted to order
 */
cartSchema.methods.markConverted = async function() {
  this.status = 'converted';
  await this.save();
  return this;
};

/**
 * Static method: Find abandoned carts
 */
cartSchema.statics.findAbandoned = function(hoursSinceUpdate = 24) {
  const cutoffDate = new Date(Date.now() - hoursSinceUpdate * 60 * 60 * 1000);

  return this.find({
    status: 'active',
    'items.0': { $exists: true }, // Has items
    lastUpdated: { $lt: cutoffDate }
  }).populate('customer', 'user');
};

/**
 * Static method: Find expired carts
 */
cartSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    expiresAt: { $lt: new Date() }
  });
};

/**
 * Pre-save middleware: Update lastUpdated
 */
cartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
