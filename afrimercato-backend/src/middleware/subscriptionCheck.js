const Subscription = require('../models/Subscription');

/**
 * Middleware to check if vendor has an active subscription
 */
exports.requireActiveSubscription = async (req, res, next) => {
  try {
    const vendorId = req.vendor._id;

    const subscription = await Subscription.findOne({ vendor: vendorId });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No subscription found. Please subscribe to a plan.',
        requiresSubscription: true
      });
    }

    if (!subscription.isActive()) {
      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please renew to continue.',
        requiresRenewal: true,
        expiredDate: subscription.endDate
      });
    }

    // Attach subscription to request
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription',
      error: error.message
    });
  }
};

/**
 * Middleware to check if vendor can add more products
 */
exports.checkProductLimit = async (req, res, next) => {
  try {
    const subscription = req.subscription || await Subscription.findOne({ vendor: req.vendor._id });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required to add products'
      });
    }

    if (!subscription.canAddProducts()) {
      return res.status(403).json({
        success: false,
        message: `Product limit reached. Current plan allows ${subscription.usage.products.limit} products. Please upgrade your plan.`,
        limit: subscription.usage.products.limit,
        current: subscription.usage.products.current,
        requiresUpgrade: true
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Product limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check product limit',
      error: error.message
    });
  }
};

/**
 * Middleware to check if vendor can process more orders
 */
exports.checkOrderLimit = async (req, res, next) => {
  try {
    const subscription = req.subscription || await Subscription.findOne({ vendor: req.vendor._id });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required to process orders'
      });
    }

    if (!subscription.canProcessOrders()) {
      return res.status(403).json({
        success: false,
        message: `Monthly order limit reached. Current plan allows ${subscription.usage.orders.limit} orders per month. Please upgrade your plan.`,
        limit: subscription.usage.orders.limit,
        current: subscription.usage.orders.currentMonth,
        requiresUpgrade: true
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Order limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check order limit',
      error: error.message
    });
  }
};

/**
 * Middleware to check if vendor has a specific feature
 */
exports.requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const subscription = req.subscription || await Subscription.findOne({ vendor: req.vendor._id });

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'Subscription required for this feature'
        });
      }

      if (!subscription.hasFeature(featureName)) {
        return res.status(403).json({
          success: false,
          message: `This feature requires a plan upgrade. Feature: ${featureName}`,
          requiredFeature: featureName,
          currentPlan: subscription.plan,
          requiresUpgrade: true
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Feature check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check feature access',
        error: error.message
      });
    }
  };
};

/**
 * Middleware to check marketplace integration
 */
exports.requireMarketplaceIntegration = (marketplace) => {
  return async (req, res, next) => {
    try {
      const subscription = req.subscription || await Subscription.findOne({ vendor: req.vendor._id });

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'Subscription required for marketplace integration'
        });
      }

      const isConnected = marketplace === 'jumia'
        ? subscription.isJumiaConnected()
        : subscription.isKongaConnected();

      if (!isConnected) {
        return res.status(403).json({
          success: false,
          message: `${marketplace.charAt(0).toUpperCase() + marketplace.slice(1)} integration not active. Please connect your account.`,
          marketplace,
          requiresConnection: true
        });
      }

      req.subscription = subscription;
      req.marketplaceConfig = subscription.marketplaceIntegration[marketplace];
      next();
    } catch (error) {
      console.error('Marketplace integration check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check marketplace integration',
        error: error.message
      });
    }
  };
};

/**
 * Middleware to check API access
 */
exports.checkApiLimit = async (req, res, next) => {
  try {
    const subscription = req.subscription || await Subscription.findOne({ vendor: req.vendor._id });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required for API access'
      });
    }

    if (!subscription.hasFeature('apiAccess')) {
      return res.status(403).json({
        success: false,
        message: 'API access requires a plan upgrade',
        requiresUpgrade: true
      });
    }

    // Check API call limits
    if (subscription.usage.apiCalls.limit > 0) {
      if (subscription.usage.apiCalls.currentMonth >= subscription.usage.apiCalls.limit) {
        return res.status(429).json({
          success: false,
          message: 'Monthly API call limit reached. Please upgrade your plan or wait until next billing cycle.',
          limit: subscription.usage.apiCalls.limit,
          current: subscription.usage.apiCalls.currentMonth,
          resetDate: subscription.usage.apiCalls.lastResetDate
        });
      }

      // Increment API call count
      subscription.usage.apiCalls.currentMonth += 1;
      await subscription.save();
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('API limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check API limit',
      error: error.message
    });
  }
};

/**
 * Middleware to warn about expiring subscription
 */
exports.checkExpiryWarning = async (req, res, next) => {
  try {
    const subscription = req.subscription || await Subscription.findOne({ vendor: req.vendor._id });

    if (subscription && subscription.isActive()) {
      const daysUntilExpiry = subscription.getDaysUntilExpiry();

      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        res.set('X-Subscription-Warning', `Your subscription expires in ${daysUntilExpiry} days`);
        res.set('X-Subscription-Expiry-Date', subscription.endDate.toISOString());
      }
    }

    next();
  } catch (error) {
    console.error('Expiry warning check error:', error);
    next(); // Don't block request on warning check failure
  }
};

module.exports = exports;
