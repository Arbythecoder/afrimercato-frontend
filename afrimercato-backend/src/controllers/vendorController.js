// =================================================================
// VENDOR CONTROLLER - COMPLETE & FIXED
// =================================================================
// File: src/controllers/vendorController.js
// Handles all vendor operations: products, orders, dashboard, profile

const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { getFileUrl } = require('../middleware/upload');
const { processVendorVerification } = require('../services/autoApprovalService');
const { sendStoreProfileCreatedEmail } = require('../emails/vendorEmails');
const { generateAccessToken, generateRefreshToken, setAuthCookies, formatUserResponse } = require('../utils/authHelpers');
const { sendVerificationEmail } = require('../utils/emailService');

// =================================================================
// VENDOR PROFILE OPERATIONS
// =================================================================

// =================================================================
// @route   POST /api/vendor/register
// @desc    Register a new vendor
// @access  Public
// =================================================================
// =================================================================
// @route   POST /api/vendor/register
// @desc    Register a new vendor
// @access  Public
// =================================================================
exports.registerVendor = asyncHandler(async (req, res) => {
  const {
    storeName,
    fullName,
    email,
    phone,
    password,
    storeDescription,
    category,
    address
  } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'A user with this email already exists',
      errorCode: 'EMAIL_EXISTS',
      userMessage: 'This email is already registered. Please use a different email or login.'
    });
  }

  // Create user account (password will be hashed automatically by User model pre-save hook)
  const user = await User.create({
    name: fullName,
    firstName: fullName ? fullName.split(' ')[0] : '',
    lastName: fullName ? fullName.split(' ').slice(1).join(' ') : '',
    email,
    password, // Will be hashed by User model middleware
    phone,
    roles: ['vendor'],
    primaryRole: 'vendor',
    emailVerified: false,
    verified: false
  });

  // Generate unique store ID
  const storeId = await generateUniqueStoreId(category);

  // Create vendor profile with PENDING status (requires email verification)
  const vendor = await Vendor.create({
    user: user._id,
    storeId,
    storeName,
    description: storeDescription,
    category,
    address,
    phone,
    approvalStatus: 'pending',
    isVerified: false,
    isPublic: false,
    isActive: true,
    submittedForReviewAt: new Date()
  });

  // Generate email verification token and send verification email
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();
  
  // Send verification email
  await sendVerificationEmail(email, verificationToken, user.firstName);

  // Generate JWT tokens (same as customer registration)
  const token = generateAccessToken({ 
    id: user._id, 
    roles: user.roles, 
    email: user.email 
  });
  const refreshToken = generateRefreshToken();

  // Set secure HTTP-only cookies
  setAuthCookies(res, token, refreshToken);

  // Return success response with token and user data
  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email to access all features.',
    data: {
      token,
      refreshToken,
      user: formatUserResponse(user, 'vendor'),
      vendor: {
        id: vendor._id,
        storeId: vendor.storeId,
        storeName: vendor.storeName,
        approvalStatus: vendor.approvalStatus,
        emailVerified: false,
        requiresVerification: true
      }
    }
  });
});

/**
 * @route   POST /api/vendor/profile
 * @desc    Create vendor profile
 * @access  Private (User with role='vendor')
 */
// =================================================================
// UPDATED VENDOR CONTROLLER - FOR AUTO-APPROVAL SYSTEM
// =================================================================
// Replace the createVendorProfile function in src/controllers/vendorController.js
// Lines 22-74 with this version:

