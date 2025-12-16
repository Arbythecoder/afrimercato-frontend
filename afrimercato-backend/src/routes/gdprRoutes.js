// =================================================================
// GDPR ROUTES - Data Rights & Privacy
// =================================================================
// Routes for GDPR compliance: data export, deletion, consent management

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  exportUserData,
  requestDataDeletion,
  cancelDeletionRequest,
  getConsentStatus,
  updateConsent,
  requestDataRectification,
  getProcessingActivities
} = require('../controllers/gdprController');

// =================================================================
// PUBLIC ROUTES
// =================================================================

// @route   GET /api/gdpr/processing-activities
// @desc    Get information about data processing (transparency)
// @access  Public
router.get('/processing-activities', getProcessingActivities);

// =================================================================
// PROTECTED ROUTES (Require Authentication)
// =================================================================

// @route   GET /api/gdpr/export-data
// @desc    Export all user data (Right to Access - Article 15)
// @access  Private
router.get('/export-data', protect, exportUserData);

// @route   POST /api/gdpr/request-deletion
// @desc    Request account deletion (Right to Erasure - Article 17)
// @access  Private
router.post('/request-deletion', protect, requestDataDeletion);

// @route   POST /api/gdpr/cancel-deletion
// @desc    Cancel deletion request (within grace period)
// @access  Private
router.post('/cancel-deletion', protect, cancelDeletionRequest);

// @route   GET /api/gdpr/consent-status
// @desc    Get current consent preferences
// @access  Private
router.get('/consent-status', protect, getConsentStatus);

// @route   PUT /api/gdpr/update-consent
// @desc    Update consent preferences
// @access  Private
router.put('/update-consent', protect, updateConsent);

// @route   POST /api/gdpr/rectify-data
// @desc    Request data correction (Right to Rectification - Article 16)
// @access  Private
router.post('/rectify-data', protect, requestDataRectification);

module.exports = router;
