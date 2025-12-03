/**
 * Product Browsing Controller
 * Handles product discovery, search, filtering, and recommendations
 * Inspired by Jumia, Konga, Amazon UK
 */

const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');

/**
 * Get all products with advanced filters
 * GET /api/browse/products
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - category: Filter by category
 * - vendor: Filter by vendor ID
 * - minPrice: Minimum price
 * - maxPrice: Maximum price
 * - inStock: true/false
 * - sort: price_asc, price_desc, newest, popular
 * - search: Search query
 */
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      vendor,
      minPrice,
      maxPrice,
      inStock,
      sort = 'newest',
      search
    } = req.query;

    // Get only approved vendors
    const approvedVendors = await Vendor.find({
      approvalStatus: 'approved',
      isActive: true
    }).select('_id');
    const approvedVendorIds = approvedVendors.map(v => v._id);

    // Build filter object
    const filter = {
      isActive: true, // Only show active products
      vendor: { $in: approvedVendorIds } // Only from approved vendors
    };

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Vendor filter
    if (vendor) {
      filter.vendor = vendor;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      filter.inStock = true;
      filter.stock = { $gt: 0 };
    }

    // Search filter (name and description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'popular':
        sortOption = { 'analytics.views': -1, 'analytics.sales': -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('vendor', 'businessName address rating')
      .select('-__v');

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        filters: {
          category,
          vendor,
          priceRange: { min: minPrice, max: maxPrice },
          inStock,
          sort,
          search
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

/**
 * Get products by category
 * GET /api/browse/categories/:category/products
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;

    const filter = {
      category,
      isActive: true,
      inStock: true
    };

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { 'analytics.sales': -1 };
    else sortOption = { createdAt: -1 };

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('vendor', 'businessName address rating');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

/**
 * Search products
 * GET /api/browse/search
 */
exports.searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search in name, description, and category
    const filter = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    };

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort({ 'analytics.sales': -1, createdAt: -1 }) // Popular first
      .limit(parseInt(limit))
      .skip(skip)
      .populate('vendor', 'businessName address');

    const total = await Product.countDocuments(filter);

    // Get suggested categories
    const categories = await Product.distinct('category', filter);

    res.json({
      success: true,
      data: {
        query: q,
        products,
        suggestions: {
          categories: categories.slice(0, 5) // Top 5 categories
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Get single product details
 * GET /api/browse/products/:productId
 */
exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate('vendor', 'businessName address rating phone email')
      .populate('reviews.customer', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.analytics.views += 1;
    await product.save();

    // Get related products (same category, different vendor)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
      inStock: true
    })
      .limit(8)
      .populate('vendor', 'businessName rating');

    res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product details',
      error: error.message
    });
  }
};

/**
 * Get featured products (for homepage)
 * GET /api/browse/featured
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    // Get products with highest sales and ratings
    const featuredProducts = await Product.find({
      isActive: true,
      inStock: true,
      'analytics.sales': { $gte: 10 } // At least 10 sales
    })
      .sort({ 'analytics.sales': -1, rating: -1 })
      .limit(parseInt(limit))
      .populate('vendor', 'businessName rating');

    res.json({
      success: true,
      data: {
        products: featuredProducts
      }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
};

/**
 * Get deals/offers (discounted products)
 * GET /api/browse/deals
 */
exports.getDeals = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const deals = await Product.find({
      isActive: true,
      inStock: true,
      'pricing.discount': { $gt: 0 }
    })
      .sort({ 'pricing.discount': -1 }) // Highest discount first
      .limit(parseInt(limit))
      .populate('vendor', 'businessName rating');

    res.json({
      success: true,
      data: {
        products: deals
      }
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deals',
      error: error.message
    });
  }
};

/**
 * Get new arrivals
 * GET /api/browse/new-arrivals
 */
exports.getNewArrivals = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Products created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newProducts = await Product.find({
      isActive: true,
      inStock: true,
      createdAt: { $gte: thirtyDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('vendor', 'businessName rating');

    res.json({
      success: true,
      data: {
        products: newProducts
      }
    });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new arrivals',
      error: error.message
    });
  }
};

/**
 * Get products by vendor
 * GET /api/browse/vendors/:vendorId/products
 */
exports.getVendorProducts = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const filter = {
      vendor: vendorId,
      isActive: true
    };

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          description: vendor.description,
          rating: vendor.rating,
          address: vendor.address
        },
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor products',
      error: error.message
    });
  }
};

/**
 * Get all categories with product counts
 * GET /api/browse/categories
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        categories: categories.map(cat => ({
          name: cat._id,
          productCount: cat.count,
          averagePrice: Math.round(cat.avgPrice * 100) / 100
        }))
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

/**
 * Get personalized recommendations for customer
 * GET /api/browse/recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    const customerId = req.user?._id;
    const { limit = 12 } = req.query;

    let recommendations = [];

    if (customerId) {
      // Get customer's favorite categories and vendors
      const customer = await Customer.findOne({ user: customerId });

      if (customer && customer.preferences.favoriteVendors.length > 0) {
        // Recommend products from favorite vendors
        recommendations = await Product.find({
          vendor: { $in: customer.preferences.favoriteVendors },
          isActive: true,
          inStock: true
        })
          .limit(parseInt(limit))
          .populate('vendor', 'businessName rating');
      }
    }

    // If no personalized recommendations, show popular products
    if (recommendations.length === 0) {
      recommendations = await Product.find({
        isActive: true,
        inStock: true
      })
        .sort({ 'analytics.sales': -1, rating: -1 })
        .limit(parseInt(limit))
        .populate('vendor', 'businessName rating');
    }

    res.json({
      success: true,
      data: {
        products: recommendations,
        personalized: customerId ? true : false
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
};

/**
 * Get price range for filters
 * GET /api/browse/price-range
 */
exports.getPriceRange = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;

    const priceStats = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        minPrice: priceStats[0]?.minPrice || 0,
        maxPrice: priceStats[0]?.maxPrice || 1000,
        avgPrice: Math.round((priceStats[0]?.avgPrice || 0) * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get price range error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price range',
      error: error.message
    });
  }
};

module.exports = exports;