exports.createVendorProfile = asyncHandler(async (req, res) => {
  const {
    storeName,
    description,
    category,
    address,
    phone,
    alternativePhone,
    businessHours,
    bankDetails
  } = req.body;

  // Check if vendor profile already exists
  const existingVendor = await Vendor.findOne({ user: req.user.id });
  
  if (existingVendor) {
    return res.status(400).json({
      success: false,
      message: 'Vendor profile already exists',
      errorCode: 'VENDOR_EXISTS'
    });
  }

  // Generate unique store ID
  const storeId = await generateUniqueStoreId(category);

  // Create vendor profile with PENDING status
  // Will be auto-approved by cron job in 24-48 hours
  const vendor = await Vendor.create({
    storeId,
    user: req.user.id,
    storeName,
    description: description || '',
    category,
    address,
    phone,
    alternativePhone,
    businessHours: businessHours || undefined,
    bankDetails: bankDetails || undefined,
    
    // Auto-approval settings - PRODUCTION READY
    approvalStatus: 'approved', // Auto-approve for launch
    submittedForReviewAt: new Date(),
    approvedAt: new Date(),
    isVerified: true, // Auto-verify for production
    isPublic: true, // Visible to customers immediately
    isActive: true
  });

  // Send professional store profile created email (like Uber Eats)
  try {
    const user = await User.findById(req.user.id);
    if (user && user.email) {
      await sendStoreProfileCreatedEmail(user, vendor);
      console.log(`📧 Store profile created email sent to: ${user.email}`);
    }
  } catch (emailError) {
    console.error('Failed to send store profile email:', emailError);
    // Don't fail the whole request if email fails
  }

  // Trigger auto-verification process in background
  // This will automatically approve the vendor after checks pass
  try {
    // Run verification asynchronously (don't wait for it)
    processVendorVerification(vendor._id).catch(err => {
      console.error('Auto-verification failed for vendor:', vendor._id, err);
    });
    console.log(`🔄 Auto-verification initiated for vendor: ${vendor.storeName}`);
  } catch (verificationError) {
    console.error('Failed to initiate auto-verification:', verificationError);
    // Don't fail the request if verification initiation fails
  }

  res.status(201).json({
    success: true,
    message: 'Vendor profile created successfully! Your store is now live.',
    data: {
      vendor,
      approvalStatus: vendor.approvalStatus,
      isVerified: vendor.isVerified,
      canAddProducts: true,
      canReceiveOrders: vendor.isVerified && vendor.approvalStatus === 'approved',
      isPublic: vendor.isPublic
    }
  });
});

