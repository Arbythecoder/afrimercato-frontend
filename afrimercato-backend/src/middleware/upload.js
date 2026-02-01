// =================================================================
// FILE UPLOAD MIDDLEWARE (MULTER + CLOUDINARY)
// =================================================================
// Handles product images, vendor logos, and document uploads
// Uses Cloudinary for cloud storage (works on Railway, Heroku, Fly.io, etc.)

const multer = require('multer');
const path = require('path');

/**
 * STORAGE STRATEGY:
 * - Production: Cloudinary (cloud storage)
 * - Development: Local disk storage (fallback)
 */

let storage;
let isCloudinary = false;

// Check if Cloudinary is configured
let cloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);

if (cloudinaryConfigured) {
  try {
    // Use Cloudinary storage (multer-storage-cloudinary)
    const { productStorage } = require('../config/cloudinary');
    storage = productStorage;
    isCloudinary = true;
    console.log('📸 Using Cloudinary for image storage');
  } catch (error) {
    console.error('❌ Failed to initialize Cloudinary storage:', error.message);
    console.log('📁 Falling back to local disk storage');
    cloudinaryConfigured = false;
    isCloudinary = false;
  }
}

if (!cloudinaryConfigured || !isCloudinary) {
  // Fallback to local disk storage (for local development)
  console.log('📁 Using local disk storage (Cloudinary not configured)');

  const fs = require('fs');

  // Ensure upload directories exist
  const uploadDirs = [
    'uploads/products',
    'uploads/logos',
    'uploads/avatars',
    'uploads/documents',
    'uploads/misc'
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = 'uploads/';

      if (file.fieldname === 'productImages' || file.fieldname === 'images') {
        uploadPath += 'products/';
      } else if (file.fieldname === 'logo') {
        uploadPath += 'logos/';
      } else if (file.fieldname === 'avatar') {
        uploadPath += 'avatars/';
      } else if (file.fieldname === 'documents') {
        uploadPath += 'documents/';
      } else {
        uploadPath += 'misc/';
      }

      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

// =================================================================
// FILE FILTER (VALIDATION) - PRODUCTION-GRADE
// =================================================================
// Supports ALL common image formats from phones/cameras:
// - JFIF: Windows saves JPEGs as .jfif
// - HEIC/HEIF: iPhone default format (iOS 11+)
// - AVIF: Modern efficient format (Chrome, Firefox)
// - BMP/TIFF: Legacy camera formats
// Cloudinary auto-converts all formats to web-optimized output.

// ALLOWED EXTENSIONS: All formats that Cloudinary can process
// Note: Cloudinary converts these server-side, so we accept broadly
const ALLOWED_IMAGE_EXTENSIONS = /\.(jpe?g|jfif|png|gif|webp|heic|heif|avif|bmp|tiff?|svg)$/i;

// ALLOWED MIME TYPES: Accept all valid image MIME types
// Some phones send non-standard MIME types, so we're permissive here
const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/jfif',        // Windows JFIF
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',        // iPhone
  'image/heif',        // iPhone
  'image/avif',        // Modern format
  'image/bmp',
  'image/tiff',
  'image/svg+xml'
];

const ALLOWED_DOC_EXTENSIONS = /\.(pdf|docx?)$/i;

const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();

  // IMAGE UPLOAD VALIDATION
  if (
    file.fieldname === 'productImages' ||
    file.fieldname === 'images' ||
    file.fieldname === 'logo' ||
    file.fieldname === 'avatar'
  ) {
    // Strategy: Accept if EITHER extension OR mimetype is valid
    // This handles phones that send weird MIME types but correct extensions
    const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.test(file.originalname);
    const hasValidMime = ALLOWED_IMAGE_MIMES.includes(mimetype) || mimetype.startsWith('image/');

    if (hasValidExtension || hasValidMime) {
      return cb(null, true);
    }

    // Detailed error for debugging (logged server-side, clean message to user)
    console.warn(`[Upload] Rejected file: ext="${extname}", mime="${mimetype}", name="${file.originalname}"`);
    return cb(new Error(
      `Unsupported image format "${extname || mimetype}". ` +
      'Supported: JPEG, PNG, GIF, WebP, HEIC (iPhone), JFIF, AVIF, BMP, TIFF.'
    ));
  }

  // DOCUMENT UPLOAD VALIDATION
  if (file.fieldname === 'documents') {
    if (ALLOWED_DOC_EXTENSIONS.test(file.originalname)) {
      return cb(null, true);
    }
    return cb(new Error('Invalid document. Only PDF, DOC, DOCX allowed.'));
  }

  console.error(`[Upload] Unexpected field: "${file.fieldname}"`);
  return cb(new Error(`Unexpected file field: "${file.fieldname}"`));
};

// =================================================================
// MULTER CONFIGURATION
// =================================================================
// File size: 10MB default (modern phone cameras produce 3-8MB images)
// Configurable via MAX_FILE_SIZE env var (in bytes)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_REQUEST = 10;

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_REQUEST
  }
});

// =================================================================
// UPLOAD MIDDLEWARE EXPORTS
// =================================================================

exports.uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
exports.uploadFields = (fields) => upload.fields(fields);

// =================================================================
// ERROR HANDLER FOR MULTER - PRODUCTION-GRADE
// =================================================================
// Returns clear, actionable error messages to users
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${maxSizeMB}MB. Try compressing the image or using a smaller resolution.`,
        errorCode: 'FILE_TOO_LARGE',
        maxSizeBytes: MAX_FILE_SIZE
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: `Too many files. Maximum is ${MAX_FILES_PER_REQUEST} files per upload.`,
        errorCode: 'TOO_MANY_FILES',
        maxFiles: MAX_FILES_PER_REQUEST
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      console.warn(`[Upload] Unexpected field: ${err.field}`);
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field in upload',
        errorCode: 'UNEXPECTED_FILE_FIELD'
      });
    }

    // Catch-all for other Multer errors
    console.error('[Upload] Multer error:', err.code, err.message);
    return res.status(400).json({
      success: false,
      message: 'File upload failed. Please try again.',
      errorCode: err.code || 'MULTER_ERROR'
    });
  }

  // Custom errors from fileFilter
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      errorCode: 'FILE_UPLOAD_ERROR'
    });
  }

  next();
};

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * GET FILE URL
 * Works for both Cloudinary and local storage
 */
exports.getFileUrl = (file) => {
  if (!file) return null;

  // Cloudinary returns the URL in file.path
  if (isCloudinary) {
    return file.path;
  }

  // Local storage - construct URL
  const filePath = typeof file === 'string' ? file : file.path;
  return `${process.env.API_URL || 'http://localhost:5000'}/${filePath.replace(/\\/g, '/')}`;
};

/**
 * Check if using Cloudinary
 */
exports.isCloudinaryEnabled = () => isCloudinary;

/**
 * DELETE FILE
 * Removes file from storage
 */
exports.deleteFile = async (fileUrl) => {
  if (!fileUrl) return;

  if (isCloudinary) {
    // Extract public_id from Cloudinary URL
    const { cloudinary } = require('../config/cloudinary');
    const urlParts = fileUrl.split('/');
    const publicIdWithExt = urlParts.slice(-2).join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted from Cloudinary: ${publicId}`);
    } catch (err) {
      console.error(`Error deleting from Cloudinary:`, err);
    }
  } else {
    // Local storage
    const fs = require('fs');
    const fullPath = path.join(__dirname, '../../', fileUrl);

    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Error deleting file ${fileUrl}:`, err);
      } else {
        console.log(`File deleted: ${fileUrl}`);
      }
    });
  }
};
