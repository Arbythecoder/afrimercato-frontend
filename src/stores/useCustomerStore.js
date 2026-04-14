import { create } from 'zustand'
import { apiCall } from '../services/api'

const CART_KEY = 'afrimercato_cart'

const loadCartFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch (_e) {
    return []
  }
}

const useCustomerStore = create((set, get) => ({
  // State
  cart: loadCartFromStorage(),
  orders: [],
  stores: [],
  loading: { orders: false, stores: false },
  error: { orders: null, stores: null },

  // Cart actions
  addToCart: (item) => {
    const cart = get().cart
    const existing = cart.find(i => i._id === item._id && i.vendorId === item.vendorId)
    const updated = existing
      ? cart.map(i => i._id === item._id && i.vendorId === item.vendorId
          ? { ...i, quantity: i.quantity + (item.quantity || 1) }
          : i)
      : [...cart, { ...item, quantity: item.quantity || 1 }]
    localStorage.setItem(CART_KEY, JSON.stringify(updated))
    set({ cart: updated })
  },

  removeFromCart: (itemId, vendorId) => {
    const updated = get().cart.filter(i => !(i._id === itemId && i.vendorId === vendorId))
    localStorage.setItem(CART_KEY, JSON.stringify(updated))
    set({ cart: updated })
  },

  updateCartQuantity: (itemId, vendorId, quantity) => {
    const updated = quantity <= 0
      ? get().cart.filter(i => !(i._id === itemId && i.vendorId === vendorId))
      : get().cart.map(i => i._id === itemId && i.vendorId === vendorId ? { ...i, quantity } : i)
    localStorage.setItem(CART_KEY, JSON.stringify(updated))
    set({ cart: updated })
  },

  clearCart: () => {
    localStorage.removeItem(CART_KEY)
    set({ cart: [] })
  },

  cartTotal: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
  cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

  // Orders
  fetchOrders: async () => {
    if (get().loading.orders) return
    set(s => ({ loading: { ...s.loading, orders: true }, error: { ...s.error, orders: null } }))
    try {
      const res = await apiCall('/customer/orders')
      if (res?.success) set({ orders: res.data || [] })
      else set(s => ({ error: { ...s.error, orders: res?.message || 'Failed to load orders' } }))
    } catch (e) {
      set(s => ({ error: { ...s.error, orders: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, orders: false } }))
    }
  },

  // Stores — uses same endpoint as homepage (/products/featured-vendors) so data is always in sync
  fetchStores: async (location = '') => {
    if (get().loading.stores) return
    set(s => ({ loading: { ...s.loading, stores: true }, error: { ...s.error, stores: null } }))
    try {
      const res = await apiCall('/products/featured-vendors?limit=50')
      if (res?.success) {
        let rawVendors = res.data?.vendors || res.data || []

        // Client-side location filter when a location is specified
        if (location) {
          const loc = location.toLowerCase()
          rawVendors = rawVendors.filter(v =>
            (v.address?.city || v.location || '').toLowerCase().includes(loc) ||
            (v.storeName || v.businessName || v.name || '').toLowerCase().includes(loc)
          )
        }

        const vendors = rawVendors.map(v => ({
          _id: v._id,
          id: v._id,
          name: v.storeName || v.businessName || v.name,
          location: v.address?.city || v.location || 'Unknown',
          category: v.category || 'groceries',
          rating: v.rating || 0,
          slug: v.slug,
          image: v.storeImage || v.logo || v.image || null,
          isOpen: v.isOpen !== false,
          deliveryTime: v.deliveryTime || '30 min',
          deliveryFee: v.deliveryFee || null,
          verified: v.verified !== false
        }))
        set({ stores: vendors })
      } else {
        set(s => ({ error: { ...s.error, stores: res?.message || 'No stores found' } }))
      }
    } catch (e) {
      set(s => ({ error: { ...s.error, stores: e.message } }))
    } finally {
      set(s => ({ loading: { ...s.loading, stores: false } }))
    }
  },

  reset: () => set({
    orders: [], stores: [],
    loading: { orders: false, stores: false },
    error: { orders: null, stores: null }
  })
}))

export default useCustomerStore
