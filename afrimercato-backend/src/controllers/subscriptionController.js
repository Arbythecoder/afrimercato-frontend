const Subscription = require('../models/Subscription');
const Vendor = require('../models/Vendor');
const { SUBSCRIPTION_PLANS, MARKETPLACE_FEATURES, COMMISSION_STRUCTURE } = require('../config/subscriptionPlans');

// Get all subscription plans
exports.getPlans = async (req, res) => {
  try {
    // Get tier details from model with UI features
    const tierDetails = Subscription.getTierDetails();

    res.json({
      success: true,
      plans: SUBSCRIPTION_PLANS,
      tierDetails, // New: UI-specific tier information
      marketplaceFeatures: MARKETPLACE_FEATURES,
      commissionStructure: COMMISSION_STRUCTURE
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
      error: error.message
    });
  }
};

// Get UI configuration for current vendor's subscription tier
// This tells the frontend which components to show/hide
exports.getUIConfig = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    let subscription = await Subscription.findOne({ vendor: vendorId });

    // If no subscription, create free one
    if (!subscription) {
      subscription = await createFreeSubscription(vendorId);
    }

    // Get UI config from subscription model
    const uiConfig = subscription.getUIConfig();

    res.json({
      success: true,
      uiConfig,
      subscription: {
        tier: subscription.plan,
        status: subscription.status,
        daysUntilExpiry: subscription.getDaysUntilExpiry()
      }
    });
  } catch (error) {
    console.error('Error fetching UI config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch UI configuration',
      error: error.message
    });
  }
};

// Get specific plan details
exports.getPlanDetails = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      plan,
      marketplaceFeatures: {
        jumia: MARKETPLACE_FEATURES.jumia[plan.id] || null,
        konga: MARKETPLACE_FEATURES.konga[plan.id] || null
      },
      commission: COMMISSION_STRUCTURE[plan.id]
    });
  } catch (error) {
    console.error('Error fetching plan details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan details',
      error: error.message
    });
  }
};

