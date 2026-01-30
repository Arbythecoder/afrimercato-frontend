// =================================================================
// ADMIN RIDER CONTROLLER - Rider Management
// =================================================================

const User = require('../models/User');
const Delivery = require('../models/Delivery');
const AuditLog = require('../models/AuditLog');

// Get all riders
exports.getAllRiders = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { roles: 'rider' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const riders = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        riders,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
      }
    });
  } catch (error) {
    console.error('Get all riders error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching riders' });
  }
};

// Get rider details
exports.getRiderDetails = async (req, res) => {
  try {
    const { riderId } = req.params;
    const rider = await User.findById(riderId).select('-password');

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    const totalDeliveries = await Delivery.countDocuments({ rider: riderId, status: 'delivered' });
    const deliveries = await Delivery.find({ rider: riderId }).sort({ createdAt: -1 }).limit(10);
    const totalEarnings = deliveries.reduce((sum, d) => sum + (d.riderEarnings || 0), 0);

    res.json({
      success: true,
      data: {
        rider,
        stats: { totalDeliveries, totalEarnings: totalEarnings.toFixed(2) },
        recentDeliveries: deliveries
      }
    });
  } catch (error) {
    console.error('Get rider details error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching rider details' });
  }
};

// Approve rider
exports.approveRider = async (req, res) => {
  try {
    const { riderId } = req.params;
    const rider = await User.findById(riderId);

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    rider.approved = true;
    rider.approvedAt = new Date();
    await rider.save();

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'rider_approved',
      targetType: 'User',
      targetId: rider._id,
      targetIdentifier: rider.email
    });

    res.json({ success: true, message: 'Rider approved' });
  } catch (error) {
    console.error('Approve rider error:', error);
    res.status(500).json({ success: false, message: 'Server error approving rider' });
  }
};

// Suspend rider
exports.suspendRider = async (req, res) => {
  try {
    const { riderId } = req.params;
    const { reason } = req.body;

    const rider = await User.findById(riderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    rider.suspended = true;
    rider.suspensionReason = reason;
    rider.suspendedAt = new Date();
    await rider.save();

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'rider_suspended',
      targetType: 'User',
      targetId: rider._id,
      targetIdentifier: rider.email,
      reason
    });

    res.json({ success: true, message: 'Rider suspended' });
  } catch (error) {
    console.error('Suspend rider error:', error);
    res.status(500).json({ success: false, message: 'Server error suspending rider' });
  }
};

// Deactivate rider
exports.deactivateRider = async (req, res) => {
  try {
    const { riderId } = req.params;
    const rider = await User.findById(riderId);

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    rider.active = false;
    rider.deactivatedAt = new Date();
    await rider.save();

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'rider_suspended',
      targetType: 'User',
      targetId: rider._id,
      targetIdentifier: rider.email
    });

    res.json({ success: true, message: 'Rider deactivated' });
  } catch (error) {
    console.error('Deactivate rider error:', error);
    res.status(500).json({ success: false, message: 'Server error deactivating rider' });
  }
};
