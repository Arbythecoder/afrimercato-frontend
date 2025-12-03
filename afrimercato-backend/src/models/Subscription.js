const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'standard', 'premium', 'enterprise'],
    required: true,
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'suspended', 'trial'],
    default: 'trial'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly', 'custom'],
    default: 'monthly'
  },
  price: {
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    currency: {
      type: String,
      default: 'NGN'
    }
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  trialEndDate: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: true
  },

  // Marketplace Integration Status
  marketplaceIntegration: {
    jumia: {
      enabled: {
        type: Boolean,
        default: false
      },
      tier: {
        type: String,
        enum: ['standard', 'premium', 'enterprise', null],
        default: null
      },
      connectedAt: Date,
      sellerId: String,
      apiCredentials: {
        apiKey: String,
        apiSecret: String,
        lastSynced: Date
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'error'],
        default: 'inactive'
      }
    },
    konga: {
      enabled: {
        type: Boolean,
        default: false
      },
      tier: {
        type: String,
        enum: ['standard', 'premium', 'enterprise', null],
        default: null
      },
      connectedAt: Date,
      merchantId: String,
      apiCredentials: {
        apiKey: String,
        apiSecret: String,
        lastSynced: Date
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'error'],
        default: 'inactive'
      }
    }
  },

  // Usage Tracking
  usage: {
    products: {
      current: {
        type: Number,
        default: 0
      },
      limit: {
        type: Number,
        required: true
      }
    },
    orders: {
      currentMonth: {
        type: Number,
        default: 0
      },
      limit: {
        type: Number,
        required: true
      },
      lastResetDate: Date
    },
    storage: {
      used: {
        type: Number,
        default: 0 // in MB
      },
      limit: {
        type: String,
        required: true // e.g., "100MB", "5GB"
      }
    },
    apiCalls: {
      currentMonth: {
        type: Number,
        default: 0
      },
      limit: {
        type: Number,
        default: 0
      },
      lastResetDate: Date
    }
  },

  // Payment Information
  payment: {
    lastPaymentDate: Date,
    lastPaymentAmount: Number,
    nextPaymentDate: Date,
    nextPaymentAmount: Number,
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'wallet', 'paystack', 'flutterwave']
    },
    paymentReference: String,
    failedPayments: {
      type: Number,
      default: 0
    }
  },

  // Features Access
  features: {
    bulkUpload: {
      type: Boolean,
      default: false
    },
    productVariants: {
      type: Boolean,
      default: false
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    customBranding: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    dedicatedAccountManager: {
      type: Boolean,
      default: false
    }
  },

  // Notifications
  notifications: {
    expiryReminder: {
      type: Boolean,
      default: true
    },
    usageAlert: {
      type: Boolean,
      default: true
    },
    paymentReminder: {
      type: Boolean,
      default: true
    }
  },

  // History
  history: [{
    action: {
      type: String,
      enum: ['created', 'upgraded', 'downgraded', 'renewed', 'cancelled', 'suspended', 'reactivated']
    },
    fromPlan: String,
    toPlan: String,
    date: {
      type: Date,
      default: Date.now
    },
    reason: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Custom fields for Enterprise
  customTerms: {
    customPricing: Boolean,
    customFeatures: [String],
    customLimits: mongoose.Schema.Types.Mixed,
    contractDocument: String,
    accountManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }

}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ vendor: 1 }, { unique: true });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ 'marketplaceIntegration.jumia.status': 1 });
subscriptionSchema.index({ 'marketplaceIntegration.konga.status': 1 });

// Methods
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

subscriptionSchema.methods.isExpired = function() {
  return this.endDate < new Date();
};

subscriptionSchema.methods.canAddProducts = function() {
  return this.usage.products.current < this.usage.products.limit;
};

subscriptionSchema.methods.canProcessOrders = function() {
  return this.usage.orders.currentMonth < this.usage.orders.limit;
};

subscriptionSchema.methods.hasFeature = function(feature) {
  return this.features[feature] === true;
};

subscriptionSchema.methods.isJumiaConnected = function() {
  return this.marketplaceIntegration.jumia.enabled &&
         this.marketplaceIntegration.jumia.status === 'active';
};

subscriptionSchema.methods.isKongaConnected = function() {
  return this.marketplaceIntegration.konga.enabled &&
         this.marketplaceIntegration.konga.status === 'active';
};

subscriptionSchema.methods.getDaysUntilExpiry = function() {
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

subscriptionSchema.methods.incrementProductCount = function() {
  this.usage.products.current += 1;
  return this.save();
};

subscriptionSchema.methods.decrementProductCount = function() {
  if (this.usage.products.current > 0) {
    this.usage.products.current -= 1;
    return this.save();
  }
};

subscriptionSchema.methods.incrementOrderCount = function() {
  this.usage.orders.currentMonth += 1;
  return this.save();
};

subscriptionSchema.methods.resetMonthlyUsage = function() {
  this.usage.orders.currentMonth = 0;
  this.usage.orders.lastResetDate = new Date();
  this.usage.apiCalls.currentMonth = 0;
  this.usage.apiCalls.lastResetDate = new Date();
  return this.save();
};

// Statics
subscriptionSchema.statics.findExpiringSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: 'active',
    endDate: { $lte: futureDate, $gte: new Date() }
  }).populate('vendor');
};

subscriptionSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    endDate: { $lt: new Date() }
  }).populate('vendor');
};

/**
 * Get comprehensive tier details with UI features
 * Used for pricing pages and feature comparisons
 */
