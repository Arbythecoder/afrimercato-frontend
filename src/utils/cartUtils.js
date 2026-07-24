/**
 * Centralized Cart Utilities & Single Source of Truth
 * 
 * Provides consistent calculation logic for cart item count, subtotal, 
 * and synchronized storage events across all pages and components.
 */

const CART_STORAGE_KEY = 'afrimercato_cart'

/**
 * Calculates total item count (sum of quantities) in a cart array.
 * @param {Array} cart 
 * @returns {number} Total unit count in cart
 */
export function getCartCount(cart) {
  if (!Array.isArray(cart) || cart.length === 0) return 0
  return cart.reduce((sum, item) => {
    const qty = parseInt(item.quantity || 1, 10)
    return sum + (isNaN(qty) || qty < 1 ? 1 : qty)
  }, 0)
}

/**
 * Calculates total monetary subtotal for a cart array.
 * @param {Array} cart 
 * @returns {number} Subtotal amount
 */
export function getCartSubtotal(cart) {
  if (!Array.isArray(cart) || cart.length === 0) return 0
  return cart.reduce((sum, item) => {
    const price = parseFloat(item.price || 0)
    const qty = parseInt(item.quantity || 1, 10)
    const validQty = isNaN(qty) || qty < 1 ? 1 : qty
    return sum + (isNaN(price) ? 0 : price * validQty)
  }, 0)
}

/**
 * Safely retrieves and parses the cart array from localStorage.
 * @returns {Array} Cart items array
 */
export function getCartFromStorage() {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (_err) {
    return []
  }
}

/**
 * Saves cart array to localStorage and dispatches global 'cartUpdated' event.
 * @param {Array} cart 
 */
export function saveCartToStorage(cart) {
  if (typeof window === 'undefined') return
  try {
    const validCart = Array.isArray(cart) ? cart : []
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validCart))
    window.dispatchEvent(new Event('cartUpdated'))
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err)
  }
}
