/**
 * PICKER ORDER CONTROLLER
 * Core functionality for picking and packing orders
 * Pickers claim orders, pick items one-by-one, handle issues, pack, and mark ready for rider pickup
 */

const Order = require('../models/Order');
const Picker = require('../models/Picker');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { emitToUser } = require('../config/socket');

/**
 * Get available orders at picker's current store
 * GET /api/picker/orders/available
 */
exports.getAvailableOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const picker = await Picker.findOne({ user: req.user._id });

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    // Must be checked in
    if (!picker.availability.isAvailable || !picker.availability.currentStore) {
      return res.status(400).json({
        success: false,
        message: 'Please check in to a store first'
      });
    }

    const skip = (page - 1) * limit;

    // Find orders at current store that need picking
    const orders = await Order.find({
      vendor: picker.availability.currentStore,
      status: { $in: ['confirmed', 'assigned_picker'] },
      'picking.status': { $in: ['pending', 'assigned'] },
      'payment.status': 'paid'
    })
      .sort({ createdAt: 1 }) // Oldest first (FIFO)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('customer', 'name phone')
      .populate('items.product', 'name images unit category');

    const total = await Order.countDocuments({
      vendor: picker.availability.currentStore,
      status: { $in: ['confirmed', 'assigned_picker'] },
      'picking.status': { $in: ['pending', 'assigned'] },
      'payment.status': 'paid'
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total
        }
      }
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available orders',
      error: error.message
    });
  }
};

/**
 * Get picker's active orders (currently picking/packing)
 * GET /api/picker/orders/active
 */
exports.getMyActiveOrders = async (req, res) => {
  try {
    const picker = await Picker.findOne({ user: req.user._id });

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    const orders = await Order.find({
      'picking.picker': req.user._id,
      'picking.status': { $in: ['assigned', 'picking', 'picked', 'packing'] }
    })
      .sort({ 'picking.assignedAt': 1 })
      .populate('customer', 'name phone')
      .populate('vendor', 'businessName address')
      .populate('items.product', 'name images unit category');

    res.json({
      success: true,
      data: {
        orders,
        total: orders.length
      }
    });
  } catch (error) {
    console.error('Get active orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active orders',
      error: error.message
    });
  }
};

/**
 * Claim an order to pick
 * POST /api/picker/orders/:orderId/claim
 */
