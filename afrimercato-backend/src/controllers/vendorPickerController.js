/**
 * VENDOR-PICKER MANAGEMENT CONTROLLER
 * Vendors manage picker requests, approvals, and assignments
 */

const Vendor = require('../models/Vendor');
const Picker = require('../models/Picker');
const Order = require('../models/Order');
const { emitToUser } = require('../config/socket');

/**
 * Get picker requests (pending approvals)
 * GET /api/vendor/pickers/requests
 */
exports.getPickerRequests = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Find all pickers with pending requests for this vendor
    const pickers = await Picker.find({
      'connectedStores.vendorId': vendor._id,
      'connectedStores.status': 'pending'
    })
      .populate('user', 'name email phone')
      .select('user profile stats verification connectedStores training equipment');

    // Filter to show only pending connections for this vendor
    const requests = pickers.map(picker => {
      const connection = picker.connectedStores.find(
        store => store.vendorId.toString() === vendor._id.toString() && store.status === 'pending'
      );

      return {
        picker: {
          id: picker._id,
          name: picker.user.name,
          email: picker.user.email,
          phone: picker.user.phone,
          verificationStatus: picker.verification.status,
          stats: picker.stats,
          training: picker.training,
          equipment: picker.equipment
        },
        connection: {
          requestedAt: connection.requestedAt,
          storeRole: connection.storeRole,
          sections: connection.sections
        }
      };
    });

    res.json({
      success: true,
      data: {
        requests,
        total: requests.length
      }
    });
  } catch (error) {
    console.error('Get picker requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch picker requests',
      error: error.message
    });
  }
};

/**
 * Approve picker request
 * POST /api/vendor/pickers/:pickerId/approve
 */
