// =================================================================
// VENDOR PRODUCT MANAGEMENT CONTROLLER - PRODUCTION GRADE
// =================================================================
// File: src/controllers/vendorProductController.js
// UK Standard | Industry Best Practices | Complete CRUD
//
// Features:
// - Complete product lifecycle management
// - Stock management with alerts
// - Pricing management with history
// - Product analytics
// - Bulk operations
// - Image management
// - UK standard formatting

const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

// =================================================================
// PRODUCT CRUD OPERATIONS
// =================================================================

/**
 * @route   POST /api/vendor/products
 * @desc    Create new product
 * @access  Private (Vendor)
 * @standard UK Standard | Complete Validation
 */
exports.createProduct = asyncHandler(async (req, res) => {
  // Defensive check for vendor attachment
  if (!req.vendor || !req.vendor._id) {
    console.error('❌ createProduct: req.vendor is undefined or missing _id');
    return res.status(403).json({
      success: false,
      message: 'Vendor profile not found. Please complete vendor registration first.'
    });
  }

  const vendorId = req.vendor._id;
  const {
    name,
    description,
    category,
    price,
    originalPrice,
    unit,
    stock,
    sku,
    barcode,
    specifications,
    tags,
    availability,
    variants
  } = req.body;

  // Process uploaded images from multer (req.files contains uploaded files)
  let imageUrls = [];

  if (req.files && req.files.length > 0) {
    // Cloudinary: files have 'path' property with the URL
    // Local storage: files have 'path' property with local path
    imageUrls = req.files.map(file => {
      // Cloudinary returns the URL in file.path
      if (file.path && file.path.startsWith('http')) {
        return file.path;
      }
      // For local storage, construct URL
      return `${process.env.API_URL || 'http://localhost:5000'}/${file.path.replace(/\\/g, '/')}`;
    });
    console.log(`📸 Processed ${imageUrls.length} uploaded image(s)`);
  } else if (req.body.images) {
    // Fallback: images passed as JSON array (for updates or pre-uploaded URLs)
    try {
      imageUrls = typeof req.body.images === 'string'
        ? JSON.parse(req.body.images)
        : req.body.images;
    } catch (e) {
      // If it's a single URL string
      imageUrls = [req.body.images];
    }
  }

  // Validate required fields
  if (!name || !category || !price || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Name, category, price, and stock are required'
    });
  }

  // Validate image upload
  if (imageUrls.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one product image is required'
    });
  }

  if (parseFloat(price) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price cannot be negative'
    });
  }

  if (parseInt(stock) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock cannot be negative'
    });
  }

  // Parse JSON fields that may come as strings from FormData
  let parsedTags = [];
  let parsedAvailability = {};
  let parsedVariants = [];
  let parsedSpecifications = {};

  try {
    parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
    parsedAvailability = availability ? (typeof availability === 'string' ? JSON.parse(availability) : availability) : {};
    parsedVariants = variants ? (typeof variants === 'string' ? JSON.parse(variants) : variants) : [];
    parsedSpecifications = specifications ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications) : {};
  } catch (parseError) {
    console.warn('Warning: Could not parse some JSON fields:', parseError.message);
  }

  // Generate SKU if not provided
  const productSku = sku || generateSKU(name);

  const product = await Product.create({
    vendor: vendorId,
    name: name.trim(),
    description: description?.trim(),
    category: category.trim(),
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
    unit: unit || 'piece',
    stock: parseInt(stock),
    images: imageUrls,
    sku: productSku,
    barcode,
    tags: parsedTags,
    availability: parsedAvailability,
    variants: parsedVariants,
    specifications: parsedSpecifications,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Populate vendor info
  await product.populate('vendor', 'storeName storeId');

  console.log(`✅ Product created: ${product.name} (ID: ${product._id}) with ${imageUrls.length} image(s)`);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: formatProductResponse(product)
  });
});

/**
 * @route   GET /api/vendor/products
 * @desc    Get all vendor products with pagination and filtering
 * @access  Private (Vendor)
 */