// Helper function to generate unique store ID
const generateUniqueStoreId = async (category) => {
  const categoryPrefixes = {
    'fresh-produce': 'FP',
    'groceries': 'GR',
    'meat-fish': 'MF',
    'bakery': 'BK',
    'beverages': 'BV',
    'household': 'HH',
    'beauty-health': 'BH',
    'snacks': 'SN',
    'other': 'OT'
  };

  const prefix = categoryPrefixes[category] || 'ST';

  // Get count of vendors in this category
  const count = await Vendor.countDocuments({ category });
  const sequenceNumber = String(count + 1).padStart(4, '0');

  // Generate random characters
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${sequenceNumber}-${randomChars}`;
};

/**
 * @route   GET /api/vendor/profile
 * @desc    Get vendor profile
 * @access  Private (Vendor)
 */
exports.getVendorProfile = asyncHandler(async (req, res) => {
  // Safety check - req.vendor should be set by attachVendor middleware
  if (!req.vendor || !req.vendor._id) {
    return res.status(403).json({
      success: false,
      message: 'Vendor profile not found. Please complete vendor registration first.',
      errorCode: 'VENDOR_NOT_ATTACHED'
    });
  }

  const vendor = await Vendor.findById(req.vendor._id).populate(
    'user',
    'name email phone approvalStatus approvedAt'
  );

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  // Include user account approval status for frontend
  const userApprovalStatus = req.user?.approvalStatus || 'pending';
  const isPendingApproval = req.vendorPendingApproval || false;

  res.json({
    success: true,
    data: {
      vendor,
      userApprovalStatus,
      isPendingApproval,
      // Add helpful message for pending vendors
      ...(isPendingApproval && {
        message: 'Your account is pending approval. You can set up your store, but it won\'t be visible to customers until approved.'
      })
    }
  });
});

/**
 * @route   PUT /api/vendor/profile
 * @desc    Update vendor profile
 * @access  Private (Vendor)
 */
exports.updateVendorProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'storeName',
    'description',
    'address',
    'phone',
    'alternativePhone',
    'businessHours',
    'socialMedia',
    'deliveryRadius',
    'deliveryFee',
    'freeDeliveryAbove',
    'deliverySettings',
    'isClosed',
    'closureReason'
  ];

  const vendor = await Vendor.findById(req.vendor._id);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  // Update only allowed fields
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      vendor[field] = req.body[field];
    }
  });

  await vendor.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { vendor }
  });
});

/**
 * @route   POST /api/vendor/profile/logo
 * @desc    Upload vendor logo
 * @access  Private (Vendor)
 */
exports.uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a logo image',
      errorCode: 'NO_FILE'
    });
  }

  const vendor = await Vendor.findById(req.vendor._id);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  vendor.logo = getFileUrl(req.file.path);
  await vendor.save();

  res.json({
    success: true,
    message: 'Logo uploaded successfully',
    data: {
      logo: vendor.logo
    }
  });
});

/**
 * @route   GET /api/vendor/delivery-settings
 * @desc    Get vendor delivery settings (Premium feature)
 * @access  Private (Vendor)
 */
exports.getDeliverySettings = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  res.json({
    success: true,
    message: 'Delivery settings retrieved successfully',
    data: {
      deliverySettings: vendor.deliverySettings || {
        estimatedPrepTime: 30,
        minimumOrderValue: 0,
        acceptingOrders: true,
        autoAcceptOrders: false,
        maxOrdersPerHour: 20,
        deliverySlots: { enabled: false, slots: [] },
        peakHours: []
      },
      deliveryRadius: vendor.deliveryRadius,
      deliveryFee: vendor.deliveryFee,
      freeDeliveryAbove: vendor.freeDeliveryAbove
    }
  });
});

/**
 * @route   PUT /api/vendor/delivery-settings
 * @desc    Update vendor delivery settings (Premium feature)
 * @access  Private (Vendor)
 */
exports.updateDeliverySettings = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  const {
    estimatedPrepTime,
    minimumOrderValue,
    acceptingOrders,
    autoAcceptOrders,
    maxOrdersPerHour,
    deliverySlots,
    peakHours
  } = req.body;

  // Validate and update delivery settings
  if (estimatedPrepTime !== undefined) {
    if (estimatedPrepTime < 5 || estimatedPrepTime > 180) {
      return res.status(400).json({
        success: false,
        message: 'Estimated prep time must be between 5 and 180 minutes',
        errorCode: 'INVALID_PREP_TIME'
      });
    }
    vendor.deliverySettings.estimatedPrepTime = estimatedPrepTime;
  }

  if (minimumOrderValue !== undefined) {
    vendor.deliverySettings.minimumOrderValue = Math.max(0, minimumOrderValue);
  }

  if (acceptingOrders !== undefined) {
    vendor.deliverySettings.acceptingOrders = acceptingOrders;
  }

  if (autoAcceptOrders !== undefined) {
    vendor.deliverySettings.autoAcceptOrders = autoAcceptOrders;
  }

  if (maxOrdersPerHour !== undefined) {
    vendor.deliverySettings.maxOrdersPerHour = Math.min(Math.max(1, maxOrdersPerHour), 100);
  }

  if (deliverySlots !== undefined) {
    vendor.deliverySettings.deliverySlots = deliverySlots;
  }

  if (peakHours !== undefined) {
    vendor.deliverySettings.peakHours = peakHours;
  }

  await vendor.save();

  res.json({
    success: true,
    message: 'Delivery settings updated successfully',
    data: {
      deliverySettings: vendor.deliverySettings
    }
  });
});

// =================================================================
// DASHBOARD OPERATIONS
// =================================================================

/**
 * @route   GET /api/vendor/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Vendor)
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const isPending = req.vendorPendingApproval === true;

  // Get date ranges
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Run multiple queries in parallel
  const [
    totalProducts,
    activeProducts,
    lowStockProducts,
    totalOrders,
    monthlyOrders,
    weeklyOrders,
    todayOrders,
    pendingOrders,
    readyToShipOrders,
    recentOrders,
    allOrders
  ] = await Promise.all([
    // Total products
    Product.countDocuments({ vendor: vendorId }),

    // Active products
    Product.countDocuments({ vendor: vendorId, inStock: true }),

    // Low stock products (stock <= 10 or stock <= lowStockThreshold)
    Product.find({
      vendor: vendorId,
      stock: { $lte: 10 },
      inStock: true
    })
      .select('name stock lowStockThreshold unit')
      .limit(10),

    // All time orders
    Order.countDocuments({ vendor: vendorId }),

    // This month's orders
    Order.countDocuments({
      vendor: vendorId,
      createdAt: { $gte: startOfMonth }
    }),

    // This week's orders
    Order.countDocuments({
      vendor: vendorId,
      createdAt: { $gte: startOfWeek }
    }),

    // Today's orders
    Order.countDocuments({
      vendor: vendorId,
      createdAt: { $gte: startOfToday }
    }),

    // Pending orders
    Order.countDocuments({
      vendor: vendorId,
      status: { $in: ['pending', 'confirmed'] }
    }),

    // Ready to ship orders
    Order.countDocuments({
      vendor: vendorId,
      status: 'ready_for_pickup'
    }),

    // Recent orders
    Order.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name email')
      .select('orderNumber customer status pricing createdAt items'),

    // All orders for revenue
    Order.find({
      vendor: vendorId,
      status: { $ne: 'cancelled' }
    }).select('pricing createdAt items')
  ]);

  // Calculate revenues
  const totalRevenue = allOrders.reduce(
    (sum, order) => sum + (order.pricing?.total || 0),
    0
  );

  const monthlyRevenue = allOrders
    .filter((order) => order.createdAt >= startOfMonth)
    .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

  const weeklyRevenue = allOrders
    .filter((order) => order.createdAt >= startOfWeek)
    .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

  const todayRevenue = allOrders
    .filter((order) => order.createdAt >= startOfToday)
    .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

  // Calculate units sold today
  const todayUnits = allOrders
    .filter((order) => order.createdAt >= startOfToday)
    .reduce((sum, order) => {
      const units = order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0;
      return sum + units;
    }, 0);

  // Calculate average order value for today
  const todayAvgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

  // Get top selling products
  const topProducts = await Order.aggregate([
    { $match: { vendor: vendorId, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $project: {
        name: '$productDetails.name',
        image: { $arrayElemAt: ['$productDetails.images', 0] },
        totalQuantity: 1,
        totalRevenue: 1
      }
    }
  ]);

  // Calculate how long vendor has been pending
  let hoursWaiting = 0;
  let approvalMessage = null;

  if (isPending && req.vendor.submittedForReviewAt) {
    hoursWaiting = Math.floor((now - req.vendor.submittedForReviewAt) / (1000 * 60 * 60));
    const hoursRemaining = Math.max(0, 24 - hoursWaiting);

    if (hoursWaiting < 24) {
      approvalMessage = `Your store is under review. Estimated approval in ${hoursRemaining} hours. You can add products and set up your store while waiting.`;
    } else {
      approvalMessage = 'Your store is being verified by our automated system. This usually takes 24-48 hours. You can continue setting up your store.';
    }
  }

  res.json({
    success: true,
    data: {
      totalProducts,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      monthlyGrowth: 0, // TODO: Calculate vs last month
      pendingOrders,
      readyToShipOrders,
      lowStockProducts,
      recentOrders,
      topProducts,
      accountHealth: 95, // TODO: Calculate based on metrics
      todayStats: {
        orders: todayOrders,
        revenue: Math.round(todayRevenue * 100) / 100,
        units: todayUnits,
        avgOrderValue: Math.round(todayAvgOrderValue * 100) / 100
      },
      weekStats: {
        orders: weeklyOrders,
        revenue: Math.round(weeklyRevenue * 100) / 100
      },
      metrics: {
        fulfillmentRate: 95,
        responseTime: 2,
        cancellationRate: 2
      },
      // Add approval status info for frontend to display
      approvalStatus: {
        isPending: isPending,
        status: req.vendor.approvalStatus,
        message: approvalMessage,
        hoursWaiting: hoursWaiting,
        submittedAt: req.vendor.submittedForReviewAt,
        canReceiveOrders: !isPending, // Can only receive orders after approval
        storeVisible: !isPending // Store only visible to customers after approval
      }
    }
  });
});

/**
 * @route   GET /api/vendor/dashboard/chart-data
 * @desc    Get chart data for dashboard
 * @access  Private (Vendor)
 */
exports.getDashboardChartData = asyncHandler(async (req, res) => {
  const { timeRange = '7d' } = req.query;
  const vendorId = req.vendor._id;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default: // 7d
      startDate.setDate(startDate.getDate() - 7);
  }

  const orders = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        status: { $ne: 'cancelled' },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Format data for charts
  const chartData = orders.map((day) => ({
    date: day._id,
    revenue: Math.round(day.revenue * 100) / 100,
    orders: day.orders
  }));

  res.json({
    success: true,
    data: chartData
  });
});

// =================================================================
// PRODUCT OPERATIONS
// =================================================================

/**
 * @route   GET /api/vendor/products
 * @desc    Get all vendor products with filters
 * @access  Private (Vendor)
 */
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    inStock,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  // Build filter
  const filter = { vendor: req.vendor._id };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (inStock !== undefined) {
    filter.inStock = inStock === 'true';
  }

  // Build sort
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Execute query with pagination
  const products = await Product.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(filter);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasMore: page * limit < total
      }
    }
  });
});

/**
 * @route   GET /api/vendor/products/:id
 * @desc    Get single product
 * @access  Private (Vendor)
 */
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    vendor: req.vendor._id
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
      errorCode: 'PRODUCT_NOT_FOUND'
    });
  }

  res.json({
    success: true,
    data: { product }
  });
});

/**
 * @route   POST /api/vendor/products
 * @desc    Create new product
 * @access  Private (Vendor)
 */
exports.createProduct = asyncHandler(async (req, res) => {
  // Check if images were uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one product image is required',
      errorCode: 'NO_IMAGES',
      userMessage: 'Please upload at least one product image'
    });
  }

  // Parse numeric fields
  let price = parseFloat(req.body.price);
  let stock = req.body.stock ? parseInt(req.body.stock) : 0;
  let originalPrice = req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined;
  let lowStockThreshold = req.body.lowStockThreshold ? parseInt(req.body.lowStockThreshold) : 10;

  // Validate numeric conversions
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a valid positive number',
      errorCode: 'INVALID_PRICE'
    });
  }

  if (isNaN(stock) || stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock must be a valid non-negative number',
      errorCode: 'INVALID_STOCK'
    });
  }

  // Convert uploaded files to image URLs (schema expects string[])
  const images = req.files
    .map((file) => getFileUrl(file.path))
    .filter(url => typeof url === 'string' && url.length > 0);

  // Create product data
  const productData = {
    vendor: req.vendor._id,
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    price,
    stock,
    unit: req.body.unit,
    originalPrice,
    lowStockThreshold,
    images,
    // Optional fields
    tags: req.body.tags ? (typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags) : [],
    variants: req.body.variants ? (typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants) : [],
    availability: req.body.availability ? (typeof req.body.availability === 'string' ? JSON.parse(req.body.availability) : req.body.availability) : {},
    unlimitedStock: req.body.unlimitedStock === 'true' || req.body.unlimitedStock === true
  };

  const product = await Product.create(productData);

  // Update vendor's total products count (use updateOne to avoid full document validation)
  await Vendor.updateOne(
    { _id: req.vendor._id },
    { $inc: { 'stats.totalProducts': 1 } }
  );

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

/**
 * @route   PUT /api/vendor/products/:id
 * @desc    Update product
 * @access  Private (Vendor)
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findOne({
    _id: req.params.id,
    vendor: req.vendor._id
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
      errorCode: 'PRODUCT_NOT_FOUND'
    });
  }

  // Build update data from form fields
  const updateData = {};

  // Only update fields that are provided
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.description) updateData.description = req.body.description;
  if (req.body.category) updateData.category = req.body.category;
  if (req.body.unit) updateData.unit = req.body.unit;
  if (req.body.price) updateData.price = parseFloat(req.body.price);
  if (req.body.originalPrice) updateData.originalPrice = parseFloat(req.body.originalPrice);
  if (req.body.stock !== undefined) updateData.stock = parseInt(req.body.stock);
  if (req.body.lowStockThreshold) updateData.lowStockThreshold = parseInt(req.body.lowStockThreshold);
  if (req.body.inStock !== undefined) updateData.inStock = req.body.inStock === 'true' || req.body.inStock === true;
  if (req.body.unlimitedStock !== undefined) updateData.unlimitedStock = req.body.unlimitedStock === 'true' || req.body.unlimitedStock === true;

  // Handle new uploaded images
  if (req.files && req.files.length > 0) {
    updateData.images = req.files
      .map((file) => getFileUrl(file.path))
      .filter(url => typeof url === 'string' && url.length > 0);
  }
  // Handle images passed as URLs in body (for keeping existing images)
  else if (req.body.images) {
    const images = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
    if (Array.isArray(images)) {
      updateData.images = images
        .map(img => (typeof img === 'string' ? img : img?.url))
        .filter(url => typeof url === 'string' && url.length > 0);
    }
  }

  // Parse JSON fields
  if (req.body.tags) {
    updateData.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
  }
  if (req.body.variants) {
    updateData.variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
  }
  if (req.body.availability) {
    updateData.availability = typeof req.body.availability === 'string' ? JSON.parse(req.body.availability) : req.body.availability;
  }

  product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: false  // Disable validators to avoid issues with partial updates
  });

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

/**
 * @route   DELETE /api/vendor/products/:id
 * @desc    Delete product
 * @access  Private (Vendor)
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    vendor: req.vendor._id
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
      errorCode: 'PRODUCT_NOT_FOUND'
    });
  }

  await product.deleteOne();

  // Update vendor's total products count (use updateOne to avoid full document validation)
  await Vendor.updateOne(
    { _id: req.vendor._id },
    { $inc: { 'stats.totalProducts': -1 } }
  );

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

/**
 * @route   PATCH /api/vendor/products/:id/stock
 * @desc    Update product stock
 * @access  Private (Vendor)
 */
exports.updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock must be a non-negative number',
      errorCode: 'INVALID_STOCK'
    });
  }

  const product = await Product.findOne({
    _id: req.params.id,
    vendor: req.vendor._id
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
      errorCode: 'PRODUCT_NOT_FOUND'
    });
  }

  product.stock = stock;
  await product.save();

  res.json({
    success: true,
    message: 'Stock updated successfully',
    data: { product }
  });
});

// =================================================================
// BULK OPERATIONS
// =================================================================

/**
 * @route   POST /api/vendor/products/bulk-delete
 * @desc    Delete multiple products
 * @access  Private (Vendor)
 */
exports.bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Product IDs array is required',
      errorCode: 'INVALID_INPUT'
    });
  }

  const result = await Product.deleteMany({
    _id: { $in: productIds },
    vendor: req.vendor._id
  });

  // Update vendor's total products count
  req.vendor.stats.totalProducts = Math.max(
    0,
    req.vendor.stats.totalProducts - result.deletedCount
  );
  await req.vendor.save();

  res.json({
    success: true,
    message: `${result.deletedCount} product(s) deleted successfully`,
    data: { deletedCount: result.deletedCount }
  });
});

/**
 * @route   POST /api/vendor/products/bulk-status
 * @desc    Update status of multiple products
 * @access  Private (Vendor)
 */
exports.bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { productIds, isActive } = req.body;

  if (!Array.isArray(productIds) || typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      errorCode: 'INVALID_INPUT'
    });
  }

  const result = await Product.updateMany(
    {
      _id: { $in: productIds },
      vendor: req.vendor._id
    },
    { isActive }
  );

  res.json({
    success: true,
    message: `Status updated for ${result.modifiedCount} product(s)`,
    data: { modifiedCount: result.modifiedCount }
  });
});

/**
 * @route   POST /api/vendor/products/bulk-price
 * @desc    Update prices of multiple products
 * @access  Private (Vendor)
 */
exports.bulkUpdatePrices = asyncHandler(async (req, res) => {
  const { productIds, type, value } = req.body;

  if (!Array.isArray(productIds) || !['fixed', 'percentage'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      errorCode: 'INVALID_INPUT'
    });
  }

  if (type === 'percentage') {
    const products = await Product.find({
      _id: { $in: productIds },
      vendor: req.vendor._id
    });

    for (const product of products) {
      product.price = Math.round(product.price * (1 + value / 100) * 100) / 100;
      await product.save();
    }

    return res.json({
      success: true,
      message: `Prices updated for ${products.length} product(s)`,
      data: { modifiedCount: products.length }
    });
  }

  // Fixed price update
  const result = await Product.updateMany(
    {
      _id: { $in: productIds },
      vendor: req.vendor._id
    },
    { price: value }
  );

  res.json({
    success: true,
    message: `Prices updated for ${result.modifiedCount} product(s)`,
    data: { modifiedCount: result.modifiedCount }
  });
});

/**
 * @route   POST /api/vendor/products/bulk-stock
 * @desc    Update stock of multiple products
 * @access  Private (Vendor)
 */
exports.bulkUpdateStock = asyncHandler(async (req, res) => {
  const { productIds, type, value } = req.body;

  if (!Array.isArray(productIds) || !['set', 'adjust'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      errorCode: 'INVALID_INPUT'
    });
  }

  const products = await Product.find({
    _id: { $in: productIds },
    vendor: req.vendor._id
  });

  for (const product of products) {
    if (type === 'set') {
      product.stock = Math.max(0, value);
    } else {
      // adjust
      product.stock = Math.max(0, product.stock + value);
    }
    await product.save();
  }

  res.json({
    success: true,
    message: `Stock updated for ${products.length} product(s)`,
    data: { modifiedCount: products.length }
  });
});

// =================================================================
// ORDER OPERATIONS
// =================================================================

/**
 * @route   GET /api/vendor/orders
 * @desc    Get all vendor orders with filters
 * @access  Private (Vendor)
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    startDate,
    endDate,
    search
  } = req.query;

  // Build filter - use items.vendor for proper isolation
  const filter = { 'items.vendor': req.vendor._id };

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    filter.orderNumber = { $regex: search, $options: 'i' };
  }

  // Execute query
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name');

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasMore: page * limit < total
      }
    }
  });
});

/**
 * @route   GET /api/vendor/orders/:id
 * @desc    Get single order details
 * @access  Private (Vendor)
 */
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    vendor: req.vendor._id
  })
    .populate('customer', 'name email phone')
    .populate('items.product', 'name images')
    .populate('delivery.rider', 'name phone');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
      errorCode: 'ORDER_NOT_FOUND'
    });
  }

  res.json({
    success: true,
    data: { order }
  });
});

/**
 * @route   PUT /api/vendor/orders/:id/status
 * @desc    Update order status
 * @access  Private (Vendor)
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    vendor: req.vendor._id
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
      errorCode: 'ORDER_NOT_FOUND'
    });
  }

  // Validate status transition
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready'],
    ready: ['out-for-delivery'],
    'out-for-delivery': ['delivered'],
    delivered: ['completed']
  };

  const allowedStatuses = validTransitions[order.status];

  if (!allowedStatuses || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot change status from ${order.status} to ${status}`,
      errorCode: 'INVALID_STATUS_TRANSITION'
    });
  }

  // Update status
  order.status = status;

  // Add to status history
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note: note || '',
    updatedBy: req.user.id
  });

  // Handle cancellation
  if (status === 'cancelled') {
    order.cancellation = {
      cancelledBy: 'vendor',
      reason: note || 'Cancelled by vendor',
      cancelledAt: new Date()
    };
  }

  await order.save();

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: { order }
  });
});

