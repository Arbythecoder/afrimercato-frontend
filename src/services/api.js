// API Base URL - uses environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'https://afrimercato-backend.onrender.com/api';

if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

// Token refresh in progress flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Attempt to refresh the access token
const refreshAccessToken = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // We don't need to pass the token in the body anymore! 
    // credentials: 'include' automatically sends the HttpOnly refresh cookie.
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // <--- CRITICAL
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    if (data.success) {
      // Backend automatically set the new access cookie in the browser
      return true;
    }

    throw new Error('Invalid refresh response');
  } catch (error) {
    throw error;
  }
};

// Generic API call function with automatic token refresh
export const apiCall = async (endpoint, options = {}, isRetry = false) => {
  const controller = new AbortController();
  const timeoutMs = typeof options.timeout === 'number' ? options.timeout : 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: { ...options.headers },
      credentials: 'include',
      signal: controller.signal
    };

    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    if (import.meta.env.DEV) {
      console.log('[API_DEBUG] request:', {
        url,
        method: config.method || 'GET'
      });
    }

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle 401 - Access Cookie expired or missing
      if (response.status === 401 && !isRetry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => apiCall(endpoint, options, true))
            .catch(err => { throw err; });
        }

        isRefreshing = true;

        try {
          // Silently call our refresh endpoint to get a new access cookie
          await refreshAccessToken();
          processQueue(null);
          isRefreshing = false;

          // Retry the original request (it will automatically use the new cookie)
          return apiCall(endpoint, options, true);
        } catch (refreshError) {
          processQueue(refreshError);
          isRefreshing = false;

          // The refresh failed. This could be because the refresh token is invalid,
          // OR it could be that the original 401 was for something else,
          // like invalid credentials or a failed 2FA check.
          // We should prioritize the original error message if it exists.
          const message = errorData.message || 'Your session has expired. Please log in again.';
          const authError = new Error(message);
          authError.code = errorData.code || 'AUTH_EXPIRED'; // Preserve original code
          authError.data = errorData;
          throw authError;
        }
      }

      // If we hit 401 even after retrying, throw the auth error
      if (response.status === 401) {
        const authError = new Error(errorData.message || 'Authentication failed.');
        authError.code = errorData.code || 'AUTH_EXPIRED';
        authError.data = errorData;
        throw authError;
      }

      const statusMessage = {
        400: 'Bad Request', 401: 'Unauthorized', 403: 'Access Denied',
        404: 'Not Found', 500: 'Server Error', 501: 'Feature Not Implemented'
      };

      const errorMsg = errorData.message || statusMessage[response.status] || `HTTP error! status: ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Request timed out');
    if (import.meta.env.DEV) console.error(`API Error (${endpoint}):`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// AUTHENTICATION
export const loginUser = async (credentials) => {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    timeout: 30000 // 30s – backend may cold-start + bcrypt is CPU-heavy
  });
  return response;
};

export const securityAPI = {
  setup2FA: () => apiCall('/auth/2fa/setup', { method: 'POST' }),
  verify2FA: (token) => apiCall('/auth/2fa/verify', { method: 'POST', body: JSON.stringify({ token }) }),
  disable2FA: (data) => apiCall('/auth/2fa/disable', { method: 'POST', body: JSON.stringify(data) })
};

export const registerUser = async (userData) => {
  const response = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
    timeout: 30000 // 30s – backend may cold-start + bcrypt hashing
  });
  return response;
};

export const registerVendor = async (vendorData) => {
  const response = await apiCall('/vendor/register', {
    method: 'POST',
    body: JSON.stringify(vendorData),
    timeout: 30000
  });
  return response;
};

export const logoutUser = async () => {
  return await apiCall('/auth/logout', {
    method: 'POST'
  });
};

export const refreshToken = async () => {
  return apiCall('/auth/refresh', {
    method: 'POST'
  });
};

// VENDOR ENDPOINTS
export const getVendorProfile = async () => {
  return apiCall('/vendor/profile');
};

export const setupVendorStore = async (data) => {
  // Check if data is FormData (has files) or regular JSON
  const isFormData = data instanceof FormData;

  return apiCall('/vendor/profile/setup', {
    method: 'PUT',
    body: isFormData ? data : JSON.stringify(data),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' }
  });
};

// export const createVendorProfile = async (profileData) => {
//   return apiCall('/vendor/profile', {
//     method: 'POST',
//     body: JSON.stringify(profileData)
//   });
// };

export const getVendorProducts = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  return apiCall(`/vendor/products?${queryString}`);
};

export const createProduct = async (productData) => {
  // Use apiCall for automatic token refresh and proper error handling
  const isFormData = productData instanceof FormData;

  return apiCall('/vendor/products', {
    method: 'POST',
    body: isFormData ? productData : JSON.stringify(productData),
    // Longer timeout for file uploads (180 seconds for mobile networks)
    // Mobile users on 3G/4G may need extra time for image uploads
    timeout: isFormData ? 180000 : 10000
  });
};

export const updateProduct = async (productId, productData) => {
  // Use apiCall for automatic token refresh and proper error handling
  const isFormData = productData instanceof FormData;

  return apiCall(`/vendor/products/${productId}`, {
    method: 'PUT',
    body: isFormData ? productData : JSON.stringify(productData),
    // Longer timeout for file uploads (180 seconds for mobile networks)
    // Mobile users on 3G/4G may need extra time for image uploads
    timeout: isFormData ? 180000 : 10000
  });
};

export const deleteProduct = async (productId) => {
  return apiCall(`/vendor/products/${productId}`, {
    method: 'DELETE'
  });
};

export const getVendorOrders = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  return apiCall(`/vendor/orders?${queryString}`);
};

export const getVendorOrder = async (orderId) => {
  return apiCall(`/vendor/orders/${orderId}`);
};

export const updateOrderStatus = async (orderId, statusData) => {
  return apiCall(`/vendor/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData)
  });
};

