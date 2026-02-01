// =================================================================
// CLOUDINARY CONFIGURATION
// =================================================================
// Image storage configuration for Cloudinary with Multer integration

const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get CloudinaryStorage - handle both v2.x and v4.x export formats
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;

// =================================================================
// STORAGE CONFIGURATIONS - PRODUCTION-GRADE
// =================================================================
// Cloudinary auto-converts ALL input formats to optimized web formats.
// We accept all common phone/camera formats and let Cloudinary handle conversion.
// Output is always web-optimized (usually WebP or JPEG depending on browser).

// ALL formats Cloudinary can process (input formats)
// Cloudinary handles conversion server-side - no client-side processing needed
const CLOUDINARY_ALLOWED_FORMATS = [
  'jpg', 'jpeg', 'jfif',        // Standard JPEG variants
  'png',                         // PNG
  'gif',                         // GIF (animated supported)
  'webp',                        // WebP
  'heic', 'heif',               // iPhone (iOS 11+) - auto-converted to JPEG
  'avif',                        // Modern format
  'bmp',                         // Bitmap
  'tiff', 'tif',                // TIFF
  'svg'                          // SVG (vector)
];

// Multer-Cloudinary storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary: { v2: cloudinary },
  params: {
    folder: 'afrimercato/products',
    allowed_formats: CLOUDINARY_ALLOWED_FORMATS,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

// Storage for vendor logos
const logoStorage = new CloudinaryStorage({
  cloudinary: { v2: cloudinary },
  params: {
    folder: 'afrimercato/logos',
    allowed_formats: CLOUDINARY_ALLOWED_FORMATS,
    transformation: [
      { width: 500, height: 500, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

// Storage for user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: { v2: cloudinary },
  params: {
    folder: 'afrimercato/avatars',
    allowed_formats: CLOUDINARY_ALLOWED_FORMATS,
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

/**
 * Upload image to Cloudinary directly (without multer)
 * Useful for base64 or buffer uploads
 */
const uploadToCloudinary = async (file, folder = 'afrimercato/misc') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
      quality: 'auto:good'
    });
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === 'ok' };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  cloudinary,
  productStorage,
  logoStorage,
  avatarStorage,
  uploadToCloudinary,
  deleteFromCloudinary
};
