// File: src/controllers/couponController.js
// Manages coupon operations

const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const Customer = require('../models/Customer');

// =================================================================
// ADMIN COUPON ENDPOINTS
// =================================================================

/**
 * @route   POST /api/admin/coupons
 * @desc    Create a new coupon
 * @access  Private (Admin)
 */
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      validFrom,
      validUntil,
      usageLimit,
      usagePerCustomer,
      applicableTo,
      vendors,
      categories,
      products,
      campaign,
      internalNotes
    } = req.body;

    // Validate dates
    if (new Date(validFrom) >= new Date(validUntil)) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date must be after valid from date'
      });
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase: minPurchase || 0,
      validFrom,
      validUntil,
      usageLimit,
      usagePerCustomer: usagePerCustomer || 1,
      applicableTo: applicableTo || 'all',
      vendors: vendors || [],
      categories: categories || [],
      products: products || [],
      campaign,
      internalNotes,
      createdBy: req.user._id,
      creatorType: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating coupon',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/coupons
 * @desc    Get all coupons
 * @access  Private (Admin)
 */
exports.getAllCoupons = async (req, res) => {
  try {
    const { status, applicableTo, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status === 'active') {
      query.isActive = true;
      query.validUntil = { $gte: new Date() };
    } else if (status === 'expired') {
      query.validUntil = { $lt: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (applicableTo) {
      query.applicableTo = applicableTo;
    }

    const skip = (page - 1) * limit;
    const total = await Coupon.countDocuments(query);

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: coupons.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupons',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/coupons/:id
 * @desc    Get single coupon with usage details
 * @access  Private (Admin)
 */
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('usedBy.customer', 'name email')
      .populate('vendors', 'storeName')
      .populate('products', 'name');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupon',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/admin/coupons/:id
 * @desc    Update coupon
 * @access  Private (Admin)
 */
exports.updateCoupon = async (req, res) => {
  try {
    const allowedUpdates = [
      'name',
      'description',
      'discountValue',
      'maxDiscount',
      'minPurchase',
      'validUntil',
      'usageLimit',
      'usagePerCustomer',
      'isActive',
      'internalNotes'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating coupon',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/admin/coupons/:id
 * @desc    Delete (deactivate) coupon
 * @access  Private (Admin)
 */
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Soft delete - just deactivate
    coupon.isActive = false;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting coupon',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/coupons/:id/usage
 * @desc    Get coupon usage statistics
 * @access  Private (Admin)
 */
exports.getCouponUsage = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('usedBy.customer', 'name email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    const stats = {
      code: coupon.code,
      totalUses: coupon.usedCount,
      remainingUses: coupon.remainingUses,
      uniqueCustomers: new Set(coupon.usedBy.map(u => u.customer._id.toString())).size,
      totalDiscountGiven: coupon.usedBy.reduce((sum, u) => sum + (u.discountApplied || 0), 0),
      recentUsage: coupon.usedBy.slice(-10).reverse(),
      usageByDate: {} // Can add aggregation by date if needed
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching coupon usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupon usage',
      error: error.message
    });
  }
};

// =================================================================
// CUSTOMER COUPON ENDPOINTS
// =================================================================

/**
 * @route   POST /api/customer/coupons/validate
 * @desc    Validate and apply coupon to cart
 * @access  Private (Customer)
 */
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code'
      });
    }

    // Find customer
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Find coupon
    const couponResult = await Coupon.findValidCoupon(code);
    if (!couponResult.found) {
      return res.status(400).json({
        success: false,
        message: couponResult.reason
      });
    }

    const coupon = couponResult.coupon;

    // Check if customer can use it
    const canUse = coupon.canBeUsedBy(customer._id);
    if (!canUse.valid) {
      return res.status(400).json({
        success: false,
        message: canUse.reason
      });
    }

    // Get customer's cart
    const cart = await Cart.findOne({ customer: customer._id })
      .populate('items.product', 'name price category');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    // Check if coupon is applicable to cart items
    const items = cart.items.map(item => ({
      productId: item.product._id,
      category: item.product.category
    }));

    const applicable = coupon.isApplicableToOrder(cart.vendor, items);
    if (!applicable.applicable) {
      return res.status(400).json({
        success: false,
        message: applicable.reason
      });
    }

    // Calculate discount
    const discountResult = coupon.calculateDiscount(cart.pricing.subtotal, items);
    if (!discountResult.success) {
      return res.status(400).json({
        success: false,
        message: discountResult.reason
      });
    }

    // Apply coupon to cart
    cart.appliedCoupons = [{
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      appliedAmount: discountResult.discount,
      appliedAt: new Date()
    }];

    // Recalculate cart pricing
    cart.pricing.discount = discountResult.discount;
    cart.pricing.total = cart.pricing.subtotal - discountResult.discount;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description
        },
        discount: discountResult.discount,
        newTotal: cart.pricing.total,
        cart
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating coupon',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/customer/coupons/remove
 * @desc    Remove coupon from cart
 * @access  Private (Customer)
 */
exports.removeCoupon = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const cart = await Cart.findOne({ customer: customer._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove coupons
    cart.appliedCoupons = [];
    cart.pricing.discount = 0;
    cart.pricing.total = cart.pricing.subtotal;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Coupon removed',
      data: cart
    });
  } catch (error) {
    console.error('Error removing coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing coupon',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/customer/coupons/available
 * @desc    Get available coupons for customer
 * @access  Private (Customer)
 */
exports.getAvailableCoupons = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    })
      .select('-usedBy -internalNotes -createdBy')
      .sort({ discountValue: -1 });

    // Filter coupons customer can use
    const availableCoupons = coupons.filter(coupon => {
      const canUse = coupon.canBeUsedBy(customer._id);
      return canUse.valid;
    });

    res.status(200).json({
      success: true,
      count: availableCoupons.length,
      data: availableCoupons
    });
  } catch (error) {
    console.error('Error fetching available coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available coupons',
      error: error.message
    });
  }
};

module.exports = exports;
