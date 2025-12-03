/**
 * Customer Controller
 * Handles customer registration, authentication, profile, addresses, and payment methods
 */

const User = require('../models/User');
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * Register new customer
 * POST /api/customers/register
 */
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user account
    const user = new User({
      name: name || `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      isVerified: true // Auto-verify customers (unlike vendors)
    });

    await user.save();

    // Create customer profile
    const customer = new Customer({
      user: user._id,
      profile: {
        firstName: firstName || name.split(' ')[0],
        lastName: lastName || name.split(' ')[1] || '',
        phone: phone
      },
      metadata: {
        source: req.body.source || 'web'
      }
    });

    await customer.save();

    // Generate referral code
    await customer.generateReferralCode();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        customer: {
          id: customer._id,
          profile: customer.profile,
          referralCode: customer.metadata.referralCode
        }
      }
    });

    console.log(`✅ New customer registered: ${email}`);
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
};

/**
 * Customer login
 * POST /api/customers/login
 */
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: 'customer'
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is suspended
    const customer = await Customer.findOne({ user: user._id });
    if (customer && customer.status.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        suspensionReason: customer.status.suspensionReason
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        customer: {
          id: customer._id,
          profile: customer.profile
        }
      }
    });

    console.log(`✅ Customer logged in: ${email}`);
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: error.message
    });
  }
};

/**
 * Get customer profile
 * GET /api/customers/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id })
      .populate('user', 'name email createdAt')
      .populate('preferences.favoriteVendors', 'businessName')
      .populate('preferences.favoriteProducts', 'name price images');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        customer
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update customer profile
 * PUT /api/customers/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const { firstName, lastName, phone, dateOfBirth, gender, dietary } = req.body;

    // Update profile fields
    if (firstName) customer.profile.firstName = firstName;
    if (lastName) customer.profile.lastName = lastName;
    if (phone) customer.profile.phone = phone;
    if (dateOfBirth) customer.profile.dateOfBirth = dateOfBirth;
    if (gender) customer.profile.gender = gender;

    // Update dietary preferences
    if (dietary) {
      customer.preferences.dietary = {
        ...customer.preferences.dietary,
        ...dietary
      };
    }

    await customer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        customer
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Add delivery address
 * POST /api/customers/addresses
 */
exports.addAddress = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const {
      label,
      isDefault,
      street,
      apartment,
      city,
      state,
      postcode,
      country,
      latitude,
      longitude,
      deliveryInstructions
    } = req.body;

    const addressData = {
      label: label || 'Home',
      isDefault: isDefault || false,
      street,
      apartment,
      city,
      state,
      postcode,
      country: country || 'Ireland',
      deliveryInstructions
    };

    // Add coordinates if provided
    if (latitude && longitude) {
      addressData.coordinates = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    const newAddress = await customer.addAddress(addressData);

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: {
        address: newAddress
      }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message
    });
  }
};

/**
 * Update delivery address
 * PUT /api/customers/addresses/:addressId
 */
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const updatedAddress = await customer.updateAddress(addressId, req.body);

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: {
        address: updatedAddress
      }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
};

/**
 * Delete delivery address
 * DELETE /api/customers/addresses/:addressId
 */
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    await customer.deleteAddress(addressId);

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: {
        addresses: customer.addresses
      }
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
};

/**
 * Get all addresses
 * GET /api/customers/addresses
 */
exports.getAddresses = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        addresses: customer.addresses,
        defaultAddress: customer.getDefaultAddress()
      }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
};

/**
 * Add payment method (Paystack)
 * POST /api/customers/payment-methods
 */
exports.addPaymentMethod = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const {
      authorizationCode,
      bin,
      last4,
      cardType,
      bank,
      expiryMonth,
      expiryYear,
      isDefault
    } = req.body;

    const paymentData = {
      type: 'paystack',
      isDefault: isDefault || false,
      paystackAuthorization: {
        authorizationCode,
        bin,
        last4,
        cardType,
        bank,
        expiryMonth,
        expiryYear
      }
    };

    const newPaymentMethod = await customer.addPaymentMethod(paymentData);

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: {
        paymentMethod: newPaymentMethod
      }
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method',
      error: error.message
    });
  }
};

/**
 * Get payment methods
 * GET /api/customers/payment-methods
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Return safe version (no full authorization codes)
    const safePaymentMethods = customer.paymentMethods.map(pm => ({
      _id: pm._id,
      type: pm.type,
      isDefault: pm.isDefault,
      last4: pm.paystackAuthorization.last4,
      cardType: pm.paystackAuthorization.cardType,
      bank: pm.paystackAuthorization.bank,
      expiryMonth: pm.paystackAuthorization.expiryMonth,
      expiryYear: pm.paystackAuthorization.expiryYear,
      addedAt: pm.addedAt
    }));

    res.json({
      success: true,
      data: {
        paymentMethods: safePaymentMethods
      }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods',
      error: error.message
    });
  }
};

/**
 * Toggle favorite vendor
 * POST /api/customers/favorites/vendors/:vendorId
 */
exports.toggleFavoriteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const isFavorite = customer.preferences.favoriteVendors.includes(vendorId);

    if (isFavorite) {
      await customer.removeFavoriteVendor(vendorId);
    } else {
      await customer.addFavoriteVendor(vendorId);
    }

    res.json({
      success: true,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      data: {
        isFavorite: !isFavorite,
        favoriteVendors: customer.preferences.favoriteVendors
      }
    });
  } catch (error) {
    console.error('Toggle favorite vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorites',
      error: error.message
    });
  }
};

/**
 * Toggle favorite product
 * POST /api/customers/favorites/products/:productId
 */
exports.toggleFavoriteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const isFavorite = customer.preferences.favoriteProducts.includes(productId);

    if (isFavorite) {
      await customer.removeFavoriteProduct(productId);
    } else {
      await customer.addFavoriteProduct(productId);
    }

    res.json({
      success: true,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      data: {
        isFavorite: !isFavorite,
        favoriteProducts: customer.preferences.favoriteProducts
      }
    });
  } catch (error) {
    console.error('Toggle favorite product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorites',
      error: error.message
    });
  }
};

/**
 * Get customer statistics
 * GET /api/customers/stats
 */
exports.getStats = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        stats: customer.stats,
        loyalty: {
          points: customer.loyalty.points,
          tier: customer.loyalty.tier
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Get customer dashboard stats
 * GET /api/customers/dashboard/stats
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Get orders to calculate active orders
    const Order = require('../models/Order');
    const activeOrdersCount = await Order.countDocuments({
      customer: customer._id,
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'] }
    });

    res.json({
      success: true,
      data: {
        activeOrders: activeOrdersCount,
        totalOrders: customer.stats.totalOrders,
        wishlistItems: customer.preferences.favoriteProducts.length,
        rewardPoints: customer.loyalty.points
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get customer recent orders
 * GET /api/customers/orders/recent
 */
exports.getRecentOrders = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const Order = require('../models/Order');
    const { limit = 5 } = req.query;

    const orders = await Order.find({ customer: customer._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('vendor', 'businessName')
      .select('orderNumber status totalAmount items createdAt');

    res.json({
      success: true,
      data: {
        orders
      }
    });
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent orders',
      error: error.message
    });
  }
};

/**
 * Get recommended products for customer
 * GET /api/customers/products/recommended
 */
exports.getRecommendedProducts = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const Product = require('../models/Product');
    const { limit = 4 } = req.query;

    // Simple recommendation: Get popular products or recently added products
    // In a real system, this would use ML/AI recommendations based on order history
    const products = await Product.find({
      isActive: true,
      inStock: true,
      stock: { $gt: 0 }
    })
      .sort({ createdAt: -1 }) // Most recent products
      .limit(parseInt(limit))
      .populate('vendor', 'businessName')
      .select('name description price unit images category');

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get recommended products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended products',
      error: error.message
    });
  }
};

/**
 * Get customer wishlist
 * GET /api/customers/wishlist
 */
exports.getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id })
      .populate({
        path: 'preferences.favoriteProducts',
        select: 'name description price unit images category vendor inStock',
        populate: {
          path: 'vendor',
          select: 'businessName'
        }
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        wishlist: customer.preferences.favoriteProducts
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

/**
 * Add product to wishlist
 * POST /api/customers/wishlist
 */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    await customer.addFavoriteProduct(productId);

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        wishlistCount: customer.preferences.favoriteProducts.length
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message
    });
  }
};

/**
 * Remove product from wishlist
 * DELETE /api/customers/wishlist/:productId
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    await customer.removeFavoriteProduct(productId);

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: {
        wishlistCount: customer.preferences.favoriteProducts.length
      }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message
    });
  }
};

module.exports = exports;
