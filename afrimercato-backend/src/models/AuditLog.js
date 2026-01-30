// =================================================================
// AUDIT LOG MODEL - MongoDB Schema for Admin Activity Tracking
// =================================================================

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminEmail: String, // Denormalized for quick access

  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      // Vendor actions
      'vendor_approved', 'vendor_rejected', 'vendor_suspended', 'vendor_activated',
      'vendor_document_verified', 'vendor_document_rejected',

      // Customer actions
      'customer_suspended', 'customer_activated', 'customer_deleted',

      // Rider actions
      'rider_approved', 'rider_rejected', 'rider_suspended', 'rider_activated',

      // Picker actions
      'picker_approved', 'picker_rejected', 'picker_suspended', 'picker_activated',

      // Order actions
      'order_cancelled', 'order_refunded', 'order_modified',

      // Product actions
      'product_removed', 'product_flagged',

      // Review actions
      'review_approved', 'review_rejected', 'review_deleted',

      // Payout actions
      'payout_approved', 'payout_rejected', 'payout_processed',

      // Admin actions
      'admin_created', 'admin_deleted', 'admin_role_changed',
      'admin_login', 'admin_logout', 'admin_password_reset',

      // Notification actions
      'notification_sent', 'bulk_notification_sent',

      // System actions
      'settings_updated', 'feature_toggled', 'maintenance_mode_toggled',

      // Other
      'other'
    ]
  },

  // What was affected
  targetType: {
    type: String,
    enum: ['User', 'Vendor', 'Order', 'Product', 'Review', 'Payout', 'Delivery', 'PickingSession', 'Admin', 'System', 'Notification']
  },
  targetId: mongoose.Schema.Types.ObjectId,
  targetIdentifier: String, // e.g., email, order number, product name

  // Details of the change
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },

  // Additional context
  reason: String,
  notes: String,
  metadata: mongoose.Schema.Types.Mixed,

  // Request information
  ipAddress: String,
  userAgent: String,

  // Status of the action
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },

  errorMessage: String,

  createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

// Static method to create audit log entry
auditLogSchema.statics.log = async function(data) {
  try {
    const log = new this({
      admin: data.admin,
      adminEmail: data.adminEmail,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      targetIdentifier: data.targetIdentifier,
      changes: data.changes,
      reason: data.reason,
      notes: data.notes,
      metadata: data.metadata,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: data.status || 'success',
      errorMessage: data.errorMessage
    });

    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error - audit logging should not break main operations
    return null;
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
