/**
 * Subscription Plans Configuration
 * Industry-best practices for marketplace vendor subscriptions
 * Supports Afrimercato marketplace integration tiers
 */

const SUBSCRIPTION_PLANS = {
  // FREE TIER - Trial/Starter
  FREE: {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    currency: 'NGN',
    billingCycle: 'monthly',
    features: {
      // Product Management
      maxProducts: 10,
      maxProductImages: 3,
      productCategories: 'limited', // max 2 categories
      bulkUpload: false,
      inventoryManagement: 'basic',
      productVariants: false,

      // Marketplace Integration
      jumiaIntegration: {
        enabled: false,
        tier: null,
        autoSync: false,
        orderManagement: false
      },
      kongaIntegration: {
        enabled: false,
        tier: null,
        autoSync: false,
        orderManagement: false
      },

      // Sales & Orders
      maxMonthlyOrders: 20,
      orderManagement: 'basic',
      multiChannelOrders: false,

      // Analytics & Reporting
      analytics: 'basic',
      salesReports: false,
      exportData: false,

      // Support & Features
      customerSupport: 'email',
      commissionRate: 15, // 15% platform fee
      priorityListing: false,
      promotionalTools: false,
      customBranding: false,

      // Technical
      apiAccess: false,
      webhooks: false,
      storageLimit: '100MB'
    },
    limitations: [
      'Limited to 10 products',
      'No marketplace integration',
      'Basic analytics only',
      'Email support only',
      'Higher commission rate (15%)'
    ]
  },

  // STANDARD TIER - For Growing Businesses
  STANDARD: {
    id: 'standard',
    name: 'Standard',
    price: 15000, // NGN per month
    currency: 'NGN',
    billingCycle: 'monthly',
    yearlyPrice: 150000, // 2 months free
    features: {
      // Product Management
      maxProducts: 100,
      maxProductImages: 8,
      productCategories: 'unlimited',
      bulkUpload: true,
      inventoryManagement: 'advanced',
      productVariants: true,

      // Marketplace Integration - STANDARD TIER
      jumiaIntegration: {
        enabled: true,
        tier: 'standard',
        autoSync: true,
        orderManagement: true,
        features: {
          productListing: true,
          inventorySync: true,
          priceSync: true,
          orderSync: true,
          basicReporting: true,
          standardShipping: true,
          paymentProcessing: true,
          disputeManagement: 'basic',
          categoryPlacement: 'standard',
          promotionalSpots: 0,
          featuredProducts: 0
        }
      },
      kongaIntegration: {
        enabled: true,
        tier: 'standard',
        autoSync: true,
        orderManagement: true,
        features: {
          productListing: true,
          inventorySync: true,
          priceSync: true,
          orderSync: true,
          basicReporting: true,
          standardShipping: true,
          paymentProcessing: true,
          disputeManagement: 'basic',
          categoryPlacement: 'standard',
          promotionalSpots: 0,
          flashSales: false
        }
      },

      // Sales & Orders
      maxMonthlyOrders: 500,
      orderManagement: 'advanced',
      multiChannelOrders: true,
      automaticFulfillment: false,

      // Analytics & Reporting
      analytics: 'advanced',
      salesReports: true,
      exportData: true,
      customReports: false,
      realTimeAnalytics: false,

      // Support & Features
      customerSupport: 'email-chat',
      commissionRate: 10, // 10% platform fee
      priorityListing: false,
      promotionalTools: 'basic',
      customBranding: false,

      // Technical
      apiAccess: 'basic',
      webhooks: true,
      storageLimit: '5GB',
      apiCallsPerMonth: 10000
    },
    benefits: [
      'List up to 100 products',
      'Jumia Standard integration',
      'Konga Standard integration',
      'Advanced inventory management',
      'Bulk upload & product variants',
      'Multi-channel order management',
      'Advanced analytics & reports',
      'Email + Chat support',
      'Reduced commission (10%)',
      'Basic promotional tools'
    ]
  },

  // PREMIUM TIER - For Established Vendors
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 35000, // NGN per month
    currency: 'NGN',
    billingCycle: 'monthly',
    yearlyPrice: 350000, // 2 months free + additional discount
    features: {
      // Product Management
      maxProducts: 1000,
      maxProductImages: 15,
      productCategories: 'unlimited',
      bulkUpload: true,
      inventoryManagement: 'enterprise',
      productVariants: true,

      // Marketplace Integration - PREMIUM TIER
      jumiaIntegration: {
        enabled: true,
        tier: 'premium',
        autoSync: true,
        orderManagement: true,
        features: {
          productListing: true,
          inventorySync: true,
          priceSync: true,
          orderSync: true,
          advancedReporting: true,
          premiumShipping: true,
          expressShipping: true,
          paymentProcessing: true,
          disputeManagement: 'priority',
          categoryPlacement: 'premium',
          promotionalSpots: 5, // per month
          featuredProducts: 10, // simultaneously
          flashSaleAccess: true,
          homepageBanner: 1, // per quarter
          accountManager: true,
          prioritySupport: true,
          customIntegration: false
        }
      },
      kongaIntegration: {
        enabled: true,
        tier: 'premium',
        autoSync: true,
        orderManagement: true,
        features: {
          productListing: true,
          inventorySync: true,
          priceSync: true,
          orderSync: true,
          advancedReporting: true,
          premiumShipping: true,
          expressShipping: true,
          paymentProcessing: true,
          disputeManagement: 'priority',
          categoryPlacement: 'premium',
          promotionalSpots: 5, // per month
          flashSales: true,
          brandStorefront: true,
          koboPoints: 'enhanced',
          accountManager: true,
          prioritySupport: true
        }
      },

      // Sales & Orders
      maxMonthlyOrders: 5000,
      orderManagement: 'enterprise',
      multiChannelOrders: true,
      automaticFulfillment: true,

      // Analytics & Reporting
      analytics: 'enterprise',
      salesReports: true,
      exportData: true,
      customReports: true,
      realTimeAnalytics: true,
      predictiveAnalytics: true,

      // Support & Features
      customerSupport: 'priority-phone',
      commissionRate: 7, // 7% platform fee
      priorityListing: true,
      promotionalTools: 'advanced',
      customBranding: true,
      dedicatedAccountManager: true,

      // Technical
      apiAccess: 'advanced',
      webhooks: true,
      storageLimit: '50GB',
      apiCallsPerMonth: 100000,
      customIntegrations: true
    },
    benefits: [
      'List up to 1,000 products',
      'Jumia Premium integration',
      'Konga Premium integration',
      'Enterprise inventory management',
      'Multi-marketplace sync',
      '5 promotional spots/month on each platform',
      '10 featured products simultaneously',
      'Flash sale access',
      'Premium category placement',
      'Dedicated account manager',
      'Priority support (24/7 phone)',
      'Lowest commission (7%)',
      'Advanced promotional tools',
      'Custom branding',
      'Real-time & predictive analytics',
      'Automatic fulfillment',
      'API access for custom integrations'
    ]
  },

  // ENTERPRISE TIER - For Large-Scale Operations
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'custom', // Contact sales
    currency: 'NGN',
    billingCycle: 'custom',
    features: {
      // Product Management
      maxProducts: 'unlimited',
      maxProductImages: 'unlimited',
      productCategories: 'unlimited',
      bulkUpload: true,
      inventoryManagement: 'custom',
      productVariants: true,

      // Marketplace Integration - ENTERPRISE TIER
      jumiaIntegration: {
        enabled: true,
        tier: 'enterprise',
        autoSync: true,
        orderManagement: true,
        features: {
          everything: 'premium_plus',
          customIntegration: true,
          dedicatedInfrastructure: true,
          whiteLabel: true,
          promotionalSpots: 'unlimited',
          featuredProducts: 'unlimited',
          exclusiveDeals: true,
          customShipping: true,
          customPaymentTerms: true
        }
      },
      kongaIntegration: {
        enabled: true,
        tier: 'enterprise',
        autoSync: true,
        orderManagement: true,
        features: {
          everything: 'premium_plus',
          customIntegration: true,
          dedicatedInfrastructure: true,
          whiteLabel: true,
          promotionalSpots: 'unlimited',
          flashSales: 'priority',
          exclusiveDeals: true,
          customShipping: true,
          customPaymentTerms: true
        }
      },

      // Sales & Orders
      maxMonthlyOrders: 'unlimited',
      orderManagement: 'custom',
      multiChannelOrders: true,
      automaticFulfillment: true,

      // Analytics & Reporting
      analytics: 'custom',
      salesReports: true,
      exportData: true,
      customReports: true,
      realTimeAnalytics: true,
      predictiveAnalytics: true,
      aiInsights: true,

      // Support & Features
      customerSupport: 'dedicated-team',
      commissionRate: 'negotiable', // 5% or lower
      priorityListing: true,
      promotionalTools: 'enterprise',
      customBranding: true,
      dedicatedAccountManager: true,

      // Technical
      apiAccess: 'enterprise',
      webhooks: true,
      storageLimit: 'unlimited',
      apiCallsPerMonth: 'unlimited',
      customIntegrations: true,
      sla: '99.9%'
    }
  }
};

