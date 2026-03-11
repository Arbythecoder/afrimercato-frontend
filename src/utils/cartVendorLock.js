/**
 * Multi-Store Cart Protection Utility
 * Prevents customers from mixing items from different vendors in a single cart
 */

/**
 * Check if adding a product from a different vendor requires cart clearing.
 * Multi-vendor cart is always enabled — customers can shop from multiple stores.
 */
// eslint-disable-next-line no-unused-vars
export const checkVendorLock = (_product, _currentCart) => {
  return { needsConfirmation: false }
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
