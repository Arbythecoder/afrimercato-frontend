// =================================================================
// CLOUDINARY CONFIGURATION
// =================================================================
// Cloud-based image storage for production deployment

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/**
 * WHY CLOUDINARY?
 * - Local disk storage doesn't work on cloud platforms (Railway, Heroku, etc.)
 * - Cloudinary provides persistent cloud storage
 * - Free tier: 25GB storage, 25GB bandwidth/month
 * - Automatic image optimization and transformations
 */

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * STORAGE FOR PRODUCT IMAGES
 * Saves to: afrimercato/products/ folder in Cloudinary
 */
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'afrimercato/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // Max dimensions
      { quality: 'auto' } // Auto optimize quality
    ]
  }
});

/**
 * STORAGE FOR VENDOR LOGOS
 */
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'afrimercato/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

/**
 * STORAGE FOR AVATARS
 */
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'afrimercato/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill' },
      { quality: 'auto' }
    ]
  }
});

/**
 * STORAGE FOR DOCUMENTS
 */
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'afrimercato/documents',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw' // For non-image files
  }
});

module.exports = {
  cloudinary,
  productStorage,
  logoStorage,
  avatarStorage,
  documentStorage
};