exports.getProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const {
    page = 1,
    limit = 20,
    category,
    status = 'all',
    search,
    sortBy = 'newest'
  } = req.query;

  const skip = (page - 1) * limit;
  const query = { vendor: vendorId };

  // Filter by category
  if (category && category !== 'all') {
    query.category = new RegExp(category, 'i');
  }

  // Filter by status
  if (status !== 'all') {
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'out-of-stock') {
      query.stock = 0;
    } else if (status === 'low-stock') {
      query.stock = { $gt: 0, $lt: 10 };
    }
  }

  // Search in name and description
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }

  // Determine sort order
  let sortObj = {};
  switch (sortBy) {
    case 'price-high':
      sortObj = { price: -1 };
      break;
    case 'price-low':
      sortObj = { price: 1 };
      break;
    case 'rating':
      sortObj = { rating: -1 };
      break;
    case 'stock':
      sortObj = { stock: -1 };
      break;
    default:
      sortObj = { createdAt: -1 };
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('name price stock rating reviews isActive category createdAt'),
    Product.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    filters: {
      category,
      status,
      search
    },
    data: products.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: formatCurrency(p.price),
      stock: p.stock,
      status: getProductStatus(p),
      rating: p.rating ? p.rating.toFixed(1) : 'N/A',
      reviews: p.reviews || 0,
      isActive: p.isActive,
      createdDate: formatDate(p.createdAt)
    }))
  });
});

/**
 * @route   GET /api/vendor/products/:id
 * @desc    Get single product details
 * @access  Private (Vendor)
 */
exports.getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendor._id;

  const product = await Product.findOne({
    _id: id,
    vendor: vendorId
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Get sales data for this product
  const salesData = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        'items.product': product._id
      }
    },
    {
      $unwind: '$items'
    },
    {
      $match: {
        'items.product': product._id
      }
    },
    {
      $group: {
        _id: null,
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...formatProductResponse(product),
      sales: {
        totalSold: salesData[0]?.totalSold || 0,
        totalRevenue: formatCurrency(salesData[0]?.totalRevenue || 0),
        orders: salesData[0]?.orders || 0,
        averagePrice: formatCurrency(product.price)
      }
    }
  });
});

/**
 * @route   PUT /api/vendor/products/:id
 * @desc    Update product
 * @access  Private (Vendor)
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendor._id;
  const {
    name,
    description,
    category,
    price,
    originalPrice,
    unit,
    stock,
    images,
    isActive,
    specifications
  } = req.body;

  const product = await Product.findOne({
    _id: id,
    vendor: vendorId
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Update fields
  if (name !== undefined) product.name = name.trim();
  if (description !== undefined) product.description = description.trim();
  if (category !== undefined) product.category = category.trim();
  if (price !== undefined) {
    if (parseFloat(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }
    product.price = parseFloat(price);
  }
  if (originalPrice !== undefined) product.originalPrice = parseFloat(originalPrice);
  if (unit !== undefined) product.unit = unit;
  if (stock !== undefined) {
    if (parseInt(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }
    product.stock = parseInt(stock);
  }
  if (images !== undefined) product.images = images;
  if (isActive !== undefined) product.isActive = isActive;
  if (specifications !== undefined) product.specifications = specifications;

  product.updatedAt = new Date();
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: formatProductResponse(product)
  });
});

/**
 * @route   DELETE /api/vendor/products/:id
 * @desc    Delete/deactivate product
 * @access  Private (Vendor)
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendor._id;

  const product = await Product.findOne({
    _id: id,
    vendor: vendorId
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Soft delete (deactivate instead of hard delete)
  product.isActive = false;
  product.updatedAt = new Date();
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from catalogue'
  });
});

/**
 * @route   PATCH /api/vendor/products/:id/stock
 * @desc    Update product stock
 * @access  Private (Vendor)
 */
exports.updateStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendor._id;
  const { quantity, operation = 'set' } = req.body;

  if (quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Quantity is required'
    });
  }

  const product = await Product.findOne({
    _id: id,
    vendor: vendorId
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  let newStock = product.stock;

  switch (operation) {
    case 'add':
      newStock += parseInt(quantity);
      break;
    case 'subtract':
      newStock -= parseInt(quantity);
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reduce stock below zero'
        });
      }
      break;
    case 'set':
      newStock = parseInt(quantity);
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock cannot be negative'
        });
      }
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Use: add, subtract, or set'
      });
  }

  product.stock = newStock;
  product.updatedAt = new Date();
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Stock updated successfully',
    data: {
      productId: product._id,
      name: product.name,
      previousStock: product.stock,
      newStock,
      operation
    }
  });
});

/**
 * @route   POST /api/vendor/products/bulk/update-price
 * @desc    Update prices for multiple products
 * @access  Private (Vendor)
 */