exports.claimOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const picker = await Picker.findOne({ user: req.user._id });
    const order = await Order.findById(orderId)
      .populate('vendor', 'businessName')
      .populate('customer', 'name phone');

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Must be checked in at this vendor's store
    if (picker.availability.currentStore.toString() !== order.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not checked in at this vendor's store"
      });
    }

    // Order must be available for picking
    if (order.picking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.picking.status}`
      });
    }

    // Check active orders limit (max 3 at a time)
    if (picker.stats.activeOrders >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You have reached the maximum of 3 active orders. Please complete current orders first.'
      });
    }

    // Assign picker to order
    order.picking.status = 'assigned';
    order.picking.picker = req.user._id;
    order.picking.assignedAt = new Date();
    order.status = 'assigned_picker';

    // Initialize itemsPicked array
    order.picking.itemsPicked = order.items.map(item => ({
      productId: item.product._id,
      quantityRequested: item.quantity,
      quantityPicked: 0,
      isPicked: false,
      issues: []
    }));

    await order.save();

    // Update picker stats
    picker.stats.activeOrders += 1;
    await picker.save();

    // Notify customer
    emitToUser(order.customer._id, 'order_being_picked', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      pickerName: req.user.name,
      message: 'Your order is being picked!'
    });

    // Notify vendor
    emitToUser(order.vendor.user, 'order_claimed', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      pickerName: req.user.name
    });

    res.json({
      success: true,
      message: 'Order claimed successfully',
      data: {
        order
      }
    });

    console.log(`📦 Picker ${req.user.email} claimed order ${order.orderNumber}`);
  } catch (error) {
    console.error('Claim order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to claim order',
      error: error.message
    });
  }
};

/**
 * Start picking an order
 * POST /api/picker/orders/:orderId/start
 */
exports.startPicking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      'picking.picker': req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    if (order.picking.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: `Cannot start picking. Order status is: ${order.picking.status}`
      });
    }

    order.picking.status = 'picking';
    order.picking.startedAt = new Date();
    order.status = 'picking';

    order.statusHistory.push({
      status: 'picking',
      timestamp: new Date(),
      note: `Picker ${req.user.name} started picking`,
      updatedBy: req.user._id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Started picking order',
      data: {
        order,
        itemsToPick: order.picking.itemsPicked.filter(item => !item.isPicked)
      }
    });

    console.log(`🛒 Picker ${req.user.email} started picking order ${order.orderNumber}`);
  } catch (error) {
    console.error('Start picking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start picking',
      error: error.message
    });
  }
};

/**
 * Mark individual item as picked
 * POST /api/picker/orders/:orderId/items/:productId/picked
 */
exports.markItemPicked = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { quantityPicked, note } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      'picking.picker': req.user._id
    }).populate('items.product', 'name unit');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    if (order.picking.status !== 'picking') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in picking status'
      });
    }

    // Find the item in itemsPicked array
    const pickedItem = order.picking.itemsPicked.find(
      item => item.productId.toString() === productId
    );

    if (!pickedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in order'
      });
    }

    if (pickedItem.isPicked) {
      return res.status(400).json({
        success: false,
        message: 'Item already marked as picked'
      });
    }

    // Mark as picked
    pickedItem.quantityPicked = quantityPicked || pickedItem.quantityRequested;
    pickedItem.isPicked = true;
    pickedItem.pickedAt = new Date();

    await order.save();

    // Check if all items are picked
    const allPicked = order.picking.itemsPicked.every(item => item.isPicked);
    const remainingItems = order.picking.itemsPicked.filter(item => !item.isPicked).length;

    res.json({
      success: true,
      message: 'Item marked as picked',
      data: {
        pickedItem,
        remainingItems,
        allItemsPicked: allPicked
      }
    });

    console.log(`✅ Item ${productId} picked for order ${order.orderNumber}`);
  } catch (error) {
    console.error('Mark item picked error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark item as picked',
      error: error.message
    });
  }
};

/**
 * Report issue with an item
 * POST /api/picker/orders/:orderId/items/:productId/issue
 */
exports.reportItemIssue = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { issueType, description, quantityAvailable } = req.body;

    const validIssueTypes = ['out_of_stock', 'wrong_quantity', 'damaged', 'expired', 'substitute_offered', 'other'];
    if (!validIssueTypes.includes(issueType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid issue type. Valid types: ${validIssueTypes.join(', ')}`
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      'picking.picker': req.user._id
    }).populate('items.product', 'name unit');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    const pickedItem = order.picking.itemsPicked.find(
      item => item.productId.toString() === productId
    );

    if (!pickedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in order'
      });
    }

    // Add issue
    pickedItem.issues.push({
      type: issueType,
      description: description || '',
      reportedAt: new Date()
    });

    // If partial quantity available, mark as picked with available quantity
    if (issueType === 'wrong_quantity' && quantityAvailable) {
      pickedItem.quantityPicked = quantityAvailable;
      pickedItem.isPicked = true;
      pickedItem.pickedAt = new Date();
    }

    // If completely out of stock
    if (issueType === 'out_of_stock') {
      pickedItem.quantityPicked = 0;
      pickedItem.isPicked = true; // Marked as "processed"
      pickedItem.pickedAt = new Date();
    }

    await order.save();

    // Notify customer about issue
    emitToUser(order.customer, 'order_item_issue', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      productName: order.items.find(i => i.product._id.toString() === productId)?.name,
      issueType,
      description
    });

    res.json({
      success: true,
      message: 'Issue reported',
      data: {
        pickedItem
      }
    });

    console.log(`⚠️ Issue reported for item ${productId} in order ${order.orderNumber}: ${issueType}`);
  } catch (error) {
    console.error('Report item issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report issue',
      error: error.message
    });
  }
};

/**
 * Suggest substitute product
 * POST /api/picker/orders/:orderId/items/:productId/substitute
 */
