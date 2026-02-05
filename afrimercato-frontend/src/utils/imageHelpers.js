/**
 * AFRIMERCATO - CENTRALIZED IMAGE FALLBACK SYSTEM
 * Ensures no UI section renders without an image
 * Provides branded, high-quality fallbacks for all image types
 */

// High-quality Unsplash images for fallbacks
export const FALLBACK_IMAGES = {
  // Hero sections
  hero: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=90', // Fresh colorful vegetables
  
  // Store/Vendor images
  store: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80', // African grocery store
  vendor: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80', // Fresh produce aisle
  storefront: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=600&q=80', // Colorful vegetable display
  
  // Product images by category
  products: {
    default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
    vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
    meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
    seafood: 'https://images.unsplash.com/photo-1535140728325-a4d3707eee61?w=400&q=80',
    dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80',
    grains: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
    spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    beverages: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
  },
  
  // User avatars
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
  
  // Empty states
  empty: {
    cart: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&q=80',
    orders: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80',
    stores: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80',
  }
};

/**
 * Get appropriate fallback image based on context
 * @param {string} type - Image type (store, product, avatar, etc.)
 * @param {string} category - Optional category for products
 * @returns {string} Fallback image URL
 */
export function getFallbackImage(type = 'default', category = null) {
  if (type === 'product' && category) {
    const categoryKey = category.toLowerCase();
    return FALLBACK_IMAGES.products[categoryKey] || FALLBACK_IMAGES.products.default;
  }
  
  if (type === 'empty' && category) {
    return FALLBACK_IMAGES.empty[category] || FALLBACK_IMAGES.empty.stores;
  }
  
  return FALLBACK_IMAGES[type] || FALLBACK_IMAGES.store;
}

/**
 * Handle image error by replacing with fallback
 * Usage: <img onError={(e) => handleImageError(e, 'store')} />
 */
export function handleImageError(event, type = 'store', category = null) {
  event.target.src = getFallbackImage(type, category);
  event.target.onerror = null; // Prevent infinite loop
}

/**
 * Get image URL with automatic fallback
 * @param {string|object} image - Image URL or object with url property
 * @param {string} fallbackType - Type of fallback to use
 * @returns {string} Image URL with fallback
 */
export function getImageUrl(image, fallbackType = 'store') {
  // Handle array of images
  if (Array.isArray(image)) {
    const firstImage = image[0];
    if (!firstImage) return getFallbackImage(fallbackType);
    return typeof firstImage === 'string' ? firstImage : firstImage.url || getFallbackImage(fallbackType);
  }
  
  // Handle single image
  if (typeof image === 'string') {
    return image || getFallbackImage(fallbackType);
  }
  
  if (image && typeof image === 'object') {
    return image.url || getFallbackImage(fallbackType);
  }
  
  return getFallbackImage(fallbackType);
}

/**
 * Get product image with category-specific fallback
 */
export function getProductImage(product) {
  const category = product?.category || 'default';
  return getImageUrl(product?.images, 'product') || getFallbackImage('product', category);
}

/**
 * Get store/vendor image with fallback
 */
export function getStoreImage(store) {
  return getImageUrl(store?.logo || store?.image, 'store');
}

/**
 * Get user avatar with fallback
 */
export function getUserAvatar(user) {
  return getImageUrl(user?.avatar || user?.profilePicture, 'avatar');
}

export default {
  FALLBACK_IMAGES,
  getFallbackImage,
  handleImageError,
  getImageUrl,
  getProductImage,
  getStoreImage,
  getUserAvatar
};