/**
 * @route   POST /api/vendor/orders/:id/rate-rider
 * @desc    Rate delivery rider for an order
 * @access  Private (Vendor)
 */
exports.rateRider = asyncHandler(async (req, res) => {
  const { rating, feedback } = req.body;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5',
      errorCode: 'INVALID_RATING'
    });
  }

  const order = await Order.findOne({
    _id: req.params.id,
    vendor: req.vendor._id
  }).populate('rider', 'name phone email');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
      errorCode: 'ORDER_NOT_FOUND'
    });
  }

  // Check if order is delivered or completed
  if (!['delivered', 'completed'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'Can only rate rider after order is delivered',
      errorCode: 'ORDER_NOT_DELIVERED'
    });
  }

  // Check if rider is assigned
  if (!order.rider) {
    return res.status(400).json({
      success: false,
      message: 'No rider assigned to this order',
      errorCode: 'NO_RIDER_ASSIGNED'
    });
  }

  // Check if already rated
  if (order.riderRating) {
    return res.status(400).json({
      success: false,
      message: 'You have already rated this rider',
      errorCode: 'ALREADY_RATED'
    });
  }

  // Add rating to order
  order.riderRating = {
    rating: Number(rating),
    feedback: feedback ? feedback.trim() : '',
    ratedAt: new Date()
  };

  await order.save();

  // Update rider's average rating (if Rider model exists)
  try {
    const Rider = require('../models/Rider');
    if (Rider) {
      const rider = await Rider.findById(order.rider._id);
      if (rider) {
        const totalRatings = rider.totalRatings || 0;
        const currentRating = rider.rating || 0;
        const newTotalRatings = totalRatings + 1;
        const newRating = ((currentRating * totalRatings) + Number(rating)) / newTotalRatings;

        rider.rating = Math.round(newRating * 10) / 10; // Round to 1 decimal
        rider.totalRatings = newTotalRatings;
        await rider.save();
      }
    }
  } catch (error) {
    console.error('Error updating rider rating:', error);
    // Continue even if rider rating update fails
  }

  res.json({
    success: true,
    message: 'Rider rating submitted successfully',
    data: {
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        riderRating: order.riderRating,
        rider: order.rider
      }
    }
  });
});