exports.approvePicker = async (req, res) => {
  try {
    const { pickerId } = req.params;
    const { sections, schedule } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });
    const picker = await Picker.findById(pickerId).populate('user', 'name email');

    if (!vendor || !picker) {
      return res.status(404).json({
        success: false,
        message: 'Vendor or picker not found'
      });
    }

    // Find the connection
    const connection = picker.connectedStores.find(
      store => store.vendorId.toString() === vendor._id.toString()
    );

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Connection is already ${connection.status}`
      });
    }

    // Approve connection
    connection.status = 'approved';
    connection.approvedAt = new Date();
    connection.approvedBy = req.user._id;

    // Update sections if provided
    if (sections && sections.length > 0) {
      connection.sections = sections;
    }

    // Update schedule if provided
    if (schedule) {
      connection.schedule = schedule;
    }

    await picker.save();

    // Notify picker
    emitToUser(picker.user._id, 'picker_request_approved', {
      vendorId: vendor._id,
      vendorName: vendor.businessName,
      storeRole: connection.storeRole,
      message: `Your request to work at ${vendor.businessName} has been approved!`
    });

    res.json({
      success: true,
      message: `Picker ${picker.user.name} approved successfully`,
      data: {
        picker: {
          id: picker._id,
          name: picker.user.name,
          email: picker.user.email
        },
        connection: {
          status: 'approved',
          storeRole: connection.storeRole,
          sections: connection.sections,
          approvedAt: connection.approvedAt
        }
      }
    });

    console.log(`✅ Vendor ${vendor.businessName} approved picker ${picker.user.email}`);
  } catch (error) {
    console.error('Approve picker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve picker',
      error: error.message
    });
  }
};

/**
 * Reject picker request
 * POST /api/vendor/pickers/:pickerId/reject
 */
exports.rejectPicker = async (req, res) => {
  try {
    const { pickerId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });
    const picker = await Picker.findById(pickerId).populate('user', 'name email');

    if (!vendor || !picker) {
      return res.status(404).json({
        success: false,
        message: 'Vendor or picker not found'
      });
    }

    const connection = picker.connectedStores.find(
      store => store.vendorId.toString() === vendor._id.toString()
    );

    if (!connection || connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'No pending connection request found'
      });
    }

    // Reject connection
    connection.status = 'rejected';
    connection.rejectedAt = new Date();
    connection.rejectionReason = reason || 'No reason provided';

    await picker.save();

    // Notify picker
    emitToUser(picker.user._id, 'picker_request_rejected', {
      vendorId: vendor._id,
      vendorName: vendor.businessName,
      reason: reason || 'Not specified',
      message: `Your request to work at ${vendor.businessName} was not approved`
    });

    res.json({
      success: true,
      message: 'Picker request rejected',
      data: {
        picker: {
          id: picker._id,
          name: picker.user.name
        },
        rejectionReason: reason
      }
    });

    console.log(`❌ Vendor ${vendor.businessName} rejected picker ${picker.user.email}`);
  } catch (error) {
    console.error('Reject picker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject picker',
      error: error.message
    });
  }
};

/**
 * Get approved pickers
 * GET /api/vendor/pickers/approved
 */
exports.getApprovedPickers = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const pickers = await Picker.find({
      'connectedStores.vendorId': vendor._id,
      'connectedStores.status': 'approved'
    })
      .populate('user', 'name email phone')
      .select('user profile stats availability connectedStores');

    const approvedPickers = pickers.map(picker => {
      const connection = picker.connectedStores.find(
        store => store.vendorId.toString() === vendor._id.toString() && store.status === 'approved'
      );

      return {
        picker: {
          id: picker._id,
          name: picker.user.name,
          email: picker.user.email,
          phone: picker.user.phone,
          isAvailable: picker.availability.isAvailable,
          isCurrentlyAtStore: picker.availability.currentStore?.toString() === vendor._id.toString(),
          stats: picker.stats
        },
        connection: {
          storeRole: connection.storeRole,
          sections: connection.sections,
          approvedAt: connection.approvedAt
        }
      };
    });

    res.json({
      success: true,
      data: {
        pickers: approvedPickers,
        total: approvedPickers.length,
        currentlyWorking: approvedPickers.filter(p => p.picker.isCurrentlyAtStore).length
      }
    });
  } catch (error) {
    console.error('Get approved pickers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved pickers',
      error: error.message
    });
  }
};

/**
 * Get currently active pickers at store
 * GET /api/vendor/pickers/active
 */
exports.getActivePickers = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const activePickers = await Picker.find({
      'connectedStores.vendorId': vendor._id,
      'connectedStores.status': 'approved',
      'availability.isAvailable': true,
      'availability.currentStore': vendor._id
    })
      .populate('user', 'name email phone')
      .select('user stats availability');

    res.json({
      success: true,
      data: {
        pickers: activePickers.map(picker => ({
          id: picker._id,
          name: picker.user.name,
          email: picker.user.email,
          phone: picker.user.phone,
          activeOrders: picker.stats.activeOrders,
          ordersToday: picker.stats.ordersPickedToday,
          rating: picker.stats.rating,
          checkInTime: picker.availability.lastCheckIn
        })),
        total: activePickers.length
      }
    });
  } catch (error) {
    console.error('Get active pickers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active pickers',
      error: error.message
    });
  }
};

/**
 * Assign picker to order
 * POST /api/vendor/pickers/assign-order
 */
exports.assignPickerToOrder = async (req, res) => {
  try {
    const { orderId, pickerId } = req.body;

    if (!orderId || !pickerId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide orderId and pickerId'
      });
    }

    const vendor = await Vendor.findOne({ user: req.user._id });
    const picker = await Picker.findById(pickerId).populate('user', 'name');
    const order = await Order.findById(orderId);

    if (!vendor || !picker || !order) {
      return res.status(404).json({
        success: false,
        message: 'Vendor, picker, or order not found'
      });
    }

    // Verify order belongs to this vendor
    if (order.vendor.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This order does not belong to your store'
      });
    }

    // Verify picker is approved for this store
    if (!picker.isApprovedForStore(vendor._id)) {
      return res.status(403).json({
        success: false,
        message: 'Picker is not approved for your store'
      });
    }

    // Verify picker is checked in
    if (!picker.availability.isAvailable || picker.availability.currentStore?.toString() !== vendor._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Picker is not currently checked in at your store'
      });
    }

    // Verify order status
    if (order.picking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.picking.status}`
      });
    }

    // Assign picker
    order.picking.status = 'assigned';
    order.picking.picker = picker.user._id;
    order.picking.assignedAt = new Date();
    order.status = 'assigned_picker';

    // Initialize itemsPicked array
    order.picking.itemsPicked = order.items.map(item => ({
      productId: item.product,
      quantityRequested: item.quantity,
      quantityPicked: 0,
      isPicked: false,
      issues: []
    }));

    await order.save();

    // Update picker stats
    picker.stats.activeOrders += 1;
    await picker.save();

    // Notify picker
    emitToUser(picker.user._id, 'order_assigned', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      itemCount: order.items.length,
      message: `New order #${order.orderNumber} assigned to you by ${vendor.businessName}`
    });

    res.json({
      success: true,
      message: `Order assigned to picker ${picker.user.name}`,
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status
        },
        picker: {
          id: picker._id,
          name: picker.user.name
        }
      }
    });

    console.log(`✅ Vendor ${vendor.businessName} assigned order ${order.orderNumber} to picker ${picker.user.email}`);
  } catch (error) {
    console.error('Assign picker to order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign picker to order',
      error: error.message
    });
  }
};