export const rateRider = async (orderId, ratingData) => {
  return apiCall(`/vendor/orders/${orderId}/rate-rider`, {
    method: 'POST',
    body: JSON.stringify(ratingData)
  });
};

export const getVendorDashboardStats = async () => {
  return apiCall('/vendor/dashboard/stats');
};

export const getVendorChartData = async (timeRange = '7d') => {
  return apiCall(`/vendor/dashboard/chart-data?timeRange=${timeRange}`);
};

export const getSalesReport = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  return apiCall(`/vendor/reports/sales?${queryString}`);
};

export const getInventoryReport = async () => {
  return apiCall('/vendor/reports/inventory');
};

export const getOrdersReport = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  return apiCall(`/vendor/reports/orders?${queryString}`);
};

export const getRevenueReport = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  return apiCall(`/vendor/reports/revenue?${queryString}`);
};

// SUBSCRIPTION
export const getSubscriptionPlans = async () => {
  return apiCall('/subscription/plans');
};

export const createSubscription = async (subscriptionData) => {
  return apiCall('/subscription/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscriptionData)
  });
};

export const getUserSubscription = async () => {
  return apiCall('/subscription/my-subscription');
};

export const cancelSubscription = async () => {
  return apiCall('/subscription/cancel', {
    method: 'POST'
  });
};

// CONTACT & SUPPORT
export const sendContactForm = async (contactData) => {
  return apiCall('/contact', {
    method: 'POST',
    body: JSON.stringify(contactData)
  });
};