// =================================================================
// ANALYTICS & REPORTS
// =================================================================

/**
 * @route   GET /api/vendor/analytics/revenue
 * @desc    Get revenue analytics
 * @access  Private (Vendor)
 */
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const vendorId = req.vendor._id;

  let groupBy;
  let dateRange = new Date();

  switch (period) {
    case 'day':
      groupBy = { $hour: '$createdAt' };
      dateRange.setHours(0, 0, 0, 0);
      break;
    case 'week':
      groupBy = { $dayOfWeek: '$createdAt' };
      dateRange.setDate(dateRange.getDate() - 7);
      break;
    case 'year':
      groupBy = { $month: '$createdAt' };
      dateRange.setFullYear(dateRange.getFullYear() - 1);
      break;
    default:
      // month
      groupBy = { $dayOfMonth: '$createdAt' };
      dateRange.setDate(1);
  }

  const revenueData = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        status: { $ne: 'cancelled' },
        createdAt: { $gte: dateRange }
      }
    },
    {
      $group: {
        _id: groupBy,
        totalRevenue: { $sum: '$pricing.total' },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: '$pricing.total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      period,
      revenueData
    }
  });
});

/**
 * @route   GET /api/vendor/analytics/products
 * @desc    Get product performance analytics
 * @access  Private (Vendor)
 */
