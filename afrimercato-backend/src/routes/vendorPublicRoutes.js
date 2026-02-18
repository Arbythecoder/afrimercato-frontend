// =================================================================
// VENDOR PUBLIC ROUTES
// =================================================================
// Public vendor endpoints for slug resolution and discovery

const express = require('express');
const router = express.Router();

const { getVendorBySlug } = require('../controllers/productBrowsingController');

// Vendor slug resolution (for frontend routing)
// @route   GET /api/vendors/slug/:slug
// @access  Public
router.get('/slug/:slug', getVendorBySlug);

module.exports = router;
