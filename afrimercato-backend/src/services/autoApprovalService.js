// =================================================================
// AUTO-APPROVAL SERVICE FOR VENDORS
// =================================================================
// File: src/services/autoApprovalService.js
// 
// This service automatically approves vendors after 24-48 hours
// if they meet basic quality checks
//
// USAGE:
// 1. When vendor creates profile → Status: 'pending'
// 2. System checks quality automatically
// 3. After 24-48 hours → Status: 'approved' (if checks pass)
// 4. Vendor can now receive orders from customers

const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { sendStoreApprovedEmail } = require('../emails/vendorEmails');
const cron = require('node-cron');

/**
 * Quality checks for auto-approval
 * Returns { passed: boolean, reason: string }
 */
const performQualityChecks = async (vendor) => {
  const checks = [];
  
  // Check 1: Has store name
  if (!vendor.storeName || vendor.storeName.trim().length < 2) {
    checks.push({ passed: false, reason: 'Store name too short' });
  } else {
    checks.push({ passed: true, check: 'Store name' });
  }
  
  // Check 2: Has valid address
  if (!vendor.address || !vendor.address.street || !vendor.address.city) {
    checks.push({ passed: false, reason: 'Incomplete address' });
  } else {
    checks.push({ passed: true, check: 'Address complete' });
  }
  
  // Check 3: Has phone number
  if (!vendor.phone || vendor.phone.length < 10) {
    checks.push({ passed: false, reason: 'Invalid phone number' });
  } else {
    checks.push({ passed: true, check: 'Phone number valid' });
  }
  
  // Check 4: Has category
  if (!vendor.category) {
    checks.push({ passed: false, reason: 'No category selected' });
  } else {
    checks.push({ passed: true, check: 'Category set' });
  }
  
  // Check 5: Has description (recommended but not required)
  if (!vendor.description || vendor.description.trim().length < 10) {
    checks.push({ passed: true, check: 'Description short (warning)' });
  } else {
    checks.push({ passed: true, check: 'Description adequate' });
  }
  
  // All checks must pass
  const failedChecks = checks.filter(c => !c.passed);
  
  if (failedChecks.length > 0) {
    return {
      passed: false,
      reason: failedChecks.map(c => c.reason).join(', ')
    };
  }
  
  return {
    passed: true,
    checks: checks.map(c => c.check)
  };
};

/**
 * Auto-approve a single vendor
 * Called when vendor reaches 24-48 hour mark
 */
