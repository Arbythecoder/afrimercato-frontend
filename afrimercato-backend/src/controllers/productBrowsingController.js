// =================================================================
// PRODUCT BROWSING CONTROLLER - COMPLETE MVP
// =================================================================
// File: src/controllers/productBrowsingController.js
// Handles product search, filtering, and browsing

const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { asyncHandler } = require('../middleware/errorHandler');

// =================================================================
// PRODUCT BROWSING
// =================================================================

/**
 * @route   GET /api/products/browse
 * @desc    Browse products with filtering and pagination
 * @access  Public
 */
exports.browseProducts = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    category, 
    vendor, 
    minPrice, 
    maxPrice, 
    rating,
    inStock = true,
    sortBy = 'createdAt'
  } = req.query;

  const skip = (page - 1) * limit;
  const query = { isActive: true };

  // Filter by category
  if (category) {
    query.category = new RegExp(category, 'i');
  }

  // Filter by vendor
  if (vendor) {
    query.vendor = vendor;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Filter by minimum rating
  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }

  // Filter in-stock items
  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  // Determine sort
  let sortObj = {};
  switch(sortBy) {
    case 'price-low':
      sortObj = { price: 1 };
      break;
    case 'price-high':
      sortObj = { price: -1 };
      break;
    case 'rating':
      sortObj = { rating: -1 };
      break;
    case 'newest':
      sortObj = { createdAt: -1 };
      break;
    default:
      sortObj = { createdAt: -1 };
  }

  const products = await Product.find(query)
    .populate('vendor', 'storeName logo location.city')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: products
  });
});

/**
 * @route   GET /api/products/:productId
 * @desc    Get product details
 * @access  Public
 */
exports.getProductDetails = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId)
    .populate('vendor', 'storeName logo location.address location.city rating reviews')
    .populate('reviews.customerId', 'name avatar');

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (!product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product is no longer available'
    });
  }

  // Get related products from same vendor
  const relatedProducts = await Product.find({
    vendor: product.vendor._id,
    category: product.category,
    _id: { $ne: productId },
    isActive: true
  })
    .limit(5)
    .select('name price images rating reviews vendor');

  res.status(200).json({
    success: true,
    data: {
      ...product.toObject(),
      relatedProducts
    }
  });
});

/**
 * @route   GET /api/products/search
 * @desc    Search products by name, description, or category
 * @access  Public
 */
exports.searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }

  const searchRegex = new RegExp(q, 'i');
  const skip = (page - 1) * limit;

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex }
    ]
  })
    .populate('vendor', 'storeName logo')
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments({
    isActive: true,
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex }
    ]
  });

  res.status(200).json({
    success: true,
    query: q,
    count: products.length,
    total,
    pages: Math.ceil(total / limit),
    data: products
  });
});

/**
 * @route   GET /api/products/categories
 * @desc    Get all product categories
 * @access  Public
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });

  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => ({
      name: category,
      count: await Product.countDocuments({ category, isActive: true })
    }))
  );

  // Sort by count descending
  categoriesWithCount.sort((a, b) => b.count - a.count);

  res.status(200).json({
    success: true,
    count: categoriesWithCount.length,
    data: categoriesWithCount
  });
});

/**
 * @route   GET /api/products/vendors
 * @desc    Get featured vendors
 * @access  Public
 */
exports.getFeaturedVendors = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // Show all approved, verified, and active vendors
  // New vendors are auto-approved, so they appear immediately
  const vendors = await Vendor.find({
    isActive: true,
    $or: [
      { isVerified: true },
      { approvalStatus: 'approved' }
    ]
  })
    .sort({ createdAt: -1, rating: -1, totalOrders: -1 }) // Show newest first
    .limit(parseInt(limit))
    .select('storeName logo location.city rating reviews totalOrders storeDescription category createdAt');

  res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors
  });
});

/**
 * @route   GET /api/products/vendor/:vendorId
 * @desc    Get all products from a specific vendor
 * @access  Public
 */
exports.getVendorProducts = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { page = 1, limit = 20, category, sortBy = 'createdAt' } = req.query;

  const skip = (page - 1) * limit;

  // Verify vendor exists
  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  const query = { vendor: vendorId, isActive: true };

  if (category) {
    query.category = new RegExp(category, 'i');
  }

  let sortObj = {};
  switch(sortBy) {
    case 'price-low':
      sortObj = { price: 1 };
      break;
    case 'price-high':
      sortObj = { price: -1 };
      break;
    case 'rating':
      sortObj = { rating: -1 };
      break;
    case 'newest':
      sortObj = { createdAt: -1 };
      break;
    default:
      sortObj = { createdAt: -1 };
  }

  const products = await Product.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    vendor: {
      id: vendor._id,
      name: vendor.storeName,
      logo: vendor.logo,
      rating: vendor.rating,
      reviews: vendor.reviews
    },
    count: products.length,
    total,
    pages: Math.ceil(total / limit),
    data: products
  });
});

/**
 * @route   GET /api/products/trending
 * @desc    Get trending products
 * @access  Public
 */
exports.getTrendingProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // Trending = high rating + high review count + recent orders
  const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
    .populate('vendor', 'storeName logo')
    .sort({ rating: -1, reviews: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .select('name price images rating reviews category vendor');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

/**
 * @route   GET /api/products/deals
 * @desc    Get discounted/deal products
 * @access  Public
 */
exports.getDealProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // Deals = products with originalPrice significantly higher than price
  const products = await Product.find({
    isActive: true,
    stock: { $gt: 0 },
    originalPrice: { $exists: true, $gt: 0 }
  })
    .populate('vendor', 'storeName logo')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  // Calculate discount percentage
  const dealsWithDiscount = products.map(product => {
    const discount = Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
    return {
      ...product.toObject(),
      discount,
      savingsAmount: Math.round((product.originalPrice - product.price) * 100) / 100
    };
  });

  // Sort by discount percentage
  dealsWithDiscount.sort((a, b) => b.discount - a.discount);

  res.status(200).json({
    success: true,
    count: dealsWithDiscount.length,
    data: dealsWithDiscount
  });
});

/**
 * @route   GET /api/products/nearby
 * @desc    Get products from nearby vendors (based on location)
 * @access  Public
 */
exports.getNearbyProducts = asyncHandler(async (req, res) => {
  const { city, limit = 20, category } = req.query;

  if (!city) {
    return res.status(400).json({
      success: false,
      message: 'City is required'
    });
  }

  const query = { 
    'location.city': new RegExp(city, 'i'),
    isActive: true,
    isVerified: true
  };

  const vendors = await Vendor.find(query).select('_id');
  const vendorIds = vendors.map(v => v._id);

  const productQuery = { 
    vendor: { $in: vendorIds },
    isActive: true
  };

  if (category) {
    productQuery.category = new RegExp(category, 'i');
  }

  const products = await Product.find(productQuery)
    .populate('vendor', 'storeName logo location.city')
    .limit(parseInt(limit))
    .sort({ rating: -1 });

  res.status(200).json({
    success: true,
    city,
    count: products.length,
    data: products
  });
});

/**
 * @route   GET /api/products/recommendations
 * @desc    Get product recommendations based on browsing history
 * @access  Private (customer)
 */
exports.getRecommendations = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // For MVP, recommend based on popular products
  // In production, use browsing history, cart, orders, etc.
  const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
    .populate('vendor', 'storeName logo')
    .sort({ rating: -1, reviews: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

/**
 * @route   GET /api/products/new
 * @desc    Get newly added products
 * @access  Public
 */
exports.getNewProducts = asyncHandler(async (req, res) => {
  const { limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const products = await Product.find({ isActive: true })
    .populate('vendor', 'storeName logo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments({ isActive: true });

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / limit),
    data: products
  });
});
