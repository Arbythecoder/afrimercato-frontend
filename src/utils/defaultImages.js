// Beautiful, license-free images from Unsplash
// All images are professionally curated and optimized

const DEFAULT_IMAGES = {
  vegetables: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80',
  'meat-fish': 'https://images.unsplash.com/photo-1546964053-d018e345e490?w=800&q=80',
  dairy: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80',
  grains: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=800&q=80',
  beverages: 'https://images.unsplash.com/photo-1598614187854-26a60e982dc4?w=800&q=80',
  spices: 'https://images.unsplash.com/photo-1596040033229-a0b3b46fe6b6?w=800&q=80',
  'fresh-produce': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  snacks: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  household: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  'beauty-health': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80'
}

// Store/vendor logo defaults - Beautiful African market scenes
const STORE_LOGOS = {
  default: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
  market: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
  grocery: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=800&q=80'
}

// Hero section images - Stunning marketplace and food photography
export const HERO_IMAGES = {
  main: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&q=80',
  banner1: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80',
  banner2: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1600&q=80',
  banner3: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&q=80',
  hero1: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&q=80',
  hero2: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&q=80',
  store1: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1600&q=80',
  store2: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=1600&q=80',
  store3: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&q=80'
}

/**
 * Get default product image based on category
 * @param {string} category - Product category
 * @returns {string} Image URL
 */
export const getDefaultProductImage = (category) => {
  if (!category) return DEFAULT_IMAGES.default

  // Normalize category name
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-')

  return DEFAULT_IMAGES[normalizedCategory] || DEFAULT_IMAGES.default
}

/**
 * Get default store logo
 * @param {string} storeType - Type of store
 * @returns {string} Image URL
 */
export const getDefaultStoreLogo = (storeType) => {
  if (!storeType) return STORE_LOGOS.default

  const normalizedType = storeType.toLowerCase()
  return STORE_LOGOS[normalizedType] || STORE_LOGOS.default
}

/**
 * Get product image with fallback
 * @param {object} product - Product object
 * @returns {string} Image URL
 */
export const getProductImage = (product) => {
  // Try product images array first
  if (product?.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.isPrimary)
    if (primaryImage?.url) return primaryImage.url
    if (product.images[0]?.url) return product.images[0].url
  }

  // Fallback to category default
  return getDefaultProductImage(product?.category)
}

/**
 * Get store banner with fallback
 * @param {object} vendor - Vendor object
 * @returns {string} Image URL
 */
export const getStoreBanner = (vendor) => {
  if (vendor?.banner?.url) return vendor.banner.url
  if (vendor?.logo?.url) return vendor.logo.url

  return getDefaultStoreLogo(vendor?.businessType || vendor?.category)
}

/**
 * Get store logo with fallback
 * @param {object} vendor - Vendor object
 * @returns {string} Image URL
 */
export const getStoreLogo = (vendor) => {
  if (vendor?.logo?.url) return vendor.logo.url

  return getDefaultStoreLogo(vendor?.businessType || vendor?.category)
}

export default {
  getDefaultProductImage,
  getDefaultStoreLogo,
  getProductImage,
  getStoreBanner,
  getStoreLogo
}