subscriptionSchema.statics.getTierDetails = function() {
  return {
    free: {
      name: 'Free',
      displayName: 'Starter Plan',
      price: {
        monthly: 0,
        yearly: 0,
        currency: 'EUR'
      },
      limits: {
        products: 5,
        orders: 50,
        storage: '100MB',
        apiCalls: 0
      },
      features: {
        // Core Features
        productListing: true,
        orderManagement: true,
        basicAnalytics: true,

        // Advanced Features (disabled for free)
        bulkUpload: false,
        productVariants: false,
        advancedAnalytics: false,
        apiAccess: false,
        customBranding: false,
        prioritySupport: false,
        dedicatedAccountManager: false,

        // UI Features
        featuredListing: false,
        customStorefront: false,
        promotionalBanners: false,
        exportData: false,
        multipleLocations: false
      },
      uiComponents: {
        // Which UI components are visible
        analyticsTab: 'basic', // basic | advanced | none
        bulkUploadButton: false,
        exportButton: false,
        apiSettingsTab: false,
        customBrandingTab: false,
        upgradePrompts: true, // Show upgrade prompts
        tierBadge: 'Free', // Badge shown on profile
        dashboardWidgets: ['sales', 'orders'], // Limited widgets
        supportChannel: 'email' // email | priority | dedicated
      },
      description: 'Perfect for getting started',
      recommended: false
    },
    standard: {
      name: 'standard',
      displayName: 'Standard Plan',
      price: {
        monthly: 29.99,
        yearly: 299.99, // Save 2 months
        currency: 'EUR'
      },
      limits: {
        products: 50,
        orders: 500,
        storage: '5GB',
        apiCalls: 1000
      },
      features: {
        // Core Features
        productListing: true,
        orderManagement: true,
        basicAnalytics: true,

        // Advanced Features
        bulkUpload: true,
        productVariants: true,
        advancedAnalytics: false, // Still locked for standard
        apiAccess: false,
        customBranding: true,
        prioritySupport: true,
        dedicatedAccountManager: false,

        // UI Features
        featuredListing: false,
        customStorefront: true,
        promotionalBanners: true,
        exportData: true,
        multipleLocations: false
      },
      uiComponents: {
        analyticsTab: 'basic',
        bulkUploadButton: true,
        exportButton: true,
        apiSettingsTab: false,
        customBrandingTab: true,
        upgradePrompts: true, // Show premium upgrade prompts
        tierBadge: 'Standard',
        dashboardWidgets: ['sales', 'orders', 'customers', 'products'],
        supportChannel: 'priority'
      },
      description: 'Great for growing businesses',
      recommended: true
    },
    premium: {
      name: 'premium',
      displayName: 'Premium Plan',
      price: {
        monthly: 99.99,
        yearly: 999.99,
        currency: 'EUR'
      },
      limits: {
        products: -1, // Unlimited
        orders: -1, // Unlimited
        storage: '50GB',
        apiCalls: 10000
      },
      features: {
        // Everything enabled
        productListing: true,
        orderManagement: true,
        basicAnalytics: true,
        bulkUpload: true,
        productVariants: true,
        advancedAnalytics: true,
        apiAccess: true,
        customBranding: true,
        prioritySupport: true,
        dedicatedAccountManager: true,
        featuredListing: true,
        customStorefront: true,
        promotionalBanners: true,
        exportData: true,
        multipleLocations: true
      },
      uiComponents: {
        analyticsTab: 'advanced', // Full analytics
        bulkUploadButton: true,
        exportButton: true,
        apiSettingsTab: true,
        customBrandingTab: true,
        upgradePrompts: false, // No upgrade prompts (already at top)
        tierBadge: 'Premium',
        dashboardWidgets: ['sales', 'orders', 'customers', 'products', 'analytics', 'insights', 'trends'],
        supportChannel: 'dedicated'
      },
      description: 'Complete solution for serious sellers',
      recommended: false
    },
    enterprise: {
      name: 'enterprise',
      displayName: 'Enterprise Plan',
      price: {
        monthly: 'Custom',
        yearly: 'Custom',
        currency: 'EUR'
      },
      limits: {
        products: -1,
        orders: -1,
        storage: 'Unlimited',
        apiCalls: -1
      },
      features: {
        // Everything + custom
        productListing: true,
        orderManagement: true,
        basicAnalytics: true,
        bulkUpload: true,
        productVariants: true,
        advancedAnalytics: true,
        apiAccess: true,
        customBranding: true,
        prioritySupport: true,
        dedicatedAccountManager: true,
        featuredListing: true,
        customStorefront: true,
        promotionalBanners: true,
        exportData: true,
        multipleLocations: true,
        customIntegrations: true,
        whiteLabel: true
      },
      uiComponents: {
        analyticsTab: 'advanced',
        bulkUploadButton: true,
        exportButton: true,
        apiSettingsTab: true,
        customBrandingTab: true,
        upgradePrompts: false,
        tierBadge: 'Enterprise',
        dashboardWidgets: 'all',
        supportChannel: 'dedicated'
      },
      description: 'Tailored for large organizations',
      recommended: false
    }
  };
};

/**
 * Get UI configuration for current subscription tier
 * Returns what UI components should be visible/enabled
 */
subscriptionSchema.methods.getUIConfig = function() {
  const tierDetails = this.constructor.getTierDetails();
  const currentTier = tierDetails[this.plan];

  if (!currentTier) {
    return tierDetails.free.uiComponents; // Fallback to free
  }

  return {
    ...currentTier.uiComponents,
    isActive: this.isActive(),
    daysUntilExpiry: this.getDaysUntilExpiry(),
    showExpiryWarning: this.getDaysUntilExpiry() <= 7 && this.getDaysUntilExpiry() > 0,
    canUpgrade: this.plan !== 'premium' && this.plan !== 'enterprise'
  };
};

// Pre-save middleware
subscriptionSchema.pre('save', function(next) {
  // Auto-mark as expired if end date has passed
  if (this.endDate < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
