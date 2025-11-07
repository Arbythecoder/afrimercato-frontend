// API Base URL - uses environment variable or auto-detects
const API_BASE_URL = (() => {
  // First priority: Use environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Second priority: Auto-detect based on hostname
  const isLocalhost = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('192.168');

  if (isLocalhost) {
    return 'http://localhost:5000/api';
  }

  // Production: Your Railway backend
  return 'https://afrimercato-backend-production-0329.up.railway.app/api';
})();

console.log('🔗 API Base URL:', API_BASE_URL);

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    };

    const token = localStorage.getItem('afrimercato_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem('afrimercato_token');
        throw new Error('Session expired. Please log in again.');
      }

      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ API Error (${endpoint}):`, error);
    throw error;
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
  }
  
  return response;
};

export const logoutUser = async () => {
  try {
    await apiCall('/auth/logout', {
      method: 'POST'
    });
  } finally {
    localStorage.removeItem('afrimercato_token');
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
  return apiCall(`/vendors/${id}`);
};

export const getVendorProductsByVendorId = async (vendorId) => {
  return apiCall(`/vendors/${vendorId}/products`);
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

// USER PROFILE
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
  getDashboardStats: getVendorDashboardStats,
  getChartData: getVendorChartData,
  getSalesReport,
  getInventoryReport,
  getOrdersReport,
  getRevenueReport
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

export default {
  authAPI,
  vendorAPI,
  productAPI,
  orderAPI,
  userAPI,
  subscriptionAPI,
  locationAPI,
  vendorsAPI
};