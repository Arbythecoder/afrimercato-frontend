// API Base URL - uses environment variable or auto-detects
const API_BASE_URL = "https://afrimercato-backend.fly.dev/api";

console.log('🔗 API Base URL:', API_BASE_URL);

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
  const refreshToken = localStorage.getItem('afrimercato_refresh_token');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Use AbortController to enforce a timeout on token refresh
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    if (data.success && data.data?.token) {
      localStorage.setItem('afrimercato_token', data.data.token);
      return data.data.token;
    }

    throw new Error('Invalid refresh response');
  } catch (error) {
    // Refresh failed - clear all tokens and redirect to login
    localStorage.removeItem('afrimercato_token');
    localStorage.removeItem('afrimercato_refresh_token');
    throw error;
  }
};

// Generic API call function with automatic token refresh
const apiCall = async (endpoint, options = {}, isRetry = false) => {
  // Enforce a request timeout using AbortController to avoid hanging the UI
  const controller = new AbortController();
  const timeoutMs = typeof options.timeout === 'number' ? options.timeout : 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        ...options.headers
      },
      credentials: 'include',
      signal: controller.signal,
      ...options
    };

    // Only add Content-Type: application/json if body is NOT FormData
    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('afrimercato_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('🌐 Fetching:', url);

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle 401 - Token expired or invalid
      if (response.status === 401 && !isRetry) {
        if (errorData.errorCode === 'TOKEN_EXPIRED' || errorData.errorCode === 'INVALID_TOKEN') {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
            .then(token => apiCall(endpoint, options, true))
            .catch(err => { throw err; });
          }

          isRefreshing = true;

          try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);
            isRefreshing = false;
            return apiCall(endpoint, options, true);
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;
            window.location.href = '/login';
            throw new Error('Session expired. Please log in again.');
          }
        }
      }

      if (response.status === 401) {
        localStorage.removeItem('afrimercato_token');
        localStorage.removeItem('afrimercato_refresh_token');
        throw new Error('Session expired. Please log in again.');
      }

      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Normalize AbortError message
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    console.error(`❌ API Error (${endpoint}):`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// AUTHENTICATION
export const loginUser = async (credentials) => {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

  if (response.success && response.data?.token) {
    localStorage.setItem('afrimercato_token', response.data.token);

    // Store refresh token if provided
    if (response.data.refreshToken) {
      localStorage.setItem('afrimercato_refresh_token', response.data.refreshToken);
    }
  }

  return response;
};

export const registerUser = async (userData) => {
  const response = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

  if (response.success && response.data?.token) {
    localStorage.setItem('afrimercato_token', response.data.token);

    // Store refresh token if provided
    if (response.data.refreshToken) {
      localStorage.setItem('afrimercato_refresh_token', response.data.refreshToken);
    }
  }

  return response;
};

export const logoutUser = async () => {
  try {
    await apiCall('/auth/logout', {
      method: 'POST'
    });
  } finally {
    // Clear both tokens
    localStorage.removeItem('afrimercato_token');
    localStorage.removeItem('afrimercato_refresh_token');
    window.location.href = '/login';
  }
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

export const updateVendorProfile = async (profileData) => {
  return apiCall('/vendor/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};

export const createVendorProfile = async (profileData) => {
  return apiCall('/vendor/profile', {
    method: 'POST',
    body: JSON.stringify(profileData)
  });
};

export const getVendorProducts = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  return apiCall(`/vendor/products?${queryString}`);
};

export const createProduct = async (productData) => {
  // Use apiCall for automatic token refresh and proper error handling
  const isFormData = productData instanceof FormData;

  return apiCall('/vendor/products', {
    method: 'POST',
    body: isFormData ? productData : JSON.stringify(productData)
  });
};

export const updateProduct = async (productId, productData) => {
  // Use apiCall for automatic token refresh and proper error handling
  const isFormData = productData instanceof FormData;

  return apiCall(`/vendor/products/${productId}`, {
    method: 'PUT',
    body: isFormData ? productData : JSON.stringify(productData)
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
    method: 'PUT',
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
  const params = new URLSearchParams({ location, radius });
  return apiCall(`/location/search-vendors?${params}`);
};

export const geocodeLocation = async (query) => {
  const params = new URLSearchParams({ query });
  return apiCall(`/location/geocode?${params}`);
};

// VENDORS (Customer)
export const getVendorById = async (id) => {
  return apiCall(`/location/vendor/${id}`);
};

export const getVendorProductsByVendorId = async (vendorId) => {
  return apiCall(`/products/vendor/${vendorId}`);
};

// PRODUCTS (Customer)
export const getFeaturedProducts = async () => {
  return apiCall('/products/featured');
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
  return apiCall('/orders/user');
};

export const getOrderById = async (id) => {
  return apiCall(`/orders/${id}`);
};

export const cancelOrder = async (id) => {
  return apiCall(`/orders/${id}/cancel`, {
    method: 'PATCH'
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

// USER PROFILE - Intelligent wrapper that handles all roles
// Automatically routes to the correct endpoint based on user role
export const getUserProfile = async () => {
  try {
    // Try unified auth endpoint first (3 second timeout - fast)
    const result = await apiCall('/auth/me', { timeout: 3000 });
    if (result?.success) return result;
  } catch (error) {
    console.warn('Auth /me endpoint failed, trying role-specific endpoints...');
  }

  // Fallback: Try role-specific endpoints
  const userRole = localStorage.getItem('userRole') || localStorage.getItem('afrimercato_user_role');
  
  try {
    if (userRole === 'vendor') {
      return await apiCall('/vendor/profile', { timeout: 3000 });
    } else if (userRole === 'customer') {
      return await apiCall('/customers/dashboard/stats', { timeout: 3000 });
    } else if (userRole === 'rider') {
      return await apiCall('/rider/profile', { timeout: 3000 });
    } else if (userRole === 'picker') {
      return await apiCall('/picker/profile', { timeout: 3000 });
    }
  } catch (error) {
    console.warn(`Failed to fetch ${userRole} profile:`, error.message);
  }

  // Silent fail - don't block UI
  return null;
};

// UPDATE USER PROFILE - Intelligent wrapper for all roles
// Automatically routes update to correct endpoint based on role
export const updateUserProfile = async (profileData) => {
  const userRole = localStorage.getItem('userRole') || localStorage.getItem('afrimercato_user_role');

  // Route to role-specific update endpoint
  if (userRole === 'vendor') {
    return updateVendorProfile(profileData);
  } else if (userRole === 'customer') {
    // Customer profile updates go to general endpoint
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  } else if (userRole === 'rider') {
    return apiCall('/rider/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  } else if (userRole === 'picker') {
    return apiCall('/picker/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Default fallback to general auth endpoint
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

// FILE UPLOADS
export const uploadImage = async (file, type = 'general') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);

  const token = localStorage.getItem('afrimercato_token');

  return apiCall('/upload/image', {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: formData
  });
};

export const uploadProductImages = async (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('productImages', file);
  });

  const token = localStorage.getItem('afrimercato_token');

  return apiCall('/vendor/upload/images', {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    },
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
  if (error.message.includes('401') || error.message.includes('Session expired')) {
    localStorage.removeItem('afrimercato_token');
    window.location.href = '/login';
    return 'Please log in to continue';
  }
  
  if (error.message.includes('403')) {
    return 'You do not have permission to perform this action';
  }
  
  if (error.message.includes('404')) {
    return 'The requested resource was not found';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later';
  }
  
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
  return !!localStorage.getItem('afrimercato_token');
};

export const getAuthToken = () => {
  return localStorage.getItem('afrimercato_token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('afrimercato_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('afrimercato_token');
  localStorage.removeItem('afrimercato_refresh_token');
};

// GROUPED EXPORTS FOR CONVENIENCE
export const authAPI = {
  login: loginUser,
  register: registerUser,
  logout: logoutUser,
  refreshToken,
  isAuthenticated,
  getAuthToken,
  setAuthToken,
  clearAuthToken
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
  updateProfile: updateVendorProfile,
  createProfile: createVendorProfile,
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
  updateDeliverySettings
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
  getAll: getAllProducts,
  getById: getProductById
};

export const orderAPI = {
  create: createOrder,
  getUserOrders,
  getById: getOrderById,
  cancel: cancelOrder
};

export const userAPI = {
  getProfile: getUserProfile,
  updateProfile: updateUserProfile,
  changePassword
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