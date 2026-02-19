/**
 * Multi-Store Cart Protection Utility
 * Prevents customers from mixing items from different vendors in a single cart
 */

/**
 * Check if adding a product from a different vendor requires cart clearing
 * @param {Object} product - Product to add (must have vendor field)
 * @param {Array} currentCart - Current cart items
 * @returns {Object} { needsConfirmation: boolean, currentVendorId: string, currentVendorName: string, newVendorId: string, newVendorName: string }
 */
export const checkVendorLock = (product, currentCart) => {
  // Feature flag: Multi-vendor cart enabled
  const multiVendorEnabled = import.meta.env.VITE_MULTI_VENDOR_CART === 'true'
  
  if (multiVendorEnabled) {
    // Allow items from multiple vendors
    return { needsConfirmation: false }
  }

  // If cart is empty, no conflict
  if (!currentCart || currentCart.length === 0) {
    return { needsConfirmation: false }
  }

  // Get vendor info from the product being added
  const newVendorId = product.vendor?._id || product.vendor?.id || product.vendorId || product.vendor
  const newVendorName = product.vendor?.storeName || product.vendor?.businessName || product.storeName || 'Unknown Store'

  // Get vendor info from first item in cart
  const firstCartItem = currentCart[0]
  const currentVendorId = firstCartItem.vendor?._id || firstCartItem.vendor?.id || firstCartItem.vendorId || firstCartItem.vendor
  const currentVendorName = firstCartItem.vendor?.storeName || firstCartItem.vendor?.businessName || firstCartItem.storeName || 'Current Store'

  // If no vendor info available, allow (for backward compatibility)
  if (!newVendorId || !currentVendorId) {
    return { needsConfirmation: false }
  }

  // Convert to strings for comparison
  const newVendorStr = String(newVendorId)
  const currentVendorStr = String(currentVendorId)

  // If vendors match, no conflict
  if (newVendorStr === currentVendorStr) {
    return { needsConfirmation: false }
  }

  // Different vendors - need confirmation
  return {
    needsConfirmation: true,
    currentVendorId: currentVendorStr,
    currentVendorName,
    newVendorId: newVendorStr,
    newVendorName
  }
}

/**
 * Get the current cart's vendor info
 * @param {Array} cart - Current cart items
 * @returns {Object} { vendorId: string, vendorName: string } or null if cart is empty or no vendor info
 */
export const getCartVendorInfo = (cart) => {
  if (!cart || cart.length === 0) {
    return null
  }

  const firstItem = cart[0]
  const vendorId = firstItem.vendor?._id || firstItem.vendor?.id || firstItem.vendorId || firstItem.vendor

  // HOTFIX: Return null if vendorId is missing or undefined to prevent /vendor/undefined API calls
  if (!vendorId || vendorId === 'undefined') {
    return null
  }

  const vendorName = firstItem.vendor?.storeName || firstItem.vendor?.businessName || firstItem.storeName || 'Your Store'

  return {
    vendorId: String(vendorId),
    vendorName
  }
}

/**
 * Check if cart meets minimum order requirement
 * @param {number} cartSubtotal - Current cart subtotal
 * @param {number} minimumOrder - Vendor's minimum order value
 * @returns {Object} { meetsMinimum: boolean, shortfall: number, minimumOrder: number }
 */
export const checkMinimumOrder = (cartSubtotal, minimumOrder) => {
  const minOrder = parseFloat(minimumOrder) || 0
  const subtotal = parseFloat(cartSubtotal) || 0

  // No minimum set or minimum is 0
  if (minOrder <= 0) {
    return { meetsMinimum: true, shortfall: 0, minimumOrder: 0 }
  }

  const meetsMinimum = subtotal >= minOrder
  const shortfall = meetsMinimum ? 0 : minOrder - subtotal

  return {
    meetsMinimum,
    shortfall: Math.max(0, shortfall),
    minimumOrder: minOrder
  }
}
