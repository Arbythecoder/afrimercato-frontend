// =================================================================
// ADMIN CUSTOMER CONTROLLER - Customer Management
// =================================================================

const User = require('../models/User');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { roles: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching customers' });
  }
};

// Get customer details
exports.getCustomerDetails = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await User.findById(customerId).select('-password');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const totalOrders = await Order.countDocuments({ customer: customerId });
    const orders = await Order.find({ customer: customerId }).sort({ createdAt: -1 }).limit(10);
    const totalSpent = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      success: true,
      data: {
        customer,
        stats: { totalOrders, totalSpent: totalSpent.toFixed(2) },
        recentOrders: orders
      }
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching customer details' });
  }
};

// Suspend customer
exports.suspendCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { reason } = req.body;

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.suspended = true;
    customer.suspensionReason = reason;
    customer.suspendedAt = new Date();
    await customer.save();

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'customer_suspended',
      targetType: 'User',
      targetId: customer._id,
      targetIdentifier: customer.email,
      reason
    });

    res.json({ success: true, message: 'Customer suspended' });
  } catch (error) {
    console.error('Suspend customer error:', error);
    res.status(500).json({ success: false, message: 'Server error suspending customer' });
  }
};

// Reactivate customer
exports.reactivateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await User.findById(customerId);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.suspended = false;
    customer.suspensionReason = undefined;
    customer.suspendedAt = undefined;
    await customer.save();

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'customer_activated',
      targetType: 'User',
      targetId: customer._id,
      targetIdentifier: customer.email
    });

    res.json({ success: true, message: 'Customer reactivated' });
  } catch (error) {
    console.error('Reactivate customer error:', error);
    res.status(500).json({ success: false, message: 'Server error reactivating customer' });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE') {
      return res.status(400).json({ success: false, message: 'Confirmation required' });
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.deleted = true;
    customer.deletedAt = new Date();
    await customer.save();

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'customer_deleted',
      targetType: 'User',
      targetId: customer._id,
      targetIdentifier: customer.email
    });

    res.json({ success: true, message: 'Customer account deleted' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting customer' });
  }
};

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const orders = await Order.find({ customer: customerId })
      .populate('vendor', 'storeName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments({ customer: customerId });

    res.json({
      success: true,
      data: {
        orders,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
      }
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};

// Send notification to customer
exports.notifyCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { title, message } = req.body;

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'notification_sent',
      targetType: 'User',
      targetId: customer._id,
      targetIdentifier: customer.email,
      metadata: { title, message }
    });

    res.json({ success: true, message: 'Notification sent to customer' });
  } catch (error) {
    console.error('Notify customer error:', error);
    res.status(500).json({ success: false, message: 'Server error sending notification' });
  }
};