export const submitFeedback = async (feedbackData) => {
  return apiCall('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  });
};

export const requestCallback = async (callbackData) => {
  return apiCall('/contact/callback', {
    method: 'POST',
    body: JSON.stringify(callbackData)
  });
};

export const subscribeToNewsletter = async (email) => {
  return apiCall('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

// EVENTS
export const bookEvent = async (eventData) => {
  return apiCall('/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  });
};

export const getEvents = async () => {
  return apiCall('/events');
};

// LOCATION SEARCH
export const searchVendorsByLocation = async (location, radius = 50) => {
  // FIX: Backend expects 'postcode' or 'locationText', not 'location'
  const params = new URLSearchParams({
    locationText: location,
    radiusKm: radius
  });
  // 8s timeout: backend geocoding caps at 5s internally, so 8s is enough to get
  // a real result or the graceful-timeout JSON — faster fallback than 10s default
  return apiCall(`/locations/search-vendors?${params}`, { timeout: 8000 });
};

export const geocodeLocation = async (query) => {
  const params = new URLSearchParams({ query });
  return apiCall(`/locations/geocode?${params}`);
};

// VENDORS (Customer)
export const getVendorById = async (id) => {
  return apiCall(`/products/vendor/${id}`);
};

export const getVendorBySlug = async (slug, params = {}) => {
  const queryParams = new URLSearchParams({ limit: 1000, ...params }).toString();
  return apiCall(`/products/vendor/${slug}?${queryParams}`);
};

export const getVendorProductsByVendorId = async (vendorId, params = {}) => {
  const queryParams = new URLSearchParams({ limit: 1000, ...params }).toString();
  return apiCall(`/products/vendor/${vendorId}?${queryParams}`);
};

// PRODUCTS (Customer)
export const getFeaturedProducts = async () => {
  return apiCall('/products/featured');
};

export const getFeaturedVendors = async (limit = 10) => {
  return apiCall(`/products/featured-vendors?limit=${limit}`);
};

export const joinWaitlist = async (email) => {
  return apiCall('/waitlist', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const getAllProducts = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  return apiCall(`/products?${queryString}`);
};

export const getProductById = async (id) => {
  return apiCall(`/products/${id}`);
};

// RECIPES
export const saveCustomRecipe = async (recipeData) => {
  return apiCall('/recipes', {
    method: 'POST',
    body: JSON.stringify(recipeData)
  });
};

export const getUserRecipes = async () => {
  return apiCall('/recipes/user');
};

export const getRecipeById = async (id) => {
  return apiCall(`/recipes/${id}`);
};

// ORDERS (Customer)
export const createOrder = async (orderData) => {
  return apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
};

export const getUserOrders = async () => {
  return apiCall('/customers/orders');
};

export const getOrderById = async (id) => {
  return apiCall(`/customers/orders/${id}`);
};

export const cancelOrder = async (id, reason = 'Cancelled by customer') => {
  return apiCall(`/customers/orders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
};

// BOTTOMLESS DRINKS
export const createBottomlessOrder = async (orderData) => {
  return apiCall('/bottomless', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
};

// PAYMENTS
export const createPaymentIntent = async (paymentData) => {
  return apiCall('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
};

export const confirmPayment = async (paymentId, paymentData) => {
  return apiCall(`/payments/${paymentId}/confirm`, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
};

// INVOICES
export const requestInvoice = async (invoiceData) => {
  return apiCall('/invoices/request', {
    method: 'POST',
    body: JSON.stringify(invoiceData)
  });
};

// USER PROFILE - Fetch from backend only (no localStorage guessing)
// Role comes from JWT/profile response, not client-side storage
export const getUserProfile = async () => {
  try {
    // Try unified auth endpoint first (3 second timeout - fast)
    const result = await apiCall('/auth/me', { timeout: 3000 });
    if (result?.success) return result;
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Auth /me endpoint failed, trying /auth/profile...');
  }

  // Fallback: Try standard profile endpoint
  try {
    const result = await apiCall('/auth/profile', { timeout: 3000 });
    if (result?.success) return result;
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Auth /profile endpoint failed:', error.message);
  }

  // Silent fail - don't block UI, let AuthContext handle fallback
  return null;
};

// UPDATE USER PROFILE - Uses general auth endpoint
// Role-specific updates should be handled by role-specific pages calling their own APIs
export const updateUserProfile = async (profileData) => {
  // Use unified profile update endpoint - backend knows user's role from JWT
  return apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};

export const changePassword = async (passwordData) => {
  return apiCall('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify(passwordData)
  });
};

// CUSTOMER ADDRESS MANAGEMENT
export const addCustomerAddress = async (addressData) => {
  return apiCall('/customers/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData)
  });
};

export const updateCustomerAddress = async (addressId, addressData) => {
  return apiCall(`/customers/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData)
  });
};

// Upsert the default delivery address — updates existing default or creates one.
// Called fire-and-forget after checkout so the next visit pre-fills automatically.
export const saveDefaultAddress = async (addressData) => {
  return apiCall('/customers/addresses/save-default', {
    method: 'PUT',
    body: JSON.stringify(addressData)
  });
};

// ADMIN
export const getAdminDashboard = async () => {
  return apiCall('/admin/dashboard');
};

export const getAllUsers = async () => {
  return apiCall('/admin/users');
};

export const getAllOrders = async () => {
  return apiCall('/admin/orders');
};

export const createProductForVendor = async (vendorId, productData) => {
  const isFormData = productData instanceof FormData;

  return apiCall(`/admin/vendors/${vendorId}/products`, {
    method: 'POST',
    body: isFormData ? productData : JSON.stringify(productData),
    timeout: isFormData ? 180000 : 10000
  });
};

export const bulkCreateProductsForVendor = async (vendorId, productsArray) => {
  return apiCall(`/admin/vendors/${vendorId}/products/bulk`, {
    method: 'POST',
    body: JSON.stringify({ products: productsArray })
  });
};

export const deleteProductForVendor = async (vendorId, productId) => {
  return apiCall(`/admin/vendors/${vendorId}/products/${productId}`, {
    method: 'DELETE'
  });
};

export const getProductsByVendor = async (vendorId) => {
  return apiCall(`/products/vendor/${vendorId}`);
};


// Category management
export const getCategories = async () => {
  return apiCall('/admin/categories');
};

export const createCategory = async (name) => {
  return apiCall('/admin/categories', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
};

export const updateCategory = async (categoryId, updates) => {
  return apiCall(`/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
};

export const deactivateCategory = async (categoryId) => {
  return apiCall(`/admin/categories/${categoryId}/deactivate`, {
    method: 'PATCH'
  });
};

// FILE UPLOADS
// FILE UPLOADS
export const uploadImage = async (file, type = 'general') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);

  return apiCall('/upload/image', {
    method: 'POST',
    body: formData
  });
};

export const uploadProductImages = async (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('productImages', file);
  });

  return apiCall('/vendor/upload/images', {
    method: 'POST',
    body: formData
  });
};

// Bulk Operations
export const bulkDeleteProducts = async (data) => {
  return apiCall('/vendor/products/bulk-delete', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const bulkUpdateStatus = async (data) => {
  return apiCall('/vendor/products/bulk-status', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const bulkUpdatePrices = async (data) => {
  return apiCall('/vendor/products/bulk-price', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const bulkUpdateStock = async (data) => {
  return apiCall('/vendor/products/bulk-stock', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// UTILITIES
export const handleApiError = (error) => {
  if (error.message.includes('401') || error.message.includes('Session expired') || error.code === 'AUTH_EXPIRED') {
    // REMOVED: localStorage token deletion
    return 'Please log in to continue';
  }

  if (error.message.includes('403')) return 'You do not have permission to perform this action';
  if (error.message.includes('404')) return 'The requested resource was not found';
  if (error.message.includes('500')) return 'Server error. Please try again later';
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    return 'Network error. Please check your internet connection';
  }

  return error.message || 'An unexpected error occurred';
};

export const showSuccessMessage = (message, duration = 5000) => {
  const toast = document.createElement('div');
  toast.className = 'toast success-toast';
  toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
};

export const showErrorMessage = (message, duration = 5000) => {
  const toast = document.createElement('div');
  toast.className = 'toast error-toast';
  toast.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
};

export const isAuthenticated = () => {
  // Since tokens are hidden in cookies, we check if the user profile exists in storage
  return !!localStorage.getItem('afrimercato_role');
};
// GROUPED EXPORTS FOR CONVENIENCE
export const authAPI = {
  login: loginUser,
  register: registerUser,
  registerVendor,
  logout: logoutUser,
  refreshToken,
  isAuthenticated,
  me: getUserProfile,
  verifyEmail: (token) => apiCall(`/auth/verify-email?token=${token}`, 'GET')
};

// Delivery Settings
export const getDeliverySettings = async () => {
  return apiCall('/vendor/delivery-settings');
};

export const updateDeliverySettings = async (data) => {
  return apiCall('/vendor/delivery-settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const vendorAPI = {
  getProfile: getVendorProfile,
  updateProfile: setupVendorStore,
  getProducts: getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders: getVendorOrders,
  getOrder: getVendorOrder,
  updateOrderStatus,
  rateRider,
  getDashboardStats: getVendorDashboardStats,
  getChartData: getVendorChartData,
  getSalesReport,
  getInventoryReport,
  getOrdersReport,
  getRevenueReport,
  uploadProductImages,
  bulkDeleteProducts,
  bulkUpdateStatus,
  bulkUpdatePrices,
  bulkUpdateStock,
  getDeliverySettings,
  updateDeliverySettings,
  getEarnings: async () => apiCall('/vendor/dashboard/earnings'),
  getPayouts: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall(`/vendor/dashboard/payouts${qs ? '?' + qs : ''}`);
  },
  requestPayout: async (body) => apiCall('/vendor/dashboard/payouts/request', { method: 'POST', body: JSON.stringify(body) }),
  getVendors: (params = {}) => {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
    )
    const qs = new URLSearchParams(filtered).toString()
    return apiCall(`/vendor${qs ? '?' + qs : ''}`)
  },
  getNearbyVendors: (lat, lng, radius = 50) => {
    if (!lat || !lng) {
      return apiCall('/vendor/nearby');
    }
    const params = new URLSearchParams({ lat, lng, radius }).toString();
    return apiCall(`/vendor/nearby?${params}`);
  },
  getFeaturedVendors: (limit = 8) => apiCall(`/vendor/featured?limit=${limit}`),
  getPendingStaff: () => apiCall('/connections/vendor/pending'),
  getActiveStaff: () => apiCall('/connections/vendor/active'),
  approveStaff: (staffId) => apiCall(`/connections/vendor/approve/${staffId}`, { method: 'POST' }),
  assignOrder: (orderId, pickerId) => apiCall(`/vendor/orders/${orderId}/assign-picker`, {
    method: 'POST',
    body: JSON.stringify({ pickerId })
  }),
  verifyPickupPin: (orderId, pin) => apiCall(`/vendor/orders/${orderId}/verify-pickup`, {
    method: 'POST',
    body: JSON.stringify({ pin })
  }),
};

// =================================================================
// CUSTOMER ENDPOINTS
// =================================================================

export const getCustomerDashboardStats = async () => {
  return apiCall('/customers/dashboard/stats');
};

export const getCustomerRecentOrders = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/customers/orders/recent?${queryString}`);
};

export const getRecommendedProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/customers/products/recommended?${queryString}`);
};

export const getWishlist = async () => {
  return apiCall('/customers/wishlist');
};

export const addToWishlist = async (productId) => {
  return apiCall('/customers/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId })
  });
};

export const removeFromWishlist = async (productId) => {
  return apiCall(`/customers/wishlist/${productId}`, {
    method: 'DELETE'
  });
};

export const customerAPI = {
  getDashboardStats: getCustomerDashboardStats,
  getRecentOrders: getCustomerRecentOrders,
  getRecommendedProducts,
  getWishlist,
  addToWishlist,
  removeFromWishlist
};

export const productAPI = {
  getFeatured: getFeaturedProducts,
  getFeaturedVendors,
  getAll: getAllProducts,
  getById: getProductById
};

export const orderAPI = {
  create: createOrder,
  getUserOrders,
  getById: getOrderById,
  cancel: cancelOrder
};

// =================================================================
// CART ENDPOINTS (Backend Sync)
// =================================================================

export const getBackendCart = async () => {
  return apiCall('/cart');
};

export const addToBackendCart = async (productId, quantity = 1) => {
  return apiCall('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  });
};

export const updateBackendCartItem = async (itemId, quantity) => {
  return apiCall(`/cart/update/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
};

export const removeFromBackendCart = async (itemId) => {
  return apiCall(`/cart/remove/${itemId}`, {
    method: 'DELETE'
  });
};

export const clearBackendCart = async () => {
  return apiCall('/cart/clear', {
    method: 'POST'
  });
};

export const syncCartToBackend = async (cartItems) => {
  // Clear backend cart first, then add all items
  await clearBackendCart();
  for (const item of cartItems) {
    await addToBackendCart(item._id, item.quantity);
  }
};

export const setRepurchaseSchedule = async (frequency) => {
  return apiCall('/cart/repurchase-schedule', {
    method: 'POST',
    body: JSON.stringify({ frequency })
  });
};

export const getRepurchaseSchedule = async () => {
  return apiCall('/cart/repurchase-schedule');
};

export const cartAPI = {
  get: getBackendCart,
  add: addToBackendCart,
  update: updateBackendCartItem,
  remove: removeFromBackendCart,
  clear: clearBackendCart,
  sync: syncCartToBackend,
  setRepurchaseSchedule,
  getRepurchaseSchedule
};

// =================================================================
// REVIEW ENDPOINTS
// =================================================================

export const submitReview = async (reviewData) => {
  return apiCall('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  });
};

export const getProductReviews = async (productId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/reviews/product/${productId}?${queryString}`);
};

export const getMyReviews = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/reviews/my-reviews?${queryString}`);
};

export const updateReview = async (reviewId, reviewData) => {
  return apiCall(`/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData)
  });
};

export const deleteReview = async (reviewId) => {
  return apiCall(`/reviews/${reviewId}`, {
    method: 'DELETE'
  });
};

export const markReviewHelpful = async (reviewId) => {
  return apiCall(`/reviews/${reviewId}/helpful`, {
    method: 'POST'
  });
};

export const canReviewProduct = async (productId) => {
  return apiCall(`/reviews/can-review/${productId}`);
};

export const toggleRepeatOrder = (orderId, frequency) =>
  apiCall(`/customers/orders/${orderId}/repeat`, { method: 'POST', body: JSON.stringify({ frequency }) });

export const reviewAPI = {
  submit: submitReview,
  getForProduct: getProductReviews,
  getMine: getMyReviews,
  update: updateReview,
  delete: deleteReview,
  markHelpful: markReviewHelpful,
  canReview: canReviewProduct,
  vendorReply: (reviewId, comment) =>
    apiCall(`/reviews/${reviewId}/vendor-reply`, { method: 'PUT', body: JSON.stringify({ comment }) })
};

// =================================================================
// REFUND ENDPOINTS
// =================================================================

export const requestRefund = async (orderId, data) => {
  return apiCall(`/payments/refund/${orderId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const refundAPI = {
  request: requestRefund
};

// =================================================================
// CHECKOUT ENDPOINTS (with resilient timeouts)
// =================================================================

export const initializeCheckoutPayment = async (orderData) => {
  return apiCall('/checkout/payment/initialize', {
    method: 'POST',
    body: JSON.stringify(orderData),
    timeout: 8000 // 8s max — Stripe may cold-start but checkout must not hang
  });
};

export const getRepurchaseItems = async () => {
  return apiCall('/checkout/orders', {
    timeout: 6000 // 6s — repurchase is optional, must never block checkout
  });
};

export const checkoutAPI = {
  initializePayment: initializeCheckoutPayment,
  getRepurchaseItems
};

// PRIVACY / GDPR
export const exportMyData = async () => {
  return apiCall('/privacy/my-data/export', { method: 'POST' });
};

export const requestAccountDeletion = async () => {
  return apiCall('/privacy/request-deletion', { method: 'POST' });
};

export const submitPrivacyComplaint = async (message) => {
  return apiCall('/privacy/complaint', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
};

export const userAPI = {
  getProfile: getUserProfile,
  updateProfile: updateUserProfile,
  changePassword,
  addAddress: addCustomerAddress,
  updateAddress: updateCustomerAddress,
  saveDefaultAddress,
  exportMyData,
  requestAccountDeletion,
  submitPrivacyComplaint
};

export const subscriptionAPI = {
  getPlans: getSubscriptionPlans,
  subscribe: createSubscription,
  getMySubscription: getUserSubscription,
  cancel: cancelSubscription
};

export const locationAPI = {
  searchVendors: searchVendorsByLocation,
  geocode: geocodeLocation
};

export const vendorsAPI = {
  getById: getVendorById,
  getBySlug: getVendorBySlug,
  getProducts: getVendorProductsByVendorId
};

// =================================================================
// NOTIFICATION ENDPOINTS
// =================================================================

export const getNotifications = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/notifications?${queryString}`);
};

export const getUnreadNotificationCount = async () => {
  return apiCall('/notifications/unread-count');
};

export const markNotificationAsRead = async (id) => {
  return apiCall(`/notifications/${id}/read`, {
    method: 'PUT'
  });
};

export const markAllNotificationsAsRead = async () => {
  return apiCall('/notifications/mark-all-read', {
    method: 'PUT'
  });
};

export const deleteNotification = async (id) => {
  return apiCall(`/notifications/${id}`, {
    method: 'DELETE'
  });
};

export const deleteAllReadNotifications = async () => {
  return apiCall('/notifications', {
    method: 'DELETE'
  });
};

export const notificationAPI = {
  getNotifications,
  getUnreadCount: getUnreadNotificationCount,
  markAsRead: markNotificationAsRead,
  markAllAsRead: markAllNotificationsAsRead,
  deleteNotification,
  deleteAllRead: deleteAllReadNotifications
};

export default {
  authAPI,
  vendorAPI,
  customerAPI,
  productAPI,
  orderAPI,
  userAPI,
  subscriptionAPI,
  locationAPI,
  vendorsAPI,
  notificationAPI
};