// Get vendor's current subscription
exports.getVendorSubscription = async (req, res) => {
  try {
    // Get vendor profile from user ID
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found. Please create a vendor profile first.'
      });
    }

    let subscription = await Subscription.findOne({ vendor: vendor._id });

    // If no subscription exists, create a free trial
    if (!subscription) {
      subscription = await createFreeSubscription(vendor._id);
    }

    const planDetails = SUBSCRIPTION_PLANS[subscription.plan.toUpperCase()];

    res.json({
      success: true,
      subscription,
      planDetails,
      daysUntilExpiry: subscription.getDaysUntilExpiry(),
      isActive: subscription.isActive(),
      canUpgrade: subscription.plan !== 'enterprise'
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
};

// Create or upgrade subscription
exports.createOrUpgradeSubscription = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { plan, billingCycle, paymentMethod, paymentReference } = req.body;

    // Validate plan
    const planDetails = SUBSCRIPTION_PLANS[plan.toUpperCase()];
    if (!planDetails) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
    }

    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Find existing subscription
    let subscription = await Subscription.findOne({ vendor: vendorId });
    const isUpgrade = !!subscription;
    const oldPlan = subscription ? subscription.plan : 'none';

    // Calculate subscription period
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Determine price
    const price = billingCycle === 'yearly' && planDetails.yearlyPrice
      ? planDetails.yearlyPrice
      : planDetails.price;

    if (subscription) {
      // Update existing subscription
      subscription.plan = plan;
      subscription.status = 'active';
      subscription.billingCycle = billingCycle;
      subscription.price = {
        amount: price,
        currency: planDetails.currency
      };
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.autoRenew = true;

      // Update features from plan
      subscription.features = {
        bulkUpload: planDetails.features.bulkUpload,
        productVariants: planDetails.features.productVariants,
        advancedAnalytics: planDetails.features.analytics !== 'basic',
        apiAccess: planDetails.features.apiAccess !== false,
        customBranding: planDetails.features.customBranding,
        prioritySupport: planDetails.features.customerSupport !== 'email',
        dedicatedAccountManager: planDetails.features.dedicatedAccountManager || false
      };

      // Update usage limits
      subscription.usage.products.limit = planDetails.features.maxProducts === 'unlimited'
        ? Number.MAX_SAFE_INTEGER
        : planDetails.features.maxProducts;
      subscription.usage.orders.limit = planDetails.features.maxMonthlyOrders === 'unlimited'
        ? Number.MAX_SAFE_INTEGER
        : planDetails.features.maxMonthlyOrders;
      subscription.usage.storage.limit = planDetails.features.storageLimit;
      subscription.usage.apiCalls.limit = planDetails.features.apiCallsPerMonth || 0;

      // Update marketplace integration tiers
      if (planDetails.features.jumiaIntegration && planDetails.features.jumiaIntegration.enabled) {
        subscription.marketplaceIntegration.jumia.tier = planDetails.features.jumiaIntegration.tier;
      }
      if (planDetails.features.kongaIntegration && planDetails.features.kongaIntegration.enabled) {
        subscription.marketplaceIntegration.konga.tier = planDetails.features.kongaIntegration.tier;
      }

      // Update payment info
      subscription.payment = {
        ...subscription.payment,
        lastPaymentDate: new Date(),
        lastPaymentAmount: price,
        nextPaymentDate: endDate,
        nextPaymentAmount: price,
        paymentMethod,
        paymentReference,
        failedPayments: 0
      };

      // Add to history
      subscription.history.push({
        action: isUpgrade ? 'upgraded' : 'renewed',
        fromPlan: oldPlan,
        toPlan: plan,
        date: new Date(),
        reason: 'Vendor subscription change',
        performedBy: req.user ? req.user._id : vendorId
      });

      await subscription.save();
    } else {
      // Create new subscription
      subscription = await createSubscription(vendorId, plan, billingCycle, price, planDetails, paymentMethod, paymentReference);
    }

    res.json({
      success: true,
      message: `Successfully ${isUpgrade ? 'upgraded to' : 'subscribed to'} ${planDetails.name}`,
      subscription,
      planDetails
    });
  } catch (error) {
    console.error('Error creating/upgrading subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create/upgrade subscription',
      error: error.message
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { reason } = req.body;

    const subscription = await Subscription.findOne({ vendor: vendorId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    const oldPlan = subscription.plan;
    subscription.status = 'cancelled';
    subscription.autoRenew = false;

    subscription.history.push({
      action: 'cancelled',
      fromPlan: oldPlan,
      toPlan: 'free',
      date: new Date(),
      reason: reason || 'Vendor cancellation',
      performedBy: req.user ? req.user._id : vendorId
    });

    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully. You will retain access until the end of your billing period.',
      subscription,
      accessUntil: subscription.endDate
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

// Connect marketplace (Jumia/Konga)
exports.connectMarketplace = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { marketplace, apiKey, apiSecret, sellerId } = req.body;

    if (!['jumia', 'konga'].includes(marketplace)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid marketplace. Must be "jumia" or "konga"'
      });
    }

    const subscription = await Subscription.findOne({ vendor: vendorId });

    if (!subscription || !subscription.isActive()) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required to connect marketplace'
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[subscription.plan.toUpperCase()];
    const marketplaceFeature = planDetails.features[`${marketplace}Integration`];

    if (!marketplaceFeature || !marketplaceFeature.enabled) {
      return res.status(403).json({
        success: false,
        message: `${marketplace.charAt(0).toUpperCase() + marketplace.slice(1)} integration not available in your plan. Please upgrade.`
      });
    }

    // Update marketplace connection
    subscription.marketplaceIntegration[marketplace] = {
      enabled: true,
      tier: marketplaceFeature.tier,
      connectedAt: new Date(),
      [marketplace === 'jumia' ? 'sellerId' : 'merchantId']: sellerId,
      apiCredentials: {
        apiKey,
        apiSecret,
        lastSynced: new Date()
      },
      status: 'active'
    };

    await subscription.save();

    res.json({
      success: true,
      message: `Successfully connected to ${marketplace.charAt(0).toUpperCase() + marketplace.slice(1)}`,
      marketplace: subscription.marketplaceIntegration[marketplace],
      features: marketplaceFeature.features
    });
  } catch (error) {
    console.error('Error connecting marketplace:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect marketplace',
      error: error.message
    });
  }
};

// Disconnect marketplace
exports.disconnectMarketplace = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { marketplace } = req.params;

    if (!['jumia', 'konga'].includes(marketplace)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid marketplace'
      });
    }

    const subscription = await Subscription.findOne({ vendor: vendorId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    subscription.marketplaceIntegration[marketplace] = {
      enabled: false,
      tier: null,
      status: 'inactive'
    };

    await subscription.save();

    res.json({
      success: true,
      message: `Successfully disconnected from ${marketplace.charAt(0).toUpperCase() + marketplace.slice(1)}`
    });
  } catch (error) {
    console.error('Error disconnecting marketplace:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect marketplace',
      error: error.message
    });
  }
};