exports.suggestSubstitute = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { substituteProductId, reason } = req.body;

    if (!substituteProductId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide substitute product ID'
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      'picking.picker': req.user._id
    });

    const substituteProduct = await Product.findById(substituteProductId);

    if (!order || !substituteProduct) {
      return res.status(404).json({
        success: false,
        message: 'Order or substitute product not found'
      });
    }

    const pickedItem = order.picking.itemsPicked.find(
      item => item.productId.toString() === productId
    );

    if (!pickedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in order'
      });
    }

    // Add substitute info
    pickedItem.substitute = {
      productId: substituteProduct._id,
      name: substituteProduct.name,
      price: substituteProduct.price,
      customerApproved: false // Needs customer approval
    };

    // Add issue noting substitute offered
    pickedItem.issues.push({
      type: 'substitute_offered',
      description: reason || `Substitute offered: ${substituteProduct.name}`,
      reportedAt: new Date()
    });

    await order.save();

    // Notify customer to approve substitute
    emitToUser(order.customer, 'substitute_offered', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      originalProduct: order.items.find(i => i.product._id.toString() === productId)?.name,
      substituteProduct: {
        id: substituteProduct._id,
        name: substituteProduct.name,
        price: substituteProduct.price,
        image: substituteProduct.images[0]?.url
      },
      reason
    });

    res.json({
      success: true,
      message: 'Substitute suggestion sent to customer',
      data: {
        pickedItem,
        awaiting: 'customer_approval'
      }
    });

    console.log(`🔄 Substitute suggested for order ${order.orderNumber}: ${substituteProduct.name}`);
  } catch (error) {
    console.error('Suggest substitute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suggest substitute',
      error: error.message
    });
  }
};

/**
 * Complete picking (all items picked)
 * POST /api/picker/orders/:orderId/complete-picking
 */
exports.completePicking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      'picking.picker': req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    if (order.picking.status !== 'picking') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in picking status'
      });
    }

    // Check if all items are picked
    const allPicked = order.picking.itemsPicked.every(item => item.isPicked);

    if (!allPicked) {
      const remainingItems = order.picking.itemsPicked.filter(item => !item.isPicked);
      return res.status(400).json({
        success: false,
        message: 'Not all items have been picked',
        remainingItems: remainingItems.length
      });
    }

    // Calculate picking accuracy
    let totalRequested = 0;
    let totalPicked = 0;

    order.picking.itemsPicked.forEach(item => {
      totalRequested += item.quantityRequested;
      totalPicked += item.quantityPicked;
    });

    const accuracy = totalRequested > 0 ? (totalPicked / totalRequested) * 100 : 100;

    order.picking.status = 'picked';
    order.picking.pickedAt = new Date();
    order.picking.accuracy = Math.round(accuracy * 10) / 10; // Round to 1 decimal
    order.status = 'picked';

    order.statusHistory.push({
      status: 'picked',
      timestamp: new Date(),
      note: `All items picked (${accuracy.toFixed(1)}% accuracy)`,
      updatedBy: req.user._id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Picking completed. Please proceed to packing.',
      data: {
        order,
        accuracy: accuracy.toFixed(1) + '%',
        nextStep: 'packing'
      }
    });

    console.log(`✅ Picking completed for order ${order.orderNumber} - Accuracy: ${accuracy.toFixed(1)}%`);
  } catch (error) {
    console.error('Complete picking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete picking',
      error: error.message
    });
  }
};

/**
 * Start packing order
 * POST /api/picker/orders/:orderId/start-packing
 */
exports.startPacking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      'picking.picker': req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    if (order.picking.status !== 'picked') {
      return res.status(400).json({
        success: false,
        message: 'Order must be picked before packing'
      });
    }

    order.picking.status = 'packing';
    order.status = 'packing';

    order.statusHistory.push({
      status: 'packing',
      timestamp: new Date(),
      note: `Picker ${req.user.name} started packing`,
      updatedBy: req.user._id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Started packing order',
      data: {
        order
      }
    });

    console.log(`📦 Picker ${req.user.email} started packing order ${order.orderNumber}`);
  } catch (error) {
    console.error('Start packing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start packing',
      error: error.message
    });
  }
};