exports.getProductAnalytics = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  const productStats = await Order.aggregate([
    { $match: { vendor: vendorId, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        name: '$product.name',
        category: '$product.category',
        currentStock: '$product.stock',
        totalSold: 1,
        totalRevenue: 1,
        orderCount: 1
      }
    }
  ]);

  res.json({
    success: true,
    data: { productStats }
  });
});

// =================================================================
// FILE UPLOADS
// =================================================================

/**
 * @route   POST /api/vendor/upload/images
 * @desc    Upload product images (up to 5)
 * @access  Private (Vendor)
 */
exports.uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded',
      errorCode: 'NO_FILES'
    });
  }

  // Convert file paths to URLs - returns string[] for Product.images compatibility
  const imageUrls = req.files
    .map((file) => getFileUrl(file))
    .filter(url => typeof url === 'string' && url.length > 0);

  console.log(`📸 Uploaded ${req.files.length} images:`, imageUrls);

  res.status(200).json({
    success: true,
    message: `${req.files.length} image(s) uploaded successfully`,
    data: { images: imageUrls }
  });
});

// =================================================================
// REPORTS
// =================================================================

/**
 * @route   GET /api/vendor/reports/sales
 * @desc    Get sales report
 * @access  Private (Vendor)
 */
exports.getSalesReport = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { startDate, endDate } = req.query;

  const matchStage = {
    vendor: vendorId,
    status: { $ne: 'cancelled' }
  };

  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const salesData = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.total' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$pricing.total' },
        totalItems: { $sum: { $size: '$items' } }
      }
    }
  ]);

  const statusBreakdown = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        revenue: { $sum: '$pricing.total' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      summary: salesData[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalItems: 0
      },
      statusBreakdown
    }
  });
});

