// =================================================================
// FILE UPLOAD MIDDLEWARE (MULTER + CLOUDINARY)
// =================================================================
// Handles product images, vendor logos, and document uploads
// Uses Cloudinary for cloud storage (works on Railway, Heroku, etc.)

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
if (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) {

  // Use Cloudinary storage
  const { productStorage } = require('../config/cloudinary');
  storage = productStorage;
  isCloudinary = true;
  console.log('📸 Using Cloudinary for image storage');

} else {
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

      if (file.fieldname === 'productImages') {
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
// FILE FILTER (VALIDATION)
// =================================================================
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check if it's an image upload
  if (
    file.fieldname === 'productImages' ||
    file.fieldname === 'logo' ||
    file.fieldname === 'avatar'
  ) {
    const isValidImage =
      allowedImageTypes.test(extname) && mimetype.startsWith('image/');

    if (isValidImage) {
      return cb(null, true);
    } else {
      return cb(
        new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
      );
    }
  }

  // Check if it's a document upload
  if (file.fieldname === 'documents') {
    const isValidDoc = allowedDocTypes.test(extname);

    if (isValidDoc) {
      return cb(null, true);
    } else {
      return cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }

  console.error(`⚠️ Unexpected file field received: ${file.fieldname}`);
  return cb(new Error(`Unexpected file field: "${file.fieldname}"`));
};

// =================================================================
// MULTER CONFIGURATION
// =================================================================
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 10 // Maximum 10 files per request (increased for multiple products)
  }
});

// =================================================================
// UPLOAD MIDDLEWARE EXPORTS
// =================================================================

exports.uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
exports.uploadFields = (fields) => upload.fields(fields);

// =================================================================
// ERROR HANDLER FOR MULTER
// =================================================================
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB',
        errorCode: 'FILE_TOO_LARGE'
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files per upload',
        errorCode: 'TOO_MANY_FILES'
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
        errorCode: 'UNEXPECTED_FILE_FIELD'
      });
    }
  }

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
