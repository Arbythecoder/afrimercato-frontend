// =================================================================
// FEATURE FLAGS - Server-side feature toggles
// =================================================================
// Controls which features are enabled/disabled
// Allows gradual rollout without code changes

const FEATURES = {
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
  ADMIN_AUDIT_LOGS: false,
  
  // ==================== PAYMENT FEATURES (PARTIAL) ====================
  PAYMENT_BASIC: true,           // Basic payment processing
  PAYMENT_WEBHOOKS: false,       // Stripe/PayPal webhooks
  PAYMENT_REFUNDS: false,        // Refund processing
  PAYMENT_SUBSCRIPTIONS: false,  // Vendor subscriptions
  
  // ==================== TRACKING FEATURES (DISABLED) ====================
  TRACKING_ORDER_STATUS: true,   // Basic status tracking
  TRACKING_REAL_TIME: false,     // Real-time GPS tracking
  TRACKING_WEBSOCKET: false,     // WebSocket updates
  
  // ==================== GDPR FEATURES (DISABLED) ====================
  GDPR_DATA_EXPORT: false,
  GDPR_ACCOUNT_DELETION: false,
  GDPR_CONSENT_MANAGEMENT: false,
  GDPR_DATA_CORRECTION: false,
  
  // ==================== OTHER FEATURES ====================
  VENDOR_PAYOUTS: false,
  VENDOR_SUBSCRIPTIONS: false,
  NOTIFICATIONS_PUSH: false,
  NOTIFICATIONS_EMAIL: true,     // Basic email enabled
  NOTIFICATIONS_SMS: false,
  ANALYTICS_ADVANCED: false,
};

/**
 * Check if a feature is enabled
 * @param {string} featureKey - Feature key to check
 * @returns {boolean} Whether feature is enabled
 */
const isFeatureEnabled = (featureKey) => {
  return FEATURES[featureKey] === true;
};

/**
 * Get all enabled features
 * @returns {string[]} Array of enabled feature keys
 */
const getEnabledFeatures = () => {
  return Object.keys(FEATURES).filter(key => FEATURES[key]);
};

/**
 * Get all disabled features
 * @returns {string[]} Array of disabled feature keys
 */
const getDisabledFeatures = () => {
  return Object.keys(FEATURES).filter(key => !FEATURES[key]);
};

/**
 * Get feature status summary
 * @returns {object} Summary of feature statuses
 */
const getFeatureSummary = () => {
  const enabled = getEnabledFeatures();
  const disabled = getDisabledFeatures();
  
  return {
    total: Object.keys(FEATURES).length,
    enabled: enabled.length,
    disabled: disabled.length,
    enabledFeatures: enabled,
    disabledFeatures: disabled
  };
};

module.exports = {
  FEATURES,
  isFeatureEnabled,
  getEnabledFeatures,
  getDisabledFeatures,
  getFeatureSummary
};