// Get subscription usage statistics
exports.getUsageStats = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const subscription = await Subscription.findOne({ vendor: vendorId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const usage = {
      products: {
        used: subscription.usage.products.current,
        limit: subscription.usage.products.limit,
        percentage: (subscription.usage.products.current / subscription.usage.products.limit) * 100
      },
      orders: {
        used: subscription.usage.orders.currentMonth,
        limit: subscription.usage.orders.limit,
        percentage: (subscription.usage.orders.currentMonth / subscription.usage.orders.limit) * 100
      },
      storage: {
        used: subscription.usage.storage.used,
        limit: subscription.usage.storage.limit
      },
      apiCalls: {
        used: subscription.usage.apiCalls.currentMonth,
        limit: subscription.usage.apiCalls.limit,
        percentage: subscription.usage.apiCalls.limit > 0
          ? (subscription.usage.apiCalls.currentMonth / subscription.usage.apiCalls.limit) * 100
          : 0
      }
    };

    res.json({
      success: true,
      usage,
      warnings: {
        productsNearLimit: usage.products.percentage > 80,
        ordersNearLimit: usage.orders.percentage > 80,
        apiCallsNearLimit: usage.apiCalls.percentage > 80
      }
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage statistics',
      error: error.message
    });
  }
};

// Helper functions
async function createFreeSubscription(vendorId) {
  const planDetails = SUBSCRIPTION_PLANS.FREE;
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // 30-day free trial

  const subscription = new Subscription({
    vendor: vendorId,
    plan: 'free',
    status: 'trial',
    billingCycle: 'monthly',
    price: {
      amount: 0,
      currency: 'NGN'
    },
    startDate: new Date(),
    endDate,
    trialEndDate: endDate,
    usage: {
      products: { current: 0, limit: planDetails.features.maxProducts },
      orders: { current: 0, limit: planDetails.features.maxMonthlyOrders },
      storage: { used: 0, limit: planDetails.features.storageLimit },
      apiCalls: { current: 0, limit: 0 }
    },
    features: {
      bulkUpload: false,
      productVariants: false,
      advancedAnalytics: false,
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
      dedicatedAccountManager: false
    },
    history: [{
      action: 'created',
      fromPlan: 'none',
      toPlan: 'free',
      date: new Date(),
      reason: 'New vendor registration'
    }]
  });

  await subscription.save();
  return subscription;
}

async function createSubscription(vendorId, plan, billingCycle, price, planDetails, paymentMethod, paymentReference) {
  const endDate = new Date();
  if (billingCycle === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const subscription = new Subscription({
    vendor: vendorId,
    plan,
    status: 'active',
    billingCycle,
    price: {
      amount: price,
      currency: planDetails.currency
    },
    startDate: new Date(),
    endDate,
    usage: {
      products: {
        current: 0,
        limit: planDetails.features.maxProducts === 'unlimited'
          ? Number.MAX_SAFE_INTEGER
          : planDetails.features.maxProducts
      },
      orders: {
        current: 0,
        limit: planDetails.features.maxMonthlyOrders === 'unlimited'
          ? Number.MAX_SAFE_INTEGER
          : planDetails.features.maxMonthlyOrders
      },
      storage: { used: 0, limit: planDetails.features.storageLimit },
      apiCalls: { current: 0, limit: planDetails.features.apiCallsPerMonth || 0 }
    },
    features: {
      bulkUpload: planDetails.features.bulkUpload,
      productVariants: planDetails.features.productVariants,
      advancedAnalytics: planDetails.features.analytics !== 'basic',
      apiAccess: planDetails.features.apiAccess !== false,
      customBranding: planDetails.features.customBranding,
      prioritySupport: planDetails.features.customerSupport !== 'email',
      dedicatedAccountManager: planDetails.features.dedicatedAccountManager || false
    },
    payment: {
      lastPaymentDate: new Date(),
      lastPaymentAmount: price,
      nextPaymentDate: endDate,
      nextPaymentAmount: price,
      paymentMethod,
      paymentReference,
      failedPayments: 0
    },
    history: [{
      action: 'created',
      fromPlan: 'none',
      toPlan: plan,
      date: new Date(),
      reason: 'New subscription'
    }]
  });

  await subscription.save();
  return subscription;
}

module.exports = exports;
