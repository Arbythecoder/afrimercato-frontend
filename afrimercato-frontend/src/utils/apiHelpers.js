// =================================================================
// API HELPERS - Safe API calls with 501 handling
// =================================================================
// Utilities for handling unimplemented endpoints gracefully

/**
 * Make an API call with automatic 501 handling
 * Returns fallback data when endpoint returns 501
 * 
 * @param {Function} apiCall - The API call function to execute
 * @param {*} fallbackData - Data to return if endpoint is not implemented
 * @param {object} options - Additional options
 * @returns {Promise<object>} API response or fallback
 */
export const fetchWithFallback = async (apiCall, fallbackData, options = {}) => {
  try {
    const response = await apiCall();
    
    // Check if server returned a fallback flag (501 with mock data)
    if (response?.fallback || response?._meta?.mock) {
      console.log(`[API] Received fallback/mock data:`, response);
      return {
        ...fallbackData,
        _isStub: true,
        _message: response.message || 'Feature under development'
      };
    }
    
    return response;
  } catch (error) {
    // Handle 501 Not Implemented
    if (error?.response?.status === 501 || error?.status === 501) {
      console.log(`[API] Endpoint not implemented, using fallback`);
      return {
        ...fallbackData,
        _isStub: true,
        _message: error?.response?.data?.message || 'Feature under development'
      };
    }
    
    // For other errors, optionally return fallback or throw
    if (options.returnFallbackOnError) {
      console.warn(`[API] Error, using fallback:`, error.message);
      return {
        ...fallbackData,
        _isStub: true,
        _error: true,
        _message: error.message
      };
    }
    
    throw error;
  }
};

/**
 * Check if response is stubbed/fallback data
 * 
 * @param {object} response - API response to check
 * @returns {boolean} Whether response is stubbed
 */
export const isStubResponse = (response) => {
  return response?._isStub === true || response?.fallback === true || response?._meta?.mock === true;
};

/**
 * Default fallback data templates for different features
 */
export const FALLBACK_DATA = {
  // Rider fallbacks
  riderDeliveries: {
    success: true,
    data: {
      deliveries: [],
      total: 0,
      message: 'Rider deliveries feature coming soon'
    }
  },
  riderEarnings: {
    success: true,
    data: {
      totalEarnings: 0,
      pendingEarnings: 0,
      completedDeliveries: 0,
      message: 'Rider earnings feature coming soon'
    }
  },
  riderProfile: {
    success: true,
    data: {
      status: 'pending_setup',
      message: 'Rider profile feature coming soon'
    }
  },
  
  // Picker fallbacks
  pickerOrders: {
    success: true,
    data: {
      orders: [],
      total: 0,
      message: 'Picker orders feature coming soon'
    }
  },
  pickerEarnings: {
    success: true,
    data: {
      totalEarnings: 0,
      ordersCompleted: 0,
      message: 'Picker earnings feature coming soon'
    }
  },
  
  // Tracking fallbacks
  orderTracking: {
    success: true,
    data: {
      status: 'processing',
      events: [
        { status: 'Order placed', timestamp: new Date().toISOString() }
      ],
      estimatedDelivery: null,
      message: 'Real-time tracking coming soon'
    }
  },
  
  // Admin fallbacks
  adminStats: {
    success: true,
    data: {
      users: 0,
      vendors: 0,
      orders: 0,
      revenue: 0,
      message: 'Admin dashboard coming soon'
    }
  },
  
  // GDPR fallbacks
  userData: {
    success: true,
    data: {
      exportUrl: null,
      message: 'Data export feature coming soon'
    }
  }
};

/**
 * Get appropriate fallback for a feature
 * 
 * @param {string} feature - Feature key
 * @returns {object} Fallback data for that feature
 */
export const getFallbackFor = (feature) => {
  return FALLBACK_DATA[feature] || {
    success: true,
    data: null,
    _isStub: true,
    _message: 'Feature under development'
  };
};

export default {
  fetchWithFallback,
  isStubResponse,
  FALLBACK_DATA,
  getFallbackFor
};
