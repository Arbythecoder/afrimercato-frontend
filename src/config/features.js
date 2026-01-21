// =================================================================
// FEATURE FLAGS - Client-side feature toggles
// =================================================================
// Controls which features are visible/accessible in the UI
// Should mirror backend feature flags

export const FEATURES = {
  // ==================== MVP FEATURES (ENABLED) ====================
  CUSTOMER_REGISTRATION: true,
  CUSTOMER_LOGIN: true,
  CUSTOMER_BROWSING: true,
  CUSTOMER_CART: true,
  CUSTOMER_CHECKOUT: true,
  CUSTOMER_ORDERS: true,
  
  VENDOR_REGISTRATION: true,
  VENDOR_LOGIN: true,
  VENDOR_DASHBOARD: true,
  VENDOR_PRODUCTS: true,
  VENDOR_ORDERS: true,
  
  // ==================== RIDER FEATURES (DISABLED) ====================
  RIDER_REGISTRATION: false,
  RIDER_LOGIN: false,
  RIDER_DASHBOARD: false,
  RIDER_DELIVERIES: false,
  RIDER_EARNINGS: false,
  RIDER_TRACKING: false,
  
  // ==================== PICKER FEATURES (DISABLED) ====================
  PICKER_REGISTRATION: false,
  PICKER_LOGIN: false,
  PICKER_DASHBOARD: false,
  PICKER_ORDERS: false,
  PICKER_EARNINGS: false,
  
  // ==================== ADMIN FEATURES (DISABLED) ====================
  ADMIN_DASHBOARD: false,
  ADMIN_VENDOR_MANAGEMENT: false,
  ADMIN_CUSTOMER_MANAGEMENT: false,
  ADMIN_RIDER_MANAGEMENT: false,
  ADMIN_PICKER_MANAGEMENT: false,
  ADMIN_ANALYTICS: false,
  
  // ==================== PAYMENT FEATURES (PARTIAL) ====================
  PAYMENT_BASIC: true,
  PAYMENT_REFUNDS: false,
  PAYMENT_SUBSCRIPTIONS: false,
  
  // ==================== TRACKING FEATURES (PARTIAL) ====================
  TRACKING_ORDER_STATUS: true,
  TRACKING_REAL_TIME: false,
  TRACKING_LIVE_MAP: false,
  
  // ==================== GDPR FEATURES (DISABLED) ====================
  GDPR_DATA_EXPORT: false,
  GDPR_ACCOUNT_DELETION: false,
  
  // ==================== OTHER FEATURES ====================
  VENDOR_PAYOUTS: false,
  VENDOR_SUBSCRIPTIONS: false,
  NOTIFICATIONS_PUSH: false,
};

/**
 * Check if a feature is enabled
 * @param {string} featureKey - Feature key to check
 * @returns {boolean} Whether feature is enabled
 */
export const isFeatureEnabled = (featureKey) => {
  return FEATURES[featureKey] === true;
};

/**
 * Hook to check feature flag
 * @param {string} featureKey - Feature key to check
 * @returns {boolean} Whether feature is enabled
 */
export const useFeatureFlag = (featureKey) => {
  return isFeatureEnabled(featureKey);
};

/**
 * Get display info for disabled features
 */
export const FEATURE_INFO = {
  RIDER_DASHBOARD: {
    name: 'Rider Dashboard',
    description: 'Manage deliveries and track earnings',
    eta: 'Coming Q2 2026'
  },
  PICKER_DASHBOARD: {
    name: 'Picker Dashboard',
    description: 'Handle order picking and packing',
    eta: 'Coming Q2 2026'
  },
  ADMIN_DASHBOARD: {
    name: 'Admin Panel',
    description: 'Platform management and analytics',
    eta: 'Coming Q1 2026'
  },
  TRACKING_REAL_TIME: {
    name: 'Real-time Tracking',
    description: 'Live GPS tracking of your delivery',
    eta: 'Coming Q2 2026'
  },
  GDPR_DATA_EXPORT: {
    name: 'Data Export',
    description: 'Export all your personal data',
    eta: 'Coming Q2 2026'
  },
  VENDOR_PAYOUTS: {
    name: 'Automated Payouts',
    description: 'Automatic weekly payments to your bank',
    eta: 'Coming Q1 2026'
  }
};

export default FEATURES;
