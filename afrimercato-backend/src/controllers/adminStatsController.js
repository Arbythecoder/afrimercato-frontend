// =================================================================
// ADMIN STATS CONTROLLER - Platform Statistics & Dashboard
// =================================================================

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Delivery = require('../models/Delivery');
const PickingSession = require('../models/PickingSession');
const Payout = require('../models/Payout');

// Get platform statistics
exports.getPlatformStats = async (req, res) => {
  try {
    // User counts by role
    const totalCustomers = await User.countDocuments({ roles: 'customer' });
    const totalVendors = await Vendor.countDocuments();
    const totalRiders = await User.countDocuments({ roles: 'rider' });
    const totalPickers = await User.countDocuments({ roles: 'picker' });

    // Vendor stats
    const pendingVendors = await Vendor.countDocuments({ approvalStatus: 'pending' });
    const activeVendors = await Vendor.countDocuments({ isActive: true });

    // Order stats
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    // Revenue calculation
    const revenueData = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Commission calculation (15%)
    const totalCommission = totalRevenue * 0.15;

    // Product stats
    const totalProducts = await Product.countDocuments();

    res.json({
      success: true,
      data: {
        users: {
          totalCustomers,
          totalVendors,
          totalRiders,
          totalPickers
        },
        vendors: {
          total: totalVendors,
          active: activeVendors,
          pending: pendingVendors
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: deliveredOrders
        },
        revenue: {
          total: totalRevenue.toFixed(2),
          commission: totalCommission.toFixed(2)
        },
        products: {
          total: totalProducts
        }
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching platform statistics'
    });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { status: 'delivered' };

    if (startDate || endDate) {
      query['timestamps.delivered'] = {};
      if (startDate) query['timestamps.delivered'].$gte = new Date(startDate);
      if (endDate) query['timestamps.delivered'].$lte = new Date(endDate);
    }

    const orders = await Order.find(query);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCommission = totalRevenue * 0.15;

    // Revenue by date
    const revenueByDate = orders.reduce((acc, o) => {
      const date = o.timestamps.delivered.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += o.totalAmount;
      acc[date].orders += 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          totalCommission: totalCommission.toFixed(2),
          totalOrders: orders.length
        },
        revenueByDate: Object.values(revenueByDate)
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching revenue analytics'
    });
  }
};
