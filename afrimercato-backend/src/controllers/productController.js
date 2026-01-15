// =================================================================
// PRODUCT CONTROLLER - VENDOR MANAGEMENT
// =================================================================
// Handles product CRUD operations for vendors
// Based on UK Food Delivery Standards (Uber Eats, Just Eat, Deliveroo)

const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { cloudinary } = require('../config/cloudinary');

/**
 * CREATE NEW PRODUCT
 * POST /api/vendor/products
 * Protected: Vendor only
 */
exports.createProduct = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    console.log('📦 Creating product...');
    console.log('Vendor ID:', vendorId);
    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    // Get vendor info
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // NO APPROVAL REQUIRED - Vendors can create products immediately after signup
    // Parse product data from FormData
    const productData = {
      vendor: vendorId,
      storeName: vendor.storeName || vendor.businessName,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      // Convert string numbers to actual numbers
      price: parseFloat(req.body.price),
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
      stock: parseInt(req.body.stock || 0),
      lowStockThreshold: parseInt(req.body.lowStockThreshold || 10),
      // Convert string booleans to actual booleans
      inStock: req.body.inStock === 'true' || req.body.inStock === true,
      unlimitedStock: req.body.unlimitedStock === 'true' || req.body.unlimitedStock === true,
      unit: req.body.unit,
      unitQuantity: req.body.unitQuantity ? parseFloat(req.body.unitQuantity) : undefined
    };

    console.log('Parsed product data:', productData);

    // Parse variants if sent as JSON string
    if (req.body.variants) {
      try {
        productData.variants = typeof req.body.variants === 'string'
          ? JSON.parse(req.body.variants)
          : req.body.variants;
      } catch (e) {
        console.error('Error parsing variants:', e);
        productData.variants = [];
      }
    }

    // Parse tags if sent as JSON string
    if (req.body.tags) {
      try {
        productData.tags = typeof req.body.tags === 'string'
          ? JSON.parse(req.body.tags)
          : req.body.tags;
      } catch (e) {
        console.error('Error parsing tags:', e);
        productData.tags = [];
      }
    }

    // Parse availability if sent as JSON string
    if (req.body.availability) {
      try {
        productData.availability = typeof req.body.availability === 'string'
          ? JSON.parse(req.body.availability)
          : req.body.availability;
      } catch (e) {
        console.error('Error parsing availability:', e);
        productData.availability = undefined;
      }
    }

    // Handle uploaded images from Cloudinary
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: index === 0
      }));
    }

    // Validate images
    if (!productData.images || productData.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required'
      });
    }

    if (productData.images.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 images allowed'
      });
    }

    // Create product
    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors,
      stack: error.stack
    });

    // Clean up uploaded images if product creation fails
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await cloudinary.uploader.destroy(file.filename);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

/**
 * GET ALL PRODUCTS FOR VENDOR
 * GET /api/vendor/products
 * Protected: Vendor only
 */
exports.getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { page = 1, limit = 20, category, inStock, search } = req.query;

    // Build filter
    const filter = { vendor: vendorId };

    if (category) {
      filter.category = category;
    }

    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get products
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    // Get total count
    const total = await Product.countDocuments(filter);

    // Get statistics
    const stats = await Product.aggregate([
      { $match: { vendor: vendorId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          inStockCount: {
            $sum: { $cond: ['$inStock', 1, 0] }
          },
          outOfStockCount: {
            $sum: { $cond: ['$inStock', 0, 1] }
          },
          totalViews: { $sum: '$views' },
          totalSales: { $sum: '$salesCount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        stats: stats[0] || {
          totalProducts: 0,
          totalStock: 0,
          inStockCount: 0,
          outOfStockCount: 0,
          totalViews: 0,
          totalSales: 0
        }
      }
    });

  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

/**
 * GET SINGLE PRODUCT
 * GET /api/vendor/products/:productId
 * Protected: Vendor only
 */
exports.getProduct = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      vendor: vendorId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

/**
 * UPDATE PRODUCT
 * PUT /api/vendor/products/:productId
 * Protected: Vendor only
 */
exports.updateProduct = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { productId } = req.params;

    // Find product
    const product = await Product.findOne({
      _id: productId,
      vendor: vendorId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Parse variants if sent as JSON string
    if (typeof req.body.variants === 'string') {
      try {
        req.body.variants = JSON.parse(req.body.variants);
      } catch (e) {
        // Keep existing variants if parse fails
        delete req.body.variants;
      }
    }

    // Parse tags if sent as JSON string
    if (typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {
        delete req.body.tags;
      }
    }

    // Parse availability if sent as JSON string
    if (typeof req.body.availability === 'string') {
      try {
        req.body.availability = JSON.parse(req.body.availability);
      } catch (e) {
        delete req.body.availability;
      }
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: index === 0 && product.images.length === 0
      }));

      // Add new images to existing ones
      req.body.images = [...product.images, ...newImages];

      // Ensure total doesn't exceed 5
      if (req.body.images.length > 5) {
        req.body.images = req.body.images.slice(0, 5);
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);

    // Clean up uploaded images if update fails
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await cloudinary.uploader.destroy(file.filename);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

/**
 * DELETE PRODUCT IMAGE
 * DELETE /api/vendor/products/:productId/images/:publicId
 * Protected: Vendor only
 */
exports.deleteProductImage = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { productId, publicId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      vendor: vendorId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find image
    const imageIndex = product.images.findIndex(
      img => img.publicId === publicId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Don't allow deletion if it's the only image
    if (product.images.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Product must have at least one image'
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove from product
    product.images.splice(imageIndex, 1);

    // If deleted image was primary, make first image primary
    if (imageIndex === 0 && product.images.length > 0) {
      product.images[0].isPrimary = true;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: product
    });

  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

/**
 * DELETE PRODUCT
 * DELETE /api/vendor/products/:productId
 * Protected: Vendor only
 */
exports.deleteProduct = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      vendor: vendorId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete all images from Cloudinary
    for (const image of product.images) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    // Delete product
    await Product.findByIdAndDelete(productId);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

/**
 * UPDATE STOCK
 * PATCH /api/vendor/products/:productId/stock
 * Protected: Vendor only
 */
exports.updateStock = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { productId } = req.params;
    const { stock, inStock, unlimitedStock } = req.body;

    const product = await Product.findOne({
      _id: productId,
      vendor: vendorId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update stock fields
    if (stock !== undefined) product.stock = stock;
    if (inStock !== undefined) product.inStock = inStock;
    if (unlimitedStock !== undefined) product.unlimitedStock = unlimitedStock;

    await product.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        stock: product.stock,
        inStock: product.inStock,
        unlimitedStock: product.unlimitedStock
      }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

/**
 * TOGGLE PRODUCT STATUS (Active/Inactive)
 * PATCH /api/vendor/products/:productId/toggle
 * Protected: Vendor only
 */
exports.toggleProductStatus = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      vendor: vendorId
    });

    if (!product) { 
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        isActive: product.isActive
      }
    });

  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle product status',
      error: error.message
    });
  }
};

module.exports = exports;
