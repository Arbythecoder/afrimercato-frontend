// File: src/models/Coupon.js
// Coupon and discount code management

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [50, 'Coupon code cannot exceed 50 characters'],
      index: true
    },

    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },

    // Discount details
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping'],
      required: [true, 'Discount type is required']
    },

    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative']
    },

    // Maximum discount cap (for percentage discounts)
    maxDiscount: {
      type: Number,
      default: null,
      min: 0
    },

    // Minimum purchase requirements
    minPurchase: {
      type: Number,
      default: 0,
      min: 0
    },

    // Validity period
    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required']
    },

    validUntil: {
      type: Date,
      required: [true, 'Valid until date is required']
    },

    // Usage limits
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
      min: 1
    },

    usagePerCustomer: {
      type: Number,
      default: 1,
      min: 1
    },

    // Tracking
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },

    usedBy: [{
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      usedAt: {
        type: Date,
        default: Date.now
      },
      orderNumber: String,
      discountApplied: Number
    }],

    // Applicability
    applicableTo: {
      type: String,
      enum: ['all', 'specific_vendors', 'specific_categories', 'specific_products', 'first_order'],
      default: 'all'
    },

    vendors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    }],

    categories: [{
      type: String,
      trim: true
    }],

    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    // Who created it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    creatorType: {
      type: String,
      enum: ['admin', 'vendor'],
      required: true
    },

    // Marketing campaign tracking
    campaign: {
      name: String,
      source: String // e.g., 'email', 'social_media', 'app_banner'
    },

    // Internal notes
    internalNotes: {
      type: String,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

// Indexes
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
couponSchema.index({ createdBy: 1 });
couponSchema.index({ applicableTo: 1 });

// Virtuals
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

couponSchema.virtual('isStarted').get(function() {
  return new Date() >= this.validFrom;
});

couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

couponSchema.virtual('remainingUses').get(function() {
  if (this.usageLimit === null) return 'Unlimited';
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Methods

/**
 * Validate if coupon can be used by customer
 */
couponSchema.methods.canBeUsedBy = function(customerId) {
  // Check if active and valid
  if (!this.isValid) return { valid: false, reason: 'Coupon is not valid' };

  // Check customer usage limit
  const customerUsageCount = this.usedBy.filter(
    u => u.customer.toString() === customerId.toString()
  ).length;

  if (customerUsageCount >= this.usagePerCustomer) {
    return {
      valid: false,
      reason: 'You have already used this coupon the maximum number of times'
    };
  }

  return { valid: true };
};

/**
 * Calculate discount for a given order
 */
couponSchema.methods.calculateDiscount = function(orderTotal, items = []) {
  // Check minimum purchase
  if (orderTotal < this.minPurchase) {
    return {
      success: false,
      discount: 0,
      reason: `Minimum purchase of ${this.minPurchase} required`
    };
  }

  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (orderTotal * this.discountValue) / 100;

    // Apply max discount cap if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (this.discountType === 'fixed') {
    discount = this.discountValue;

    // Don't allow discount to exceed order total
    if (discount > orderTotal) {
      discount = orderTotal;
    }
  } else if (this.discountType === 'free_shipping') {
    // Shipping discount handled separately in checkout
    discount = 0; // Placeholder, actual shipping fee deducted in checkout
  }

  return {
    success: true,
    discount: Math.round(discount * 100) / 100, // Round to 2 decimals
    discountType: this.discountType
  };
};

/**
 * Record coupon usage
 */
couponSchema.methods.recordUsage = async function(customerId, orderNumber, discountApplied) {
  this.usedCount += 1;
  this.usedBy.push({
    customer: customerId,
    usedAt: new Date(),
    orderNumber,
    discountApplied
  });

  await this.save();
};

/**
 * Check if coupon is applicable to specific items
 */
couponSchema.methods.isApplicableToOrder = function(vendorId, items = []) {
  // All orders
  if (this.applicableTo === 'all') {
    return { applicable: true };
  }

  // Specific vendors
  if (this.applicableTo === 'specific_vendors') {
    if (!this.vendors.some(v => v.toString() === vendorId.toString())) {
      return {
        applicable: false,
        reason: 'Coupon not applicable to this vendor'
      };
    }
  }

  // Specific categories
  if (this.applicableTo === 'specific_categories') {
    const hasMatchingCategory = items.some(item =>
      this.categories.includes(item.category)
    );

    if (!hasMatchingCategory) {
      return {
        applicable: false,
        reason: 'Coupon not applicable to items in your cart'
      };
    }
  }

  // Specific products
  if (this.applicableTo === 'specific_products') {
    const hasMatchingProduct = items.some(item =>
      this.products.some(p => p.toString() === item.productId.toString())
    );

    if (!hasMatchingProduct) {
      return {
        applicable: false,
        reason: 'Coupon not applicable to items in your cart'
      };
    }
  }

  return { applicable: true };
};

// Static methods

/**
 * Find valid coupon by code
 */
couponSchema.statics.findValidCoupon = async function(code) {
  const coupon = await this.findOne({
    code: code.toUpperCase(),
    isActive: true
  });

  if (!coupon) {
    return { found: false, reason: 'Invalid coupon code' };
  }

  if (!coupon.isValid) {
    if (coupon.isExpired) {
      return { found: false, reason: 'Coupon has expired' };
    }
    if (!coupon.isStarted) {
      return { found: false, reason: 'Coupon is not yet active' };
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { found: false, reason: 'Coupon usage limit reached' };
    }
    return { found: false, reason: 'Coupon is not valid' };
  }

  return { found: true, coupon };
};

couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
