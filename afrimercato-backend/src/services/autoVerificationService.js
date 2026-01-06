// Automated Vendor Verification Service
// DISABLED: Now using manual admin approval for vendor accounts
// Vendors must be approved by admin before accessing dashboard

const Vendor = require('../models/Vendor');
const User = require('../models/User');

/**
 * AUTOMATED VERIFICATION SYSTEM - CURRENTLY DISABLED
 *
 * NOTE: This service is disabled in favor of manual admin approval.
 * Vendors now require admin approval at the User account level before
 * they can access any vendor features.
 *
 * To re-enable automated approval, uncomment the cron job setup and
 * change the approval flow in the admin panel.
 */

/**
 * Calculate risk score for vendor application
 * Lower score = lower risk = auto-approve
 * Higher score = higher risk = manual review
 *
 * @param {Object} vendor - Vendor document
 * @param {Object} user - User document
 * @returns {Object} - { score, reasons, isHighRisk }
 */
const calculateRiskScore = async (vendor, user) => {
  let riskScore = 0;
  const riskFactors = [];

  // 1. Email verification (HIGH IMPORTANCE)
  if (!user.isEmailVerified) {
    riskScore += 30;
    riskFactors.push('Email not verified');
  }

  // 2. Phone verification (HIGH IMPORTANCE)
  if (!user.isPhoneVerified) {
    riskScore += 25;
    riskFactors.push('Phone not verified');
  }

  // 3. Account age (prevents spam registrations)
  const accountAgeHours = (Date.now() - user.createdAt) / (1000 * 60 * 60);
  if (accountAgeHours < 1) {
    // Account created less than 1 hour ago
    riskScore += 20;
    riskFactors.push('Very new account (< 1 hour)');
  } else if (accountAgeHours < 24) {
    riskScore += 10;
    riskFactors.push('New account (< 24 hours)');
  }

  // 4. Address validation
  if (!vendor.address || !vendor.address.postalCode) {
    riskScore += 15;
    riskFactors.push('Missing or incomplete address');
  }

  // 5. Business information completeness
  if (!vendor.storeName || vendor.storeName.length < 3) {
    riskScore += 10;
    riskFactors.push('Store name too short');
  }

  if (!vendor.description || vendor.description.length < 20) {
    riskScore += 10;
    riskFactors.push('Insufficient store description');
  }

  // 6. Check for suspicious patterns
  const suspiciousKeywords = ['test', 'fake', 'demo', 'sample', 'temporary'];
  const storeNameLower = vendor.storeName.toLowerCase();
  if (suspiciousKeywords.some(keyword => storeNameLower.includes(keyword))) {
    riskScore += 25;
    riskFactors.push('Suspicious store name (contains test/fake/demo)');
  }

  // 7. Duplicate phone number check
  const duplicatePhone = await Vendor.countDocuments({
    phone: vendor.phone,
    _id: { $ne: vendor._id }
  });
  if (duplicatePhone > 0) {
    riskScore += 30;
    riskFactors.push('Phone number already registered');
  }

  // 8. Check email domain (disposable email detection)
  const disposableDomains = [
    'tempmail.com', 'guerrillamail.com', '10minutemail.com',
    'throwaway.email', 'mailinator.com', 'trashmail.com'
  ];
  const emailDomain = user.email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(emailDomain)) {
    riskScore += 40;
    riskFactors.push('Disposable email address detected');
  }

  // 9. Bank details provided (good sign)
  if (vendor.bankDetails && vendor.bankDetails.accountNumber) {
    riskScore -= 10; // Reduce risk score (bonus points)
    riskFactors.push('Bank details provided (positive)');
  }

  // 10. Business hours configured (shows effort)
  if (vendor.businessHours) {
    riskScore -= 5;
  }

  // Determine risk level
  const isHighRisk = riskScore >= 50;
  const isMediumRisk = riskScore >= 25 && riskScore < 50;

  return {
    score: riskScore,
    reasons: riskFactors,
    isHighRisk,
    isMediumRisk,
    isLowRisk: riskScore < 25,
    recommendation: riskScore < 25 ? 'auto_approve' :
                    riskScore < 50 ? 'manual_review_optional' :
                    'manual_review_required'
  };
};

/**
 * Automatically verify vendor based on risk assessment
 *
 * @param {String} vendorId - Vendor MongoDB ID
 * @returns {Object} - Result of auto-verification
 */
