// =================================================================
// ADMIN PICKER CONTROLLER - Picker Management
// =================================================================

const User = require('../models/User');
const PickingSession = require('../models/PickingSession');
const AuditLog = require('../models/AuditLog');

// Get all pickers
exports.getAllPickers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { roles: 'picker' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pickers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        pickers,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
      }
    });
  } catch (error) {
    console.error('Get all pickers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching pickers' });
  }
};

// Get picker details
exports.getPickerDetails = async (req, res) => {
  try {
    const { pickerId } = req.params;
    const picker = await User.findById(pickerId).select('-password');

    if (!picker) {
      return res.status(404).json({ success: false, message: 'Picker not found' });
    }

    const totalOrders = await PickingSession.countDocuments({ picker: pickerId, status: 'completed' });
    const sessions = await PickingSession.find({ picker: pickerId }).sort({ createdAt: -1 }).limit(10);
    const totalEarnings = sessions.reduce((sum, s) => sum + (s.earnings || 0), 0);

    res.json({
      success: true,
      data: {
        picker,
        stats: { totalOrders, totalEarnings: totalEarnings.toFixed(2) },
        recentSessions: sessions
      }
    });
  } catch (error) {
    console.error('Get picker details error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching picker details' });
  }
};

// Approve picker
exports.approvePicker = async (req, res) => {
  try {
    const { pickerId } = req.params;
    const picker = await User.findById(pickerId);

    if (!picker) {
      return res.status(404).json({ success: false, message: 'Picker not found' });
    }

    picker.approved = true;
    picker.approvedAt = new Date();
    await picker.save();

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'picker_approved',
      targetType: 'User',
      targetId: picker._id,
      targetIdentifier: picker.email
    });

    res.json({ success: true, message: 'Picker approved' });
  } catch (error) {
    console.error('Approve picker error:', error);
    res.status(500).json({ success: false, message: 'Server error approving picker' });
  }
};

// Suspend picker
exports.suspendPicker = async (req, res) => {
  try {
    const { pickerId } = req.params;
    const { reason } = req.body;

    const picker = await User.findById(pickerId);
    if (!picker) {
      return res.status(404).json({ success: false, message: 'Picker not found' });
    }

    picker.suspended = true;
    picker.suspensionReason = reason;
    picker.suspendedAt = new Date();
    await picker.save();

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'picker_suspended',
      targetType: 'User',
      targetId: picker._id,
      targetIdentifier: picker.email,
      reason
    });

    res.json({ success: true, message: 'Picker suspended' });
  } catch (error) {
    console.error('Suspend picker error:', error);
    res.status(500).json({ success: false, message: 'Server error suspending picker' });
  }
};

// Deactivate picker
exports.deactivatePicker = async (req, res) => {
  try {
    const { pickerId } = req.params;
    const picker = await User.findById(pickerId);

    if (!picker) {
      return res.status(404).json({ success: false, message: 'Picker not found' });
    }

    picker.active = false;
    picker.deactivatedAt = new Date();
    await picker.save();

    await AuditLog.log({
      admin: req.user.id,
      adminEmail: req.user.email,
      action: 'picker_suspended',
      targetType: 'User',
      targetId: picker._id,
      targetIdentifier: picker.email
    });

    res.json({ success: true, message: 'Picker deactivated' });
  } catch (error) {
    console.error('Deactivate picker error:', error);
    res.status(500).json({ success: false, message: 'Server error deactivating picker' });
  }
};
