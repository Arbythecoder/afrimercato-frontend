// =================================================================
// CLOUDINARY CONFIGURATION
// =================================================================
// Image storage configuration for Cloudinary

const cloudinary = require('cloudinary').v2;

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Placeholder storage (not used if Cloudinary is configured)
const productStorage = {};

module.exports = {
  cloudinary,
  productStorage
};
