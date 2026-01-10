// =================================================================
// PRODUCT ROUTES - VENDOR MANAGEMENT
// =================================================================
// Routes for vendors to manage their products
// Based on UK Food Delivery Standards

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, vendorOnly } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

// =================================================================
// PROTECTED ROUTES (VENDOR ONLY)
// =================================================================

// Create new product with multiple images (max 5)
router.post(
  '/',
  protect,
  vendorOnly,
  uploadMultiple('images', 5),
  handleUploadError,
  productController.createProduct
);

// Get all products for logged-in vendor
router.get(
  '/',
  protect,
  vendorOnly,
  productController.getVendorProducts
);

// Get single product
router.get(
  '/:productId',
  protect,
  vendorOnly,
  productController.getProduct
);

// Update product (with optional new images)
router.put(
  '/:productId',
  protect,
  vendorOnly,
  uploadMultiple('images', 5),
  handleUploadError,
  productController.updateProduct
);

// Delete product image
router.delete(
  '/:productId/images/:publicId',
  protect,
  vendorOnly,
  productController.deleteProductImage
);

// Delete product
router.delete(
  '/:productId',
  protect,
  vendorOnly,
  productController.deleteProduct
);

// Update stock
router.patch(
  '/:productId/stock',
  protect,
  vendorOnly,
  productController.updateStock
);

// Toggle product active status
router.patch(
  '/:productId/toggle',
  protect,
  vendorOnly,
  productController.toggleProductStatus
);

module.exports = router;
