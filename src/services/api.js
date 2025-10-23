import axios from 'axios'

// Use environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('afrimercato_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('afrimercato_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
}

// Vendor APIs
export const vendorAPI = {
  createProfile: (data) => api.post('/vendor/profile', data),
  getProfile: () => api.get('/vendor/profile'),
  updateProfile: (data) => api.put('/vendor/profile', data),
  getDashboardStats: () => api.get('/vendor/dashboard/stats'),
  getChartData: (timeRange) => api.get(`/vendor/dashboard/chart-data`, { params: { timeRange } }),
}

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/vendor/products', { params }),
  getOne: (id) => api.get(`/vendor/products/${id}`),
  create: (data) => api.post('/vendor/products', data),
  update: (id, data) => api.put(`/vendor/products/${id}`, data),
  delete: (id) => api.delete(`/vendor/products/${id}`),
  bulkUpload: (formData) => api.post('/vendor/products/bulk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  // New bulk operation endpoints
  bulkDelete: (productIds) => api.post('/vendor/products/bulk-delete', { productIds }),
  bulkUpdateStatus: (productIds, isActive) => api.post('/vendor/products/bulk-status', { productIds, isActive }),
  bulkUpdatePrices: (productIds, priceChange) => api.post('/vendor/products/bulk-price', { productIds, ...priceChange }),
  bulkUpdateStock: (productIds, stockChange) => api.post('/vendor/products/bulk-stock', { productIds, ...stockChange })
}

// Order APIs
export const orderAPI = {
  getAll: (params) => api.get('/vendor/orders', { params }),
  getOne: (id) => api.get(`/vendor/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/vendor/orders/${id}/status`, { status }),
}

// Subscription APIs
export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMySubscription: () => api.get('/subscriptions/my-subscription'),
  subscribe: (data) => api.post('/subscriptions/subscribe', data),
}

export default api