/**
 * Suspend picker
 * POST /api/vendor/pickers/:pickerId/suspend
 */
exports.suspendPicker = async (req, res) => {
  try {
    const { pickerId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });
    const picker = await Picker.findById(pickerId).populate('user', 'name email');

    if (!vendor || !picker) {
      return res.status(404).json({
        success: false,
        message: 'Vendor or picker not found'
      });
    }

    const connection = picker.connectedStores.find(
      store => store.vendorId.toString() === vendor._id.toString()
    );

    if (!connection || connection.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Picker is not connected to your store'
      });
    }

    // Suspend connection
    connection.status = 'suspended';

    picker.isSuspended = true;
    picker.suspensionReason = reason || 'Suspended by vendor';
    picker.suspendedAt = new Date();
    picker.suspendedBy = req.user._id;

    // Check out if currently at store
    if (picker.availability.currentStore?.toString() === vendor._id.toString()) {
      await picker.checkOut();
    }

    await picker.save();

    // Notify picker
    emitToUser(picker.user._id, 'picker_suspended', {
      vendorId: vendor._id,
      vendorName: vendor.businessName,
      reason: reason || 'Not specified',
      message: `You have been suspended from working at ${vendor.businessName}`
    });

    res.json({
      success: true,
      message: 'Picker suspended',
      data: {
        picker: {
          id: picker._id,
          name: picker.user.name
        },
        suspensionReason: reason
      }
    });

    console.log(`⚠️ Vendor ${vendor.businessName} suspended picker ${picker.user.email}`);
  } catch (error) {
    console.error('Suspend picker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend picker',
      error: error.message
    });
  }
};

/**
 * Get picker performance at vendor's store
 * GET /api/vendor/pickers/:pickerId/performance
 */
exports.getPickerPerformance = async (req, res) => {
  try {
    const { pickerId } = req.params;

    const vendor = await Vendor.findOne({ user: req.user._id });
    const picker = await Picker.findById(pickerId).populate('user', 'name email');

    if (!vendor || !picker) {
      return res.status(404).json({
        success: false,
        message: 'Vendor or picker not found'
      });
    }

    // Get orders picked at this vendor's store
    const orders = await Order.find({
      vendor: vendor._id,
      'picking.picker': picker.user._id,
      'picking.status': { $in: ['ready_for_pickup', 'packed'] }
    });

    const totalOrders = orders.length;
    const totalPickTime = orders.reduce((sum, order) => sum + (order.picking.pickTime || 0), 0);
    const avgPickTime = totalOrders > 0 ? totalPickTime / totalOrders : 0;
    const avgAccuracy = totalOrders > 0
      ? orders.reduce((sum, order) => sum + (order.picking.accuracy || 100), 0) / totalOrders
      : 100;

    res.json({
      success: true,
      data: {
        picker: {
          id: picker._id,
          name: picker.user.name,
          email: picker.user.email
        },
        performance: {
          totalOrdersPicked: totalOrders,
          averagePickTime: `${avgPickTime.toFixed(1)} min`,
          averageAccuracy: `${avgAccuracy.toFixed(1)}%`,
          rating: picker.stats.rating
        }
      }
    });
  } catch (error) {
    console.error('Get picker performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch picker performance',
      error: error.message
    });
  }
};

module.exports = exports;
