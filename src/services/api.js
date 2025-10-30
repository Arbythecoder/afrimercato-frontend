// =================================================================
// API CONFIGURATION - Updated for Railway Backend + Netlify Frontend
// =================================================================
// File: src/services/api.js (or wherever your current api file is)

// =================================================================
// STEP 1: UPDATE API_BASE_URL
// =================================================================
// API Base URL - uses environment variable or auto-detects
const API_BASE_URL = (() => {
  // First priority: Use environment variable if set (for Netlify/Vercel)
  if (import.meta.env.VITE_API_URL) {
    console.log('🔗 Using VITE_API_URL from environment:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // Second priority: Auto-detect based on hostname
  const isLocalhost = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('192.168');

  if (isLocalhost) {
    console.log('🔗 Running on localhost, using local backend');
    return 'http://localhost:5000/api';
  }

  // Fallback: Production Railway backend
  console.log('🔗 Using production Railway backend');
  return 'https://afrimercato-backend-production-0329.up.railway.app/api';
})();

// Log current API URL (helpful for debugging)
console.log('🔗 Final API Base URL:', API_BASE_URL);
console.log('🌍 Current hostname:', window.location.hostname);

// =================================================================
// STEP 2: UPDATE apiCall function with better error handling
// =================================================================
// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include', // ✅ ADDED: Important for cookies/sessions
      ...options
    };

    // Add auth token if available
    const token = localStorage.getItem('afrimercato_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, config);
    
    // ✅ IMPROVED: Better error handling
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific status codes
      if (response.status === 401) {
        // Unauthorized - clear token but DON'T redirect (let component handle it)
        localStorage.removeItem('afrimercato_token');
        throw new Error('Session expired. Please log in again.');
      }

      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error(`❌ API Error (${endpoint}):`, error);
    throw error;
  }
};

// =================================================================
// AUTHENTICATION ENDPOINTS
// =================================================================
export const loginUser = async (credentials) => {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  
  // ✅ ADDED: Save token after successful login
  if (response.success && response.data?.token) {
    localStorage.setItem('afrimercato_token', response.data.token);
  }
  
  return response;
};

export const registerUser = async (userData) => {
  const response = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  
  // ✅ ADDED: Save token after successful registration
  if (response.success && response.data?.token) {
    localStorage.setItem('afrimercato_token', response.data.token);
  }
  
  return response;
};

export const logoutUser = async () => {
  try {
    await apiCall('/auth/logout', {
      method: 'POST'
    });
  } finally {
    // Always clear token, even if API call fails
    localStorage.removeItem('afrimercato_token');
    window.location.href = '/login';
  }
};

export const refreshToken = async () => {
  return apiCall('/auth/refresh', {
    method: 'POST'
  });
};

// =================================================================
// VENDOR ENDPOINTS (✅ NEW - Added for your vendor dashboard)
// =================================================================
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
  return apiCall('/vendor/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
};

export const updateProduct = async (productId, productData) => {
  return apiCall(`/vendor/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
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

export const getVendorDashboardStats = async () => {
  return apiCall('/vendor/dashboard/stats');
};

export const getVendorChartData = async (timeRange = '7d') => {
  return apiCall(`/vendor/dashboard/chart-data?timeRange=${timeRange}`);
};

// =================================================================
// SUBSCRIPTION ENDPOINTS
// =================================================================
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

// =================================================================
// CONTACT & SUPPORT
// =================================================================
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

// =================================================================
// EVENTS
// =================================================================
export const bookEvent = async (eventData) => {
  return apiCall('/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  });
};

export const getEvents = async () => {
  return apiCall('/events');
};

// =================================================================
// PRODUCTS (Customer-facing)
// =================================================================
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

// =================================================================
// RECIPES
// =================================================================
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

// =================================================================
// ORDERS (Customer-facing)
// =================================================================
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

// =================================================================
// BOTTOMLESS DRINKS
// =================================================================
export const createBottomlessOrder = async (orderData) => {
  return apiCall('/bottomless', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
};

// =================================================================
// PAYMENTS
// =================================================================
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

// =================================================================
// INVOICES
// =================================================================
export const requestInvoice = async (invoiceData) => {
  return apiCall('/invoices/request', {
    method: 'POST',
    body: JSON.stringify(invoiceData)
  });
};

// =================================================================
// USER PROFILE
// =================================================================
export const getUserProfile = async () => {
  return apiCall('/users/profile');
};

export const updateUserProfile = async (profileData) => {
  return apiCall('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData)
  });
};

export const changePassword = async (passwordData) => {
  return apiCall('/users/change-password', {
    method: 'PATCH',
    body: JSON.stringify(passwordData)
  });
};

// =================================================================
// ADMIN
// =================================================================
export const getAdminDashboard = async () => {
  return apiCall('/admin/dashboard');
};

export const getAllUsers = async () => {
  return apiCall('/admin/users');
};

export const getAllOrders = async () => {
  return apiCall('/admin/orders');
};

// =================================================================
// FILE UPLOADS
// =================================================================
export const uploadImage = async (file, type = 'general') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);

  const token = localStorage.getItem('afrimercato_token');

  return apiCall('/upload/image', {
    method: 'POST',
    headers: {
      // Don't set Content-Type for FormData - browser sets it automatically
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: formData
  });
};

// ✅ NEW: Upload multiple product images (for vendor)
export const uploadProductImages = async (files) => {
  const formData = new FormData();
  
  // Add multiple files
  files.forEach((file, index) => {
    formData.append('images', file);
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

// =================================================================
// UTILITIES
// =================================================================

// ✅ IMPROVED: Error handling utility
export const handleApiError = (error) => {
  console.error('Handling API Error:', error);

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
  
  // Network errors
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    return 'Network error. Please check your internet connection';
  }
  
  return error.message || 'An unexpected error occurred';
};

// Success message utility
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

// Error message utility
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

// ✅ NEW: Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('afrimercato_token');
};

// ✅ NEW: Get current user token
export const getAuthToken = () => {
  return localStorage.getItem('afrimercato_token');
};

// ✅ NEW: Set auth token
export const setAuthToken = (token) => {
  localStorage.setItem('afrimercato_token', token);
};

// ✅ NEW: Clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('afrimercato_token');
};

// =================================================================
// GROUPED EXPORTS FOR BACKWARDS COMPATIBILITY
// =================================================================
// Some components expect grouped API objects instead of individual exports

// Authentication API
export const authAPI = {
  login: loginUser,
  register: registerUser,
  logout: logoutUser,
  getProfile: getUserProfile,
  refreshToken: refreshToken
};

// Vendor API
export const vendorAPI = {
  getProfile: getVendorProfile,
  updateProfile: updateVendorProfile,
  createProfile: createVendorProfile,
  getProducts: getVendorProducts,
  createProduct: createProduct,
  updateProduct: updateProduct,
  deleteProduct: deleteProduct,
  getOrders: getVendorOrders,
  getOrder: getVendorOrder,
  updateOrderStatus: updateOrderStatus,
  getDashboardStats: getVendorDashboardStats,
  getChartData: getVendorChartData
};

// Product API (customer-facing)
export const productAPI = {
  getFeatured: getFeaturedProducts,
  getAll: getAllProducts,
  getById: getProductById
};

// Subscription API
export const subscriptionAPI = {
  getPlans: getSubscriptionPlans,
  subscribe: createSubscription,
  getMySubscription: getUserSubscription,
  cancel: cancelSubscription
};

// Order API (customer-facing)
export const orderAPI = {
  create: createOrder,
  getUserOrders: getUserOrders,
  getById: getOrderById,
  cancel: cancelOrder
};