/**
 * @route   GET /api/vendor/reports/inventory
 * @desc    Get inventory report
 * @access  Private (Vendor)
 */
exports.getInventoryReport = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  const products = await Product.find({ vendor: vendorId })
    .select('name category stock lowStockThreshold price inStock isActive')
    .lean();

  const summary = {
    totalProducts: products.length,
    inStockProducts: products.filter(p => p.inStock).length,
    outOfStockProducts: products.filter(p => !p.inStock).length,
    lowStockProducts: products.filter(p => p.stock <= p.lowStockThreshold && p.inStock).length,
    totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0)
  };

  const lowStockItems = products
    .filter(p => p.stock <= p.lowStockThreshold && p.inStock)
    .sort((a, b) => a.stock - b.stock);

  const outOfStockItems = products.filter(p => !p.inStock);

  res.json({
    success: true,
    data: {
      summary,
      lowStockItems,
      outOfStockItems,
      products
    }
  });
});

/**
 * @route   GET /api/vendor/reports/orders
 * @desc    Get orders report
 * @access  Private (Vendor)
 */
exports.getOrdersReport = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { startDate, endDate } = req.query;

  const matchStage = { vendor: vendorId };

  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const orders = await Order.find(matchStage)
    .populate('customer', 'firstName lastName email')
    .select('orderNumber status pricing createdAt items deliveryStatus')
    .sort({ createdAt: -1 })
    .lean();

  const statusCounts = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      orders,
      statusCounts,
      totalOrders: orders.length
    }
  });
});

/**
 * @route   GET /api/vendor/reports/revenue
 * @desc    Get revenue report
 * @access  Private (Vendor)
 */
exports.getRevenueReport = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { startDate, endDate } = req.query;

  const matchStage = {
    vendor: vendorId,
    status: { $in: ['delivered', 'completed'] }
  };

  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const revenueData = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.total' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$pricing.total' },
        deliveryFees: { $sum: '$pricing.deliveryFee' },
        taxes: { $sum: '$pricing.tax' }
      }
    }
  ]);

  const dailyRevenue = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      summary: revenueData[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        deliveryFees: 0,
        taxes: 0
      },
      dailyRevenue
    }
  });
});