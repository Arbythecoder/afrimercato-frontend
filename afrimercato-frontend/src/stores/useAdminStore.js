import { create } from 'zustand'
import { apiCall } from '../services/api'

const useAdminStore = create((set, get) => ({
  // State
  vendors: [],
  customers: [],
  riders: [],
  pickers: [],
  analytics: null,
  loading: { vendors: false, customers: false, riders: false, pickers: false, analytics: false },
  error: { vendors: null, customers: null, riders: null, pickers: null, analytics: null },

  fetchVendors: async (params = {}) => {
    if (get().loading.vendors) return
    set(s => ({ loading: { ...s.loading, vendors: true }, error: { ...s.error, vendors: null } }))
    try {
      const query = new URLSearchParams(params).toString()
      const res = await apiCall(`/admin/vendors${query ? '?' + query : ''}`)
      if (res?.success) set({ vendors: res.data?.vendors || res.data || [] })
      else set(s => ({ error: { ...s.error, vendors: res?.message || 'Failed to load vendors' } }))
    } catch (e) {
      set(s => ({ error: { ...s.error, vendors: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, vendors: false } }))
    }
  },

  fetchCustomers: async (params = {}) => {
    if (get().loading.customers) return
    set(s => ({ loading: { ...s.loading, customers: true }, error: { ...s.error, customers: null } }))
    try {
      const query = new URLSearchParams(params).toString()
      const res = await apiCall(`/admin/customers${query ? '?' + query : ''}`)
      if (res?.success) set({ customers: res.data?.customers || res.data || [] })
      else set(s => ({ error: { ...s.error, customers: res?.message || 'Failed to load customers' } }))
    } catch (e) {
      set(s => ({ error: { ...s.error, customers: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, customers: false } }))
    }
  },

  fetchRiders: async () => {
    if (get().loading.riders) return
    set(s => ({ loading: { ...s.loading, riders: true }, error: { ...s.error, riders: null } }))
    try {
      const res = await apiCall('/admin/riders')
      if (res?.success) set({ riders: res.data || [] })
      else set(s => ({ error: { ...s.error, riders: res?.message || 'Failed to load riders' } }))
    } catch (e) {
      set(s => ({ error: { ...s.error, riders: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, riders: false } }))
    }
  },

  fetchPickers: async () => {
    if (get().loading.pickers) return
    set(s => ({ loading: { ...s.loading, pickers: true }, error: { ...s.error, pickers: null } }))
    try {
      const res = await apiCall('/admin/pickers')
      if (res?.success) set({ pickers: res.data || [] })
      else set(s => ({ error: { ...s.error, pickers: res?.message || 'Failed to load pickers' } }))
    } catch (e) {
      set(s => ({ error: { ...s.error, pickers: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, pickers: false } }))
    }
  },

  fetchAnalytics: async (range = '30d') => {
    if (get().loading.analytics) return
    set(s => ({ loading: { ...s.loading, analytics: true }, error: { ...s.error, analytics: null } }))
    try {
      const res = await apiCall(`/admin/analytics?range=${range}`)
      if (res?.success) set({ analytics: res.data })
      else set(s => ({ error: { ...s.error, analytics: res?.message || 'Failed to load analytics' } }))
    } catch (e) {
      set(s => ({ error: { ...s.error, analytics: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, analytics: false } }))
    }
  },

  approveVendor: async (vendorId) => {
    try {
      const res = await apiCall(`/admin/vendors/${vendorId}/approve`, { method: 'PATCH' })
      if (res?.success) {
        set(s => ({
          vendors: s.vendors.map(v => v._id === vendorId ? { ...v, isApproved: true, status: 'active' } : v)
        }))
      }
      return res
    } catch (e) {
      return { success: false, message: e.message }
    }
  },

  suspendVendor: async (vendorId) => {
    try {
      const res = await apiCall(`/admin/vendors/${vendorId}/suspend`, { method: 'PATCH' })
      if (res?.success) {
        set(s => ({
          vendors: s.vendors.map(v => v._id === vendorId ? { ...v, status: 'suspended' } : v)
        }))
      }
      return res
    } catch (e) {
      return { success: false, message: e.message }
    }
  },

  reset: () => set({
    vendors: [], customers: [], riders: [], pickers: [], analytics: null,
    loading: { vendors: false, customers: false, riders: false, pickers: false, analytics: false },
    error: { vendors: null, customers: null, riders: null, pickers: null, analytics: null }
  })
}))

export default useAdminStore