exports.bulkUpdatePrice = asyncHandler(async (req, res) => {
  const { productIds, priceAdjustment, operation = 'set' } = req.body;
  const vendorId = req.vendor._id;

  if (!productIds || productIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Product IDs are required'
    });
  }

  if (priceAdjustment === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Price adjustment is required'
    });
  }

  const products = await Product.find({
    _id: { $in: productIds },
    vendor: vendorId
  });

  if (products.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No products found'
    });
  }

  const updated = [];

  for (const product of products) {
    const oldPrice = product.price;

    if (operation === 'multiply') {
      product.price = Math.max(0, product.price * parseFloat(priceAdjustment));
    } else if (operation === 'add') {
      product.price = Math.max(0, product.price + parseFloat(priceAdjustment));
    } else {
      product.price = Math.max(0, parseFloat(priceAdjustment));
    }

    product.updatedAt = new Date();
    await product.save();

    updated.push({
      id: product._id,
      name: product.name,
      oldPrice: formatCurrency(oldPrice),
      newPrice: formatCurrency(product.price)
    });
  }

  res.status(200).json({
    success: true,
    message: `${updated.length} products updated`,
    data: updated
  });
});

/**
 * @route   POST /api/vendor/products/bulk/update-stock
 * @desc    Update stock for multiple products
 * @access  Private (Vendor)
 */
exports.bulkUpdateStock = asyncHandler(async (req, res) => {
  const { updates } = req.body; // Array of { productId, quantity, operation }
  const vendorId = req.vendor._id;

  if (!updates || updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Updates array is required'
    });
  }

  const updated = [];

  for (const { productId, quantity, operation = 'set' } of updates) {
    const product = await Product.findOne({
      _id: productId,
      vendor: vendorId
    });

    if (!product) continue;

    const oldStock = product.stock;
    let newStock = product.stock;

    switch (operation) {
      case 'add':
        newStock += parseInt(quantity);
        break;
      case 'subtract':
        newStock = Math.max(0, newStock - parseInt(quantity));
        break;
      default:
        newStock = parseInt(quantity);
    }

    product.stock = newStock;
    product.updatedAt = new Date();
    await product.save();

    updated.push({
      id: product._id,
      name: product.name,
      oldStock,
      newStock,
      operation
    });
  }

  res.status(200).json({
    success: true,
    message: `${updated.length} products stock updated`,
    data: updated
  });
});

/**
 * @route   GET /api/vendor/products/analytics
 * @desc    Analytics for products
 * @access  Private (Vendor)
 */
exports.getProductAnalytics = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  const products = await Product.find({
    vendor: vendorId,
    isActive: true
  });

  const [
    topSellers,
    lowestRated,
    outOfStock,
    lowStock
  ] = await Promise.all([
    Order.aggregate([
      { $match: { vendor: vendorId } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]),
    products
      .filter(p => p.rating && p.rating < 3)
      .sort((a, b) => (a.rating || 0) - (b.rating || 0))
      .slice(0, 5),
    products.filter(p => p.stock === 0),
    products.filter(p => p.stock > 0 && p.stock < 10)
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalProducts: products.length,
      performance: {
        activeProducts: products.filter(p => p.isActive).length,
        outOfStock: outOfStock.length,
        lowStock: lowStock.length
      },
      topSellers: topSellers.slice(0, 5),
      alerts: {
        outOfStockCount: outOfStock.length,
        lowStockCount: lowStock.length,
        lowRatedCount: lowestRated.length
      }
    }
  });
});

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function generateSKU(productName) {
  const timestamp = Date.now().toString().slice(-6);
  const name = productName.substring(0, 3).toUpperCase();
  return `${name}${timestamp}`;
}

function formatProductResponse(product) {
  return {
    id: product._id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: formatCurrency(product.price),
    originalPrice: formatCurrency(product.originalPrice),
    unit: product.unit,
    stock: product.stock,
    images: product.images,
    sku: product.sku,
    rating: product.rating ? product.rating.toFixed(1) : 'N/A',
    reviews: product.reviews || 0,
    isActive: product.isActive,
    createdDate: formatDate(product.createdAt),
    updatedDate: formatDate(product.updatedAt)
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
}

function getProductStatus(product) {
  if (!product.isActive) return 'Inactive';
  if (product.stock === 0) return 'Out of Stock';
  if (product.stock < 10) return 'Low Stock';
  return 'Active';
}