/**
 * Upload packing photos
 * POST /api/picker/orders/:orderId/packing-photos
 */
exports.uploadPackingPhotos = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { photos, notes } = req.body;

    if (!photos || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one photo'
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      'picking.picker': req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    order.picking.packingPhotos = photos;
    if (notes) {
      order.picking.notes = notes;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Packing photos uploaded',
      data: {
        photosCount: photos.length
      }
    });
  } catch (error) {
    console.error('Upload packing photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photos',
      error: error.message
    });
  }
};

/**
 * Complete packing (mark as ready for rider pickup)
 * POST /api/picker/orders/:orderId/complete-packing
 */
exports.completePacking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { location, notes } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      'picking.picker': req.user._id
    }).populate('vendor', 'businessName address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    if (order.picking.status !== 'packing') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in packing status'
      });
    }

    // Require packing photos
    if (!order.picking.packingPhotos || order.picking.packingPhotos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload packing photos before completing'
      });
    }

    // Calculate pick time
    const startTime = new Date(order.picking.startedAt);
    const endTime = new Date();
    const pickTimeMinutes = Math.round((endTime - startTime) / 1000 / 60);

    order.picking.status = 'ready_for_pickup';
    order.picking.packedAt = endTime;
    order.picking.readyAt = endTime;
    order.picking.pickTime = pickTimeMinutes;
    order.status = 'ready_for_pickup';

    if (notes) {
      order.picking.notes = (order.picking.notes || '') + '\n' + notes;
    }

    order.statusHistory.push({
      status: 'ready_for_pickup',
      timestamp: endTime,
      note: `Order packed and ready for rider pickup (${pickTimeMinutes} min)`,
      updatedBy: req.user._id
    });

    await order.save();

    // Update picker stats
    const picker = await Picker.findOne({ user: req.user._id });
    await picker.updateStats({
      pickTime: pickTimeMinutes,
      accuracy: order.picking.accuracy
    });

    // Calculate earnings
    let earnings = 2.00; // Base
    if (order.items.length > 5) earnings = 3.50;
    if (order.items.length > 15) earnings = 5.00;
    if (order.picking.accuracy === 100) earnings += 0.50;
    if (pickTimeMinutes < 5) earnings += 0.50;
    else if (pickTimeMinutes <= 10) earnings += 0.25;

    picker.stats.totalEarnings += earnings;
    picker.stats.earningsThisWeek += earnings;
    picker.stats.earningsThisMonth += earnings;
    await picker.save();

    // Notify available riders
    // TODO: Trigger rider assignment

    // Notify customer
    emitToUser(order.customer, 'order_ready_for_delivery', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      vendor: order.vendor.businessName,
      message: 'Your order is packed and ready for delivery!'
    });

    res.json({
      success: true,
      message: 'Order completed and ready for rider pickup!',
      data: {
        order,
        pickTime: `${pickTimeMinutes} minutes`,
        accuracy: `${order.picking.accuracy}%`,
        earnings: `€${earnings.toFixed(2)}`,
        nextStep: 'Wait for rider to pick up'
      }
    });

    console.log(`🎉 Order ${order.orderNumber} completed by picker ${req.user.email} - Earned: €${earnings.toFixed(2)}`);
  } catch (error) {
    console.error('Complete packing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete packing',
      error: error.message
    });
  }
};

/**
 * Get picking history
 * GET /api/picker/orders/history
 */
exports.getPickingHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {
      'picking.picker': req.user._id
    };

    if (status) {
      filter['picking.status'] = status;
    } else {
      // Default: show completed orders
      filter['picking.status'] = { $in: ['ready_for_pickup', 'packed'] };
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .sort({ 'picking.readyAt': -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('vendor', 'businessName')
      .populate('customer', 'name');

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total
        }
      }
    });
  } catch (error) {
    console.error('Get picking history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      error: error.message
    });
  }
};

/**
 * Get detailed order info for picker
 * GET /api/picker/orders/:orderId
 */
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      'picking.picker': req.user._id
    })
      .populate('vendor', 'businessName address phone')
      .populate('customer', 'name phone')
      .populate('items.product', 'name images unit category barcode');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

module.exports = exports;
