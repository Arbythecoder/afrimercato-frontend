// Default images using local photos from C:\Users\Arbythecoder\Pictures\afrimercato
// All images are now served locally for faster loading

const DEFAULT_IMAGES = {
  vegetables: '/images/afrihub3.png',
  fruits: '/images/afrihub4.png',
  'meat-fish': '/images/afrihub5.png',
  dairy: '/images/afrihub6.png',
  grains: '/images/afrihub7.png',
  beverages: '/images/afrihub8.png',
  spices: '/images/afrihub9.png',
  'fresh-produce': '/images/afrihub2.png',
  bakery: '/images/afrime2.png',
  snacks: '/images/afrime3.png',
  default: '/images/afrihub1.png'
}

// Store/vendor logo defaults
const STORE_LOGOS = {
  default: '/images/piafrimerca.png',
  market: '/images/afrimenewme.png',
  grocery: '/images/afrimenewme2.png'
}

// Hero section images
export const HERO_IMAGES = {
  main: '/images/afrih.jpg',
  banner1: '/images/one.jpg',
  banner2: '/images/two.jpg',
  banner3: '/images/three.jpg',
  hero1: '/images/afrimenewme3.png',
  hero2: '/images/afrimenewme4.png',
  store1: '/images/afrime4.png',
  store2: '/images/afrime5.png',
  store3: '/images/afrime6.png'
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