const autoApproveVendor = async (vendorId) => {
  try {
    const vendor = await Vendor.findById(vendorId).populate('user', 'email name');
    
    if (!vendor) {
      console.log(`⚠️ Vendor ${vendorId} not found`);
      return { success: false, reason: 'Vendor not found' };
    }
    
    // Skip if already approved or rejected
    if (vendor.approvalStatus !== 'pending') {
      console.log(`⏭️ Vendor ${vendor.storeName} already ${vendor.approvalStatus}`);
      return { success: false, reason: `Already ${vendor.approvalStatus}` };
    }
    
    // Perform quality checks
    const qualityCheck = await performQualityChecks(vendor);
    
    if (!qualityCheck.passed) {
      // Mark as needs_info instead of rejecting
      vendor.approvalStatus = 'needs_info';
      vendor.approvalNote = `Automatic review: ${qualityCheck.reason}. Please update your profile.`;
      vendor.lastReviewedAt = new Date();
      await vendor.save();
      
      // Send email asking for more info
      if (vendor.user && vendor.user.email) {
        await sendEmail({
          to: vendor.user.email,
          subject: 'Afrimercato - Additional Information Needed',
          html: `
            <h2>Action Required for Your Store: ${vendor.storeName}</h2>
            <p>We need some additional information to complete your store approval:</p>
            <p><strong>${qualityCheck.reason}</strong></p>
            <p>Please log in and update your store profile.</p>
            <p>Once updated, we'll review your application again within 24 hours.</p>
            <a href="${process.env.FRONTEND_URL}/vendor/profile" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; display: inline-block; border-radius: 4px;">Update Profile</a>
          `
        });
      }
      
      console.log(`📋 Vendor ${vendor.storeName} needs more info: ${qualityCheck.reason}`);
      return { success: false, reason: 'Needs more info', details: qualityCheck.reason };
    }
    
    // ✅ APPROVE THE VENDOR
    vendor.approvalStatus = 'approved';
    vendor.isPublic = true; // Now visible to customers
    vendor.isVerified = true;
    vendor.approvedAt = new Date();
    vendor.verifiedAt = new Date();
    vendor.approvalNote = 'Automatically approved after quality checks';
    vendor.lastReviewedAt = new Date();
    
    await vendor.save();
    
    // Update user account approval status
    if (vendor.user) {
      await User.findByIdAndUpdate(vendor.user._id, {
        approvalStatus: 'approved',
        approvedAt: new Date()
      });
    }
    
    // Send professional approval email (like Uber Eats)
    if (vendor.user && vendor.user.email) {
      try {
        const user = await User.findById(vendor.user._id);
        await sendStoreApprovedEmail(user, vendor);
        console.log(`📧 Store approval email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }
    }
    
    console.log(`✅ Auto-approved vendor: ${vendor.storeName} (${vendor.storeId})`);
    
    return {
      success: true,
      vendor: {
        storeId: vendor.storeId,
        storeName: vendor.storeName,
        approvalStatus: vendor.approvalStatus
      }
    };
    
  } catch (error) {
    console.error('❌ Error auto-approving vendor:', error);
    return { success: false, reason: error.message };
  }
};

/**
 * Find and approve all eligible vendors
 * Runs every 6 hours via cron job
 * Processes vendors that have been pending for 24-48 hours
 */
const processAutoApprovals = async () => {
  try {
    console.log('\n🔄 Running auto-approval process (24-48 hour window)...');

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago

    // Find vendors pending for 24-48 hours
    const eligibleVendors = await Vendor.find({
      approvalStatus: 'pending',
      submittedForReviewAt: {
        $lte: twentyFourHoursAgo, // Submitted at least 24 hours ago
        $gte: fortyEightHoursAgo  // But not more than 48 hours ago
      }
    }).populate('user', 'email name');
    
    console.log(`📋 Found ${eligibleVendors.length} vendor(s) eligible for auto-approval`);
    
    if (eligibleVendors.length === 0) {
      return { processed: 0, approved: 0, needsInfo: 0 };
    }
    
    const results = {
      processed: 0,
      approved: 0,
      needsInfo: 0,
      errors: 0
    };
    
    for (const vendor of eligibleVendors) {
      const result = await autoApproveVendor(vendor._id);
      results.processed++;
      
      if (result.success) {
        results.approved++;
      } else if (result.reason === 'Needs more info') {
        results.needsInfo++;
      } else {
        results.errors++;
      }
    }
    
    console.log(`✅ Auto-approval complete:`, results);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error in auto-approval process:', error);
    return { error: error.message };
  }
};

/**
 * Initialize the cron job
 * Runs every hour to check for vendors ready for approval
 */
const initializeAutoApprovalCron = () => {
  // Run every hour at minute 0
  // Format: minute hour day month weekday
  // '0 * * * *' = every hour at :00
  cron.schedule('0 * * * *', async () => {
    console.log('\n⏰ Auto-approval cron job triggered');
    await processAutoApprovals();
  });
  
  console.log('✅ Auto-approval cron job initialized (runs every hour)');
  
  // Also run immediately on startup
  setTimeout(async () => {
    console.log('🔄 Running initial auto-approval check...');
    await processAutoApprovals();
  }, 5000); // Wait 5 seconds after server starts
};

/**
 * Manually trigger auto-approval for a specific vendor
 * Useful for testing or admin override
 */
const manuallyApproveVendor = async (vendorId) => {
  return await autoApproveVendor(vendorId);
};

/**
 * Get vendors pending approval
 * For admin dashboard
 */
const getPendingVendorsInfo = async () => {
  try {
    const now = new Date();
    const minWaitTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const pending = await Vendor.find({
      approvalStatus: 'pending'
    })
    .populate('user', 'email name')
    .select('storeId storeName category address phone submittedForReviewAt')
    .lean();
    
    return pending.map(vendor => ({
      ...vendor,
      hoursSinceSubmission: vendor.submittedForReviewAt 
        ? Math.floor((now - vendor.submittedForReviewAt) / (1000 * 60 * 60))
        : 0,
      eligibleForAutoApproval: vendor.submittedForReviewAt 
        ? vendor.submittedForReviewAt <= minWaitTime
        : false
    }));
    
  } catch (error) {
    console.error('Error getting pending vendors:', error);
    return [];
  }
};

/**
 * Process vendor verification immediately after registration
 * Called from vendorController when vendor creates profile
 */
const processVendorVerification = async (vendorId) => {
  try {
    console.log(`🔄 Processing immediate verification for vendor: ${vendorId}`);

    // For now, just log it - vendor will be auto-approved after 24-48 hours
    // You could add immediate checks here if needed

    return {
      success: true,
      message: 'Vendor queued for auto-approval in 24-48 hours'
    };
  } catch (error) {
    console.error(`❌ Error processing vendor ${vendorId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Alias for compatibility with existing code
 */
const processAllPendingVendors = processAutoApprovals;

module.exports = {
  autoApproveVendor,
  processAutoApprovals,
  processAllPendingVendors, // Alias for server.js
  processVendorVerification, // For vendorController.js
  initializeAutoApprovalCron,
  manuallyApproveVendor,
  getPendingVendorsInfo,
  performQualityChecks
};