// Marketplace-specific features mapping
const MARKETPLACE_FEATURES = {
  jumia: {
    standard: {
      name: 'Jumia Standard Seller',
      benefits: [
        'Standard product listing',
        'Jumia fulfillment eligible',
        'Standard shipping options',
        'Basic analytics dashboard',
        'Email support',
        'Standard commission rates'
      ]
    },
    premium: {
      name: 'Jumia Premium Seller',
      benefits: [
        'Priority product placement',
        'Jumia Prime eligible',
        'Premium & Express shipping',
        '5 promotional campaign spots/month',
        '10 featured products',
        'Flash sale participation',
        'Homepage banner (quarterly)',
        'Dedicated account manager',
        'Advanced analytics & insights',
        'Priority customer support',
        'Reduced commission rates',
        'Early access to new features'
      ]
    }
  },
  konga: {
    standard: {
      name: 'Konga Standard Merchant',
      benefits: [
        'Standard product listing',
        'KongaPay integration',
        'Standard shipping via KOS',
        'Basic sales dashboard',
        'Email support',
        'Standard commission rates'
      ]
    },
    premium: {
      name: 'Konga Premium Merchant',
      benefits: [
        'Premium category placement',
        'Enhanced KoboPoints rewards',
        'Premium shipping options',
        '5 promotional spots/month',
        'Flash sale priority access',
        'Brand storefront page',
        'Dedicated account manager',
        'Advanced analytics & reporting',
        'Priority dispute resolution',
        'Reduced commission rates',
        'Marketing campaign support',
        'Seasonal promotion access'
      ]
    }
  }
};

// Commission structure by plan
const COMMISSION_STRUCTURE = {
  free: {
    platformFee: 15,
    jumiaFee: 0, // Not integrated
    kongaFee: 0, // Not integrated
    total: 15
  },
  standard: {
    platformFee: 10,
    jumiaFee: 8, // Standard Jumia seller commission
    kongaFee: 8, // Standard Konga merchant commission
    total: 10 // Platform only, marketplace fees separate
  },
  premium: {
    platformFee: 7,
    jumiaFee: 6, // Premium Jumia seller (reduced)
    kongaFee: 6, // Premium Konga merchant (reduced)
    total: 7 // Platform only, marketplace fees separate
  },
  enterprise: {
    platformFee: 'negotiable',
    jumiaFee: 'negotiable',
    kongaFee: 'negotiable',
    total: 'custom'
  }
};

// Plan comparison helper
const PLAN_COMPARISON = {
  features: [
    'maxProducts',
    'jumiaIntegration',
    'kongaIntegration',
    'commissionRate',
    'customerSupport',
    'analytics',
    'promotionalTools'
  ],
  recommended: {
    newVendor: 'free',
    growingBusiness: 'standard',
    establishedBrand: 'premium',
    largeCorporation: 'enterprise'
  }
};

module.exports = {
  SUBSCRIPTION_PLANS,
  MARKETPLACE_FEATURES,
  COMMISSION_STRUCTURE,
  PLAN_COMPARISON
};
