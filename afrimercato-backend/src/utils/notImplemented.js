// =================================================================
// NOT IMPLEMENTED UTILITY
// =================================================================
// Standardized 501 responses for unfinished endpoints

/**
 * Creates a middleware that returns 501 Not Implemented
 * with a standardized JSON response
 * 
 * @param {string} featureName - Name of the unimplemented feature
 * @param {object} options - Additional options
 * @returns {Function} Express middleware
 */
const notImplemented = (featureName, options = {}) => {
  return (req, res) => {
    const response = {
      success: false,
      message: `${featureName} is under development`,
      feature: featureName,
      eta: options.eta || 'Coming soon',
      fallback: true,
      timestamp: new Date().toISOString()
    };

    // Log for monitoring
    console.log(`[501] ${req.method} ${req.originalUrl} - ${featureName}`);

    res.status(501).json(response);
  };
};

/**
 * Creates a middleware that returns mock/demo data for unfinished endpoints
 * Useful for frontend development while backend is incomplete
 * 
 * @param {string} featureName - Name of the feature
 * @param {*} mockData - Mock data to return
 * @returns {Function} Express middleware
 */
const withMockData = (featureName, mockData) => {
  return (req, res) => {
    console.log(`[MOCK] ${req.method} ${req.originalUrl} - ${featureName}`);
    
    res.status(200).json({
      success: true,
      data: mockData,
      _meta: {
        mock: true,
        feature: featureName,
        message: 'This is mock data for development'
      }
    });
  };
};

/**
 * Feature flag middleware - blocks routes if feature is disabled
 * 
 * @param {string} featureKey - Key in FEATURES object
 * @returns {Function} Express middleware
 */
const requireFeature = (featureKey) => {
  return (req, res, next) => {
    const { FEATURES } = require('./featureFlags');
    
    if (!FEATURES[featureKey]) {
      return res.status(501).json({
        success: false,
        message: `Feature '${featureKey}' is not yet enabled`,
        feature: featureKey,
        fallback: true
      });
    }
    
    next();
  };
};

module.exports = {
  notImplemented,
  withMockData,
  requireFeature
};
