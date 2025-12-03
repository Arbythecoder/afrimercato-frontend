/**
 * Cart Controller
 * Handles shopping cart operations
 * Multi-vendor cart support like Jumia/Konga
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

/**
 * Get customer's cart
 * GET /api/cart
 */
exports.getCart = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    let cart = await Cart.findOne({ customer: customer._id })
      .populate({
        path: 'items.product',
        select: 'name price images inStock stock unit'
      })
      .populate({
        path: 'items.vendor',
        select: 'businessName address rating'
      });

    // Create cart if doesn't exist
    if (!cart) {
      cart = new Cart({
        customer: customer._id,
        items: []
      });
      await cart.save();
    }

    // Group items by vendor (for checkout display)
    const groupedByVendor = cart.groupByVendor();

    res.json({
      success: true,
      data: {
        cart,
        groupedByVendor,
        summary: {
          totalItems: cart.getTotalItems(),
          totalVendors: cart.getVendors().length,
          pricing: cart.pricing
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

/**
 * Add item to cart
 * POST /api/cart/items
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is active and in stock
    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This product is no longer available'
      });
    }

    if (!product.inStock || product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available',
        availableStock: product.stock
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ customer: customer._id });
    if (!cart) {
      cart = new Cart({
        customer: customer._id,
        items: []
      });
    }

    // Add item to cart
    const productData = {
      product: product._id,
      vendor: product.vendor,
      quantity,
      price: product.price,
      productSnapshot: {
        name: product.name,
        image: product.images[0]?.url || null,
        unit: product.unit,
        inStock: product.inStock
      }
    };

    await cart.addItem(productData);

    // Populate cart items
    await cart.populate([
      { path: 'items.product', select: 'name price images inStock' },
      { path: 'items.vendor', select: 'businessName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart,
        summary: {
          totalItems: cart.getTotalItems(),
          pricing: cart.pricing
        }
      }
    });

    console.log(`✅ Product added to cart: ${product.name}`);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

/**
 * Update item quantity
 * PUT /api/cart/items/:productId
 */
exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be positive'
      });
    }

    const customer = await Customer.findOne({ user: req.user._id });
    const cart = await Cart.findOne({ customer: customer._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Check stock availability
    if (quantity > 0) {
      const product = await Product.findById(productId);
      if (!product || product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available',
          availableStock: product?.stock || 0
        });
      }
    }

    await cart.updateItemQuantity(productId, quantity);

    await cart.populate([
      { path: 'items.product', select: 'name price images' },
      { path: 'items.vendor', select: 'businessName' }
    ]);

    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Quantity updated',
      data: {
        cart,
        summary: {
          totalItems: cart.getTotalItems(),
          pricing: cart.pricing
        }
      }
    });
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quantity',
      error: error.message
    });
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:productId
 */
exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const customer = await Customer.findOne({ user: req.user._id });
    const cart = await Cart.findOne({ customer: customer._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.removeItem(productId);

    await cart.populate([
      { path: 'items.product', select: 'name price images' },
      { path: 'items.vendor', select: 'businessName' }
    ]);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart,
        summary: {
          totalItems: cart.getTotalItems(),
          pricing: cart.pricing
        }
      }
    });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item',
      error: error.message
    });
  }
};

/**
 * Clear entire cart
 * DELETE /api/cart
 */
exports.clearCart = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    const cart = await Cart.findOne({ customer: customer._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

/**
 * Apply coupon code
 * POST /api/cart/coupons
 */
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const customer = await Customer.findOne({ user: req.user._id });
    const cart = await Cart.findOne({ customer: customer._id });

    if (!cart || cart.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // TODO: Validate coupon code with Coupon model
    // For now, using dummy validation
    const validCoupons = {
      'WELCOME10': { discountType: 'percentage', discountValue: 10 },
      'SAVE20': { discountType: 'percentage', discountValue: 20 },
      'FLAT5': { discountType: 'fixed', discountValue: 5 }
    };

    const couponData = validCoupons[code.toUpperCase()];

    if (!couponData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon code'
      });
    }

    await cart.applyCoupon(code.toUpperCase(), couponData);

    res.json({
      success: true,
      message: `Coupon "${code}" applied successfully`,
      data: {
        appliedCoupon: code,
        discount: cart.pricing.discount,
        newTotal: cart.pricing.total
      }
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply coupon',
      error: error.message
    });
  }
};

/**
 * Remove coupon
 * DELETE /api/cart/coupons/:code
 */
exports.removeCoupon = async (req, res) => {
  try {
    const { code } = req.params;

    const customer = await Customer.findOne({ user: req.user._id });
    const cart = await Cart.findOne({ customer: customer._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.removeCoupon(code);

    res.json({
      success: true,
      message: 'Coupon removed',
      data: {
        newTotal: cart.pricing.total
      }
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove coupon',
      error: error.message
    });
  }
};

/**
 * Set delivery address for pricing calculation
 * PUT /api/cart/delivery-address
 */
exports.setDeliveryAddress = async (req, res) => {
  try {
    const { addressId, postcode, city, latitude, longitude } = req.body;

    const customer = await Customer.findOne({ user: req.user._id });
    const cart = await Cart.findOne({ customer: customer._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    let addressData;

    if (addressId) {
      // Get address from customer's saved addresses
      const address = customer.addresses.id(addressId);
      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      addressData = {
        postcode: address.postcode,
        city: address.city,
        coordinates: address.coordinates?.coordinates || null
      };
    } else {
      // Use provided address data
      addressData = {
        postcode,
        city,
        coordinates: latitude && longitude ? [longitude, latitude] : null
      };
    }

    await cart.setDeliveryAddress(addressData);

    res.json({
      success: true,
      message: 'Delivery address set',
      data: {
        deliveryFee: cart.pricing.deliveryFee,
        total: cart.pricing.total
      }
    });
  } catch (error) {
    console.error('Set delivery address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set delivery address',
      error: error.message
    });
  }
};

/**
 * Get cart summary for checkout
 * GET /api/cart/summary
 */
exports.getCartSummary = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    const cart = await Cart.findOne({ customer: customer._id })
      .populate('items.product', 'name price images vendor')
      .populate('items.vendor', 'businessName address');

    if (!cart || cart.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Check stock availability for all items
    const stockIssues = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product.inStock || product.stock < item.quantity) {
        stockIssues.push({
          productId: product._id,
          productName: product.name,
          requested: item.quantity,
          available: product.stock
        });
      }
    }

    const groupedByVendor = cart.groupByVendor();

    res.json({
      success: true,
      data: {
        items: cart.items,
        groupedByVendor,
        pricing: cart.pricing,
        appliedCoupons: cart.appliedCoupons,
        deliveryAddress: cart.deliveryAddress,
        stockIssues,
        canCheckout: stockIssues.length === 0
      }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart summary',
      error: error.message
    });
  }
};

module.exports = exports;
