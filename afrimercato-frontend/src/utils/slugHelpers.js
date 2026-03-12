/**
 * Slug Resolution Helper
 * Detects ObjectId vs slug and resolves vendor ID
 */

import api from '../services/api'

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} str - String to check
 * @returns {boolean}
 */
export const isObjectId = (str) => {
  if (!str || typeof str !== 'string') return false
  // MongoDB ObjectId is 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(str)
}

/**
 * Resolve vendor ID from slug or ObjectId
 * @param {string} slugOrId - Vendor slug or ObjectId
 * @returns {Promise<{success: boolean, vendorId: string, vendor: object, error: string}>}
 */
export const resolveVendorId = async (slugOrId) => {
  try {
    // If already an ObjectId, return it directly
    if (isObjectId(slugOrId)) {
      return { success: true, vendorId: slugOrId, isSlug: false }
    }

    // Otherwise, resolve slug to ID via API
    const response = await api.get(`/api/vendors/slug/${slugOrId}`)
    
    if (response.data && response.data.success && response.data.data) {
      return {
        success: true,
        vendorId: response.data.data._id || response.data.data.id,
        vendor: response.data.data,
        isSlug: true
      }
    }

    return {
      success: false,
      error: 'Vendor not found',
      isSlug: true
    }
  } catch (error) {
    console.error('Error resolving vendor slug:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to resolve vendor',
      isSlug: !isObjectId(slugOrId)
    }
  }
}

/**
 * Build vendor-specific API URL
 * Ensures vendorId is resolved before making API calls
 * @param {string} slugOrId - Vendor slug or ObjectId
 * @param {string} endpoint - API endpoint (e.g., 'products', 'locations')
 * @returns {Promise<string>} - Resolved API URL
 */
export const buildVendorApiUrl = async (slugOrId, endpoint) => {
  const resolution = await resolveVendorId(slugOrId)
  
  if (!resolution.success) {
    throw new Error(resolution.error || 'Failed to resolve vendor')
  }

  return `/api/${endpoint}/vendor/${resolution.vendorId}`
}