const autoVerifyVendor = async (vendorId) => {
  try {
    const vendor = await Vendor.findById(vendorId).populate('user');

    if (!vendor) {
      return { success: false, message: 'Vendor not found' };
    }

    if (vendor.approvalStatus !== 'pending') {
      return { success: false, message: 'Vendor not in pending status' };
    }

    // Calculate risk score
    const riskAssessment = await calculateRiskScore(vendor, vendor.user);

    // AUTO-APPROVE if low risk (score < 25)
    if (riskAssessment.isLowRisk) {
      vendor.approvalStatus = 'approved';
      vendor.isVerified = true;
      vendor.isActive = true;
      vendor.approvedAt = new Date();
      vendor.verifiedAt = new Date();
      vendor.approvalNote = `Auto-approved via automated verification system. Risk score: ${riskAssessment.score}/100 (Low Risk)`;
      vendor.reviewerNotes = `Automated approval - All checks passed. Risk factors: ${riskAssessment.reasons.join(', ')}`;

      await vendor.save();

      // TODO: Send approval email
      // await sendAutoApprovalEmail(vendor.user.email, vendor.storeName);

      return {
        success: true,
        action: 'auto_approved',
        message: 'Vendor automatically approved',
        riskScore: riskAssessment.score,
        vendor
      };
    }

    // MEDIUM RISK: Can be auto-approved but flagged for later review
    if (riskAssessment.isMediumRisk) {
      vendor.approvalStatus = 'approved';
      vendor.isVerified = true;
      vendor.isActive = true;
      vendor.approvedAt = new Date();
      vendor.verifiedAt = new Date();
      vendor.approvalNote = `Auto-approved with monitoring. Risk score: ${riskAssessment.score}/100 (Medium Risk). Will be monitored for first 30 days.`;
      vendor.reviewerNotes = `Automated approval - Medium risk. Risk factors: ${riskAssessment.reasons.join(', ')}. Flagged for monitoring.`;

      await vendor.save();

      // TODO: Send approval email + notify admin to monitor
      // await sendAutoApprovalEmail(vendor.user.email, vendor.storeName);
      // await notifyAdminMonitoring(vendor, riskAssessment);

      return {
        success: true,
        action: 'auto_approved_with_monitoring',
        message: 'Vendor auto-approved but will be monitored',
        riskScore: riskAssessment.score,
        vendor
      };
    }

    // HIGH RISK: Requires manual admin review
    if (riskAssessment.isHighRisk) {
      vendor.reviewerNotes = `Flagged for manual review. Risk score: ${riskAssessment.score}/100. Reasons: ${riskAssessment.reasons.join(', ')}`;
      await vendor.save();

      // TODO: Notify admin of high-risk application
      // await notifyAdminHighRisk(vendor, riskAssessment);

      return {
        success: true,
        action: 'flagged_for_manual_review',
        message: 'High risk - requires manual admin review',
        riskScore: riskAssessment.score,
        reasons: riskAssessment.reasons
      };
    }

    return {
      success: false,
      message: 'Unable to process verification'
    };

  } catch (error) {
    console.error('Auto-verification error:', error);
    return {
      success: false,
      message: 'Auto-verification failed',
      error: error.message
    };
  }
};

/**
 * Process all pending vendors (can be run on cron job)
 * Automatically processes vendors that have been pending for > 1 hour
 */
const processAllPendingVendors = async () => {
  try {
    // Get vendors pending for more than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const pendingVendors = await Vendor.find({
      approvalStatus: 'pending',
      createdAt: { $lt: oneHourAgo }
    });

    console.log(`Found ${pendingVendors.length} pending vendors to process`);

    const results = {
      autoApproved: 0,
      flaggedForReview: 0,
      errors: 0
    };

    for (const vendor of pendingVendors) {
      const result = await autoVerifyVendor(vendor._id);

      if (result.success) {
        if (result.action === 'auto_approved' || result.action === 'auto_approved_with_monitoring') {
          results.autoApproved++;
        } else if (result.action === 'flagged_for_manual_review') {
          results.flaggedForReview++;
        }
      } else {
        results.errors++;
      }
    }

    console.log('Auto-verification results:', results);
    return results;

  } catch (error) {
    console.error('Error processing pending vendors:', error);
    return { error: error.message };
  }
};

/**
 * Get verification statistics
 */
const getAutoVerificationStats = async () => {
  try {
    const [
      totalAutoApproved,
      totalManualReviewed,
      avgProcessingTime
    ] = await Promise.all([
      Vendor.countDocuments({
        approvalStatus: 'approved',
        approvalNote: { $regex: 'Auto-approved', $options: 'i' }
      }),
      Vendor.countDocuments({
        approvalStatus: 'approved',
        approvedBy: { $exists: true, $ne: null }
      }),
      Vendor.aggregate([
        {
          $match: {
            approvalStatus: 'approved',
            approvedAt: { $exists: true },
            createdAt: { $exists: true }
          }
        },
        {
          $project: {
            processingTimeMs: { $subtract: ['$approvedAt', '$createdAt'] }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$processingTimeMs' }
          }
        }
      ])
    ]);

    const avgHours = avgProcessingTime[0]?.avgTime
      ? (avgProcessingTime[0].avgTime / (1000 * 60 * 60)).toFixed(2)
      : 0;

    return {
      totalAutoApproved,
      totalManualReviewed,
      automationRate: totalAutoApproved > 0
        ? ((totalAutoApproved / (totalAutoApproved + totalManualReviewed)) * 100).toFixed(1)
        : 0,
      avgProcessingTimeHours: avgHours
    };
  } catch (error) {
    console.error('Error getting auto-verification stats:', error);
    return { error: error.message };
  }
};

/**
 * Process verification for a single vendor (used when vendor first registers)
 * This is called immediately after vendor creates profile
 *
 * @param {String} vendorId - Vendor MongoDB ID
 * @returns {Object} - Result of verification
 */
const processVendorVerification = async (vendorId) => {
  try {
    console.log(`🔄 Processing verification for vendor: ${vendorId}`);
    const result = await autoVerifyVendor(vendorId);

    if (result.success && result.action === 'auto_approved') {
      console.log(`✅ Vendor ${vendorId} auto-approved immediately`);
    } else if (result.action === 'flagged_for_manual_review') {
      console.log(`⚠️ Vendor ${vendorId} flagged for manual review - will auto-approve in 24-48h if criteria met`);
    }

    return result;
  } catch (error) {
    console.error(`❌ Error processing vendor ${vendorId}:`, error);
    throw error;
  }
};

module.exports = {
  autoVerifyVendor,
  calculateRiskScore,
  processAllPendingVendors,
  getAutoVerificationStats,
  processVendorVerification
};
