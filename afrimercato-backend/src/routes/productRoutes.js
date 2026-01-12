// =================================================================
// PRODUCT ROUTES - VENDOR MANAGEMENT
// =================================================================
// Routes for vendors to manage their products
// Based on UK Food Delivery Standards

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const Vendor = require('../models/Vendor');

// Simple middleware to attach vendor without any approval checks
const attachVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }
    req.vendor = vendor;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error finding vendor' });
  }
};

// =================================================================
// PROTECTED ROUTES (VENDOR ONLY)
// =================================================================

// Create new product with multiple images (max 5)
router.post(
  '/',
  protect,
  authorize('vendor'),
  attachVendor,
  uploadMultiple('images', 5),
  handleUploadError,
  productController.createProduct
);

// Get all products for logged-in vendor
router.get(
  '/',
  protect,
  authorize('vendor'),
  attachVendor,
  productController.getVendorProducts
);

// Get single product
router.get(
  '/:productId',
  protect,
  authorize('vendor'),
  attachVendor,
  productController.getProduct
);

// Update product (with optional new images)
router.put(
  '/:productId',
  protect,
  authorize('vendor'),
  attachVendor,
  uploadMultiple('images', 5),
  handleUploadError,
  productController.updateProduct
);

// Delete product image
router.delete(
  '/:productId/images/:publicId',
  protect,
  authorize('vendor'),
  attachVendor,
  productController.deleteProductImage
);

// Delete product
router.delete(
  '/:productId',
  protect,
  authorize('vendor'),
  attachVendor,
  productController.deleteProduct
);

// Update stock
router.patch(
  '/:productId/stock',
  protect,
  authorize('vendor'),
  attachVendor,
  productController.updateStock
);

// Toggle product active status
router.patch(
  '/:productId/toggle',
  protect,
  authorize('vendor'),
  attachVendor,
  productController.toggleProductStatus
);

module.exports = router;
