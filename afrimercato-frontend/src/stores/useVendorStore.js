import { create } from 'zustand'
import { apiCall } from '../services/api'

const useVendorStore = create((set, get) => ({
  // State
  products: [],
  orders: [],
  stats: null,
  profile: null,
  loading: { products: false, orders: false, stats: false, profile: false },
  error: { products: null, orders: null, stats: null, profile: null },

  // Actions
  fetchProducts: async () => {
    if (get().loading.products) return
    set(s => ({ loading: { ...s.loading, products: true }, error: { ...s.error, products: null } }))
    try {
      const res = await apiCall('/vendor/products')
      if (res?.success) set({ products: res.data || [] })
      else set(s => ({ error: { ...s.error, products: res?.message || 'Failed to load products' } }))
    } catch (e) {
      set(s => ({ error: { ...s.error, products: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, products: false } }))
    }
  },

  fetchOrders: async () => {
    if (get().loading.orders) return
    set(s => ({ loading: { ...s.loading, orders: true }, error: { ...s.error, orders: null } }))
    try {
      const res = await apiCall('/vendor/orders')
      if (res?.success) set({ orders: res.data || [] })
      else set(s => ({ error: { ...s.error, orders: res?.message || 'Failed to load orders' } }))
    } catch (e) {
      set(s => ({ error: { ...s.error, orders: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, orders: false } }))
    }
  },

  fetchStats: async () => {
    if (get().loading.stats) return
    set(s => ({ loading: { ...s.loading, stats: true }, error: { ...s.error, stats: null } }))
    try {
      const res = await apiCall('/vendor/dashboard/stats')
      if (res?.success) set({ stats: res.data })
      else set(s => ({ error: { ...s.error, stats: res?.message || 'Failed to load stats' } }))
    } catch (e) {
      set(s => ({ error: { ...s.error, stats: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, stats: false } }))
    }
  },

  fetchProfile: async () => {
    if (get().loading.profile) return
    set(s => ({ loading: { ...s.loading, profile: true }, error: { ...s.error, profile: null } }))
    try {
      const res = await apiCall('/vendor/profile')
      if (res?.success) set({ profile: res.data })
      else set(s => ({ error: { ...s.error, profile: res?.message || 'Failed to load profile' } }))
    } catch (e) {
      set(s => ({ error: { ...s.error, profile: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, profile: false } }))
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const res = await apiCall(`/vendor/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      if (res?.success) {
        set(s => ({
          orders: s.orders.map(o => o._id === orderId ? { ...o, status } : o)
        }))
      }
      return res
    } catch (e) {
      return { success: false, message: e.message }
    }
  },

  addProduct: (product) => set(s => ({ products: [product, ...s.products] })),
  removeProduct: (id) => set(s => ({ products: s.products.filter(p => p._id !== id) })),
  updateProduct: (id, updates) => set(s => ({
    products: s.products.map(p => p._id === id ? { ...p, ...updates } : p)
  })),

  reset: () => set({
    products: [], orders: [], stats: null, profile: null,
    loading: { products: false, orders: false, stats: false, profile: false },
    error: { products: null, orders: null, stats: null, profile: null }
  })
}))

export default useVendorStore
