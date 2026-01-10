// =================================================================
// VENDOR EMAIL TEMPLATES
// =================================================================
// Professional email templates for vendor onboarding workflow
// Similar to Uber Eats, DoorDash, and Just Eat vendor emails

const { sendEmail } = require('../utils/emailService');

/**
 * EMAIL 1: Welcome Email (Sent immediately after vendor registration)
 * Triggers: User registers with role='vendor'
 * Purpose: Verify email and welcome to platform
 */
const sendVendorWelcomeEmail = async (user, verificationToken = null) => {
  const verifyUrl = verificationToken
    ? `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
    : null;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Afrimercato</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

              <!-- Header with Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                    🎉 Welcome to Afrimercato!
                  </h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">
                    Your journey to selling online starts here
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0; line-height: 1.6;">
                    Hi <strong>${user.name}</strong>,
                  </p>

                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0; line-height: 1.6;">
                    Thank you for choosing Afrimercato as your partner! We're thrilled to have you join our growing community of vendors.
                  </p>

                  ${verifyUrl ? `
                  <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0 0 15px 0; color: #92400E; font-size: 15px; font-weight: 600;">
                      ⚡ Action Required: Verify Your Email
                    </p>
                    <p style="margin: 0 0 20px 0; color: #78350F; font-size: 14px; line-height: 1.5;">
                      Please verify your email address to continue setting up your store.
                    </p>
                    <div style="text-align: center;">
                      <a href="${verifyUrl}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                        Verify Email Address
                      </a>
                    </div>
                    <p style="margin: 20px 0 0 0; color: #78350F; font-size: 12px;">
                      This link expires in 24 hours. If you didn't create an account, please ignore this email.
                    </p>
                  </div>
                  ` : ''}

                  <div style="background-color: #F0FDF4; padding: 25px; margin: 25px 0; border-radius: 8px; border: 1px solid #BBF7D0;">
                    <h3 style="color: #065F46; margin: 0 0 15px 0; font-size: 18px;">
                      🚀 What's Next?
                    </h3>
                    <ol style="margin: 0; padding-left: 20px; color: #047857;">
                      <li style="margin-bottom: 10px; line-height: 1.5;">
                        <strong>Verify your email</strong> (if required)
                      </li>
                      <li style="margin-bottom: 10px; line-height: 1.5;">
                        <strong>Complete your store profile</strong> with business details
                      </li>
                      <li style="margin-bottom: 10px; line-height: 1.5;">
                        <strong>Wait 24-48 hours</strong> for automated review
                      </li>
                      <li style="margin-bottom: 10px; line-height: 1.5;">
                        <strong>Start selling!</strong> Once approved, your store goes live
                      </li>
                    </ol>
                  </div>

                  <div style="background-color: #F9FAFB; padding: 20px; margin: 25px 0; border-radius: 8px; border: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px;">
                      <strong>📧 Your Account Email:</strong> ${user.email}
                    </p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">
                      <strong>👤 Role:</strong> Vendor
                    </p>
                  </div>

                  <p style="font-size: 14px; color: #6B7280; margin: 30px 0 0 0; line-height: 1.6;">
                    Need help? Our support team is here for you at <a href="mailto:vendors@afrimercato.com" style="color: #059669; text-decoration: none;">vendors@afrimercato.com</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px;">
                    Best regards,<br>
                    <strong style="color: #059669;">The Afrimercato Team</strong>
                  </p>
                  <div style="margin: 20px 0;">
                    <a href="${process.env.FRONTEND_URL}/vendor/login" style="color: #059669; text-decoration: none; margin: 0 10px; font-size: 13px;">Login</a>
                    <span style="color: #D1D5DB;">•</span>
                    <a href="${process.env.FRONTEND_URL}/help" style="color: #059669; text-decoration: none; margin: 0 10px; font-size: 13px;">Help Center</a>
                    <span style="color: #D1D5DB;">•</span>
                    <a href="${process.env.FRONTEND_URL}/vendor/terms" style="color: #059669; text-decoration: none; margin: 0 10px; font-size: 13px;">Vendor Terms</a>
                  </div>
                  <p style="margin: 20px 0 0 0; color: #9CA3AF; font-size: 12px;">
                    © ${new Date().getFullYear()} Afrimercato. All rights reserved.<br>
                    Fresh African Groceries Delivered to Your Door
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: '🎉 Welcome to Afrimercato - Let\'s Get Your Store Started!',
    html
  });
};

/**
 * EMAIL 2: Store Profile Created (Sent after vendor completes profile setup)
 * Triggers: POST /api/vendor/profile succeeds
 * Purpose: Confirm profile submission and explain review process
 */
const sendStoreProfileCreatedEmail = async (user, vendor) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Store Profile Created</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                    ✅ Store Profile Created!
                  </h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">
                    Your application is under review
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0; line-height: 1.6;">
                    Hi <strong>${user.name}</strong>,
                  </p>

                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0; line-height: 1.6;">
                    Great news! Your store <strong style="color: #059669;">${vendor.storeName}</strong> has been successfully created and submitted for review.
                  </p>

                  <!-- Store Details Box -->
                  <div style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #3B82F6;">
                    <h3 style="color: #1E40AF; margin: 0 0 15px 0; font-size: 18px;">
                      📦 Your Store Details
                    </h3>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #1E3A8A; font-weight: 600; font-size: 14px; width: 40%;">Store ID:</td>
                        <td style="color: #1E40AF; font-size: 14px;">${vendor.storeId}</td>
                      </tr>
                      <tr>
                        <td style="color: #1E3A8A; font-weight: 600; font-size: 14px;">Store Name:</td>
                        <td style="color: #1E40AF; font-size: 14px;">${vendor.storeName}</td>
                      </tr>
                      <tr>
                        <td style="color: #1E3A8A; font-weight: 600; font-size: 14px;">Category:</td>
                        <td style="color: #1E40AF; font-size: 14px;">${vendor.category}</td>
                      </tr>
                      <tr>
                        <td style="color: #1E3A8A; font-weight: 600; font-size: 14px;">Status:</td>
                        <td style="color: #F59E0B; font-weight: 600; font-size: 14px;">⏳ Pending Approval</td>
                      </tr>
                      <tr>
                        <td style="color: #1E3A8A; font-weight: 600; font-size: 14px;">Submitted:</td>
                        <td style="color: #1E40AF; font-size: 14px;">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Timeline Box -->
                  <div style="background-color: #FEF3C7; padding: 25px; margin: 25px 0; border-radius: 8px; border: 1px solid #FDE68A;">
                    <h3 style="color: #92400E; margin: 0 0 15px 0; font-size: 18px;">
                      ⏰ What Happens Next?
                    </h3>
                    <div style="position: relative; padding-left: 30px;">
                      <div style="border-left: 2px solid #F59E0B; position: absolute; left: 10px; top: 5px; bottom: 5px;"></div>

                      <div style="margin-bottom: 20px; position: relative;">
                        <div style="width: 12px; height: 12px; background-color: #059669; border-radius: 50%; position: absolute; left: -25px; top: 5px;"></div>
                        <p style="margin: 0; color: #065F46; font-weight: 600; font-size: 14px;">✅ Application Received</p>
                        <p style="margin: 5px 0 0 0; color: #78350F; font-size: 13px;">Your store profile has been submitted successfully</p>
                      </div>

                      <div style="margin-bottom: 20px; position: relative;">
                        <div style="width: 12px; height: 12px; background-color: #F59E0B; border-radius: 50%; position: absolute; left: -25px; top: 5px;"></div>
                        <p style="margin: 0; color: #92400E; font-weight: 600; font-size: 14px;">⏳ Automated Review (24-48 hours)</p>
                        <p style="margin: 5px 0 0 0; color: #78350F; font-size: 13px;">Our system will verify your business details</p>
                      </div>

                      <div style="margin-bottom: 20px; position: relative;">
                        <div style="width: 12px; height: 12px; background-color: #D1D5DB; border-radius: 50%; position: absolute; left: -25px; top: 5px;"></div>
                        <p style="margin: 0; color: #6B7280; font-weight: 600; font-size: 14px;">🎉 Approval & Go Live</p>
                        <p style="margin: 5px 0 0 0; color: #78350F; font-size: 13px;">You'll receive an email when your store is approved</p>
                      </div>

                      <div style="position: relative;">
                        <div style="width: 12px; height: 12px; background-color: #D1D5DB; border-radius: 50%; position: absolute; left: -25px; top: 5px;"></div>
                        <p style="margin: 0; color: #6B7280; font-weight: 600; font-size: 14px;">🚀 Start Selling</p>
                        <p style="margin: 5px 0 0 0; color: #78350F; font-size: 13px;">Add products and accept orders from customers</p>
                      </div>
                    </div>
                  </div>

                  <!-- While You Wait Box -->
                  <div style="background-color: #F0FDF4; padding: 25px; margin: 25px 0; border-radius: 8px; border: 1px solid #BBF7D0;">
                    <h3 style="color: #065F46; margin: 0 0 15px 0; font-size: 18px;">
                      💡 While You Wait, You Can:
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #047857;">
                      <li style="margin-bottom: 10px; line-height: 1.5;">✏️ <strong>Update your store profile</strong> and add more details</li>
                      <li style="margin-bottom: 10px; line-height: 1.5;">📦 <strong>Prepare your product catalog</strong> (though products won't be visible until approved)</li>
                      <li style="margin-bottom: 10px; line-height: 1.5;">⚙️ <strong>Configure delivery settings</strong> and business hours</li>
                      <li style="margin-bottom: 10px; line-height: 1.5;">📚 <strong>Explore our vendor resources</strong> and best practices</li>
                    </ul>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/vendor/dashboard" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                      Go to Dashboard
                    </a>
                  </div>

                  <div style="background-color: #F9FAFB; padding: 20px; margin: 25px 0; border-radius: 8px; border: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px;">
                      <strong>💬 Questions?</strong>
                    </p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                      Contact our vendor support team at <a href="mailto:vendors@afrimercato.com" style="color: #059669; text-decoration: none;">vendors@afrimercato.com</a><br>
                      We typically respond within 2-4 hours during business hours.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px;">
                    Best regards,<br>
                    <strong style="color: #059669;">The Afrimercato Vendor Team</strong>
                  </p>
                  <div style="margin: 20px 0;">
                    <a href="${process.env.FRONTEND_URL}/vendor/dashboard" style="color: #059669; text-decoration: none; margin: 0 10px; font-size: 13px;">Dashboard</a>
                    <span style="color: #D1D5DB;">•</span>
                    <a href="${process.env.FRONTEND_URL}/vendor/help" style="color: #059669; text-decoration: none; margin: 0 10px; font-size: 13px;">Vendor Help</a>
                    <span style="color: #D1D5DB;">•</span>
                    <a href="${process.env.FRONTEND_URL}/vendor/resources" style="color: #059669; text-decoration: none; margin: 0 10px; font-size: 13px;">Resources</a>
                  </div>
                  <p style="margin: 20px 0 0 0; color: #9CA3AF; font-size: 12px;">
                    © ${new Date().getFullYear()} Afrimercato. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `✅ Store Profile Created - ${vendor.storeName} | Afrimercato`,
    html
  });
};

/**
 * EMAIL 3: Store Approved (Sent when vendor is approved)
 * Triggers: Admin approves vendor OR auto-approval completes
 * Purpose: Celebrate approval and guide next steps
 */
const sendStoreApprovedEmail = async (user, vendor) => {
  const loginUrl = `${process.env.FRONTEND_URL}/vendor/login`;
  const dashboardUrl = `${process.env.FRONTEND_URL}/vendor/dashboard`;
  const addProductsUrl = `${process.env.FRONTEND_URL}/vendor/products/new`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Congratulations - Your Store is Live!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

              <!-- Celebration Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 50px 30px; text-align: center;">
                  <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                    Congratulations!
                  </h1>
                  <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 18px; font-weight: 500; opacity: 0.95;">
                    Your store is now LIVE on Afrimercato!
                  </p>
                </td>
              </tr>

              <!-- Confetti Banner -->
              <tr>
                <td style="background: linear-gradient(90deg, #FEF3C7 0%, #FDE68A 50%, #FEF3C7 100%); padding: 15px; text-align: center;">
                  <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">
                    🌟 Your store is now visible to thousands of customers! 🌟
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="font-size: 18px; color: #333; margin: 0 0 20px 0; line-height: 1.6;">
                    Hi <strong>${user.name}</strong>,
                  </p>

                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0; line-height: 1.6;">
                    We're thrilled to inform you that <strong style="color: #059669;">${vendor.storeName}</strong> has been <strong>approved and is now live</strong> on Afrimercato! 🚀
                  </p>

                  <p style="font-size: 16px; color: #333; margin: 0 0 25px 0; line-height: 1.6;">
                    Customers can now discover your products and place orders. Let's make your first sale!
                  </p>

                  <!-- Quick Stats Box -->
                  <div style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #10B981;">
                    <h3 style="color: #065F46; margin: 0 0 15px 0; font-size: 18px;">
                      ✅ Your Store is Now Active
                    </h3>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #065F46; font-weight: 600; font-size: 14px; width: 45%;">Store Name:</td>
                        <td style="color: #047857; font-size: 14px; font-weight: 600;">${vendor.storeName}</td>
                      </tr>
                      <tr>
                        <td style="color: #065F46; font-weight: 600; font-size: 14px;">Store ID:</td>
                        <td style="color: #047857; font-size: 14px;">${vendor.storeId}</td>
                      </tr>
                      <tr>
                        <td style="color: #065F46; font-weight: 600; font-size: 14px;">Status:</td>
                        <td style="color: #10B981; font-weight: 700; font-size: 14px;">✅ APPROVED & LIVE</td>
                      </tr>
                      <tr>
                        <td style="color: #065F46; font-weight: 600; font-size: 14px;">Approved On:</td>
                        <td style="color: #047857; font-size: 14px;">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                      <tr>
                        <td style="color: #065F46; font-weight: 600; font-size: 14px;">Customer Visibility:</td>
                        <td style="color: #047857; font-size: 14px; font-weight: 600;">🌍 Public (Visible to all customers)</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; margin: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      🚀 Go to Dashboard
                    </a>
                    <a href="${addProductsUrl}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; margin: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      📦 Add Products
                    </a>
                  </div>

                  <!-- Next Steps -->
                  <div style="background-color: #FEF3C7; padding: 25px; margin: 25px 0; border-radius: 8px; border: 1px solid #FDE68A;">
                    <h3 style="color: #92400E; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
                      🎯 Your First 3 Steps to Success
                    </h3>

                    <div style="margin-bottom: 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50" style="vertical-align: top;">
                            <div style="background-color: #F59E0B; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; text-align: center; line-height: 40px;">1</div>
                          </td>
                          <td style="padding-left: 15px;">
                            <p style="margin: 0 0 5px 0; color: #92400E; font-weight: 700; font-size: 15px;">Add Your Products</p>
                            <p style="margin: 0; color: #78350F; font-size: 14px; line-height: 1.5;">Upload high-quality photos, set competitive prices, and write compelling descriptions</p>
                            <a href="${addProductsUrl}" style="color: #F59E0B; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; margin-top: 8px;">Add Products →</a>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="margin-bottom: 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50" style="vertical-align: top;">
                            <div style="background-color: #10B981; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; text-align: center; line-height: 40px;">2</div>
                          </td>
                          <td style="padding-left: 15px;">
                            <p style="margin: 0 0 5px 0; color: #92400E; font-weight: 700; font-size: 15px;">Configure Delivery Settings</p>
                            <p style="margin: 0; color: #78350F; font-size: 14px; line-height: 1.5;">Set your delivery zones, fees, and estimated preparation times</p>
                            <a href="${dashboardUrl}/settings/delivery" style="color: #10B981; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; margin-top: 8px;">Configure Settings →</a>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50" style="vertical-align: top;">
                            <div style="background-color: #3B82F6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; text-align: center; line-height: 40px;">3</div>
                          </td>
                          <td style="padding-left: 15px;">
                            <p style="margin: 0 0 5px 0; color: #92400E; font-weight: 700; font-size: 15px;">Start Accepting Orders</p>
                            <p style="margin: 0; color: #78350F; font-size: 14px; line-height: 1.5;">Monitor your dashboard, fulfill orders quickly, and delight customers</p>
                            <a href="${dashboardUrl}/orders" style="color: #3B82F6; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; margin-top: 8px;">View Orders →</a>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>

                  <!-- Success Tips -->
                  <div style="background-color: #F0FDF4; padding: 25px; margin: 25px 0; border-radius: 8px; border: 1px solid #BBF7D0;">
                    <h3 style="color: #065F46; margin: 0 0 15px 0; font-size: 18px;">
                      💡 Tips for Your First Week
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #047857;">
                      <li style="margin-bottom: 10px; line-height: 1.6;">📸 <strong>Use high-quality product photos</strong> - Products with good photos sell 3x more</li>
                      <li style="margin-bottom: 10px; line-height: 1.6;">⚡ <strong>Respond quickly to orders</strong> - Accept orders within 15 minutes for best results</li>
                      <li style="margin-bottom: 10px; line-height: 1.6;">💬 <strong>Communicate with customers</strong> - Update order status regularly</li>
                      <li style="margin-bottom: 10px; line-height: 1.6;">🎯 <strong>Offer competitive prices</strong> - Check competitor pricing in your category</li>
                      <li style="margin-bottom: 10px; line-height: 1.6;">⭐ <strong>Aim for 5-star ratings</strong> - Great reviews boost your visibility</li>
                    </ul>
                  </div>

                  <!-- Support Box -->
                  <div style="background-color: #EFF6FF; padding: 20px; margin: 25px 0; border-radius: 8px; border: 1px solid #DBEAFE; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #1E40AF; font-size: 16px; font-weight: 600;">
                      🤝 We're Here to Help You Succeed
                    </p>
                    <p style="margin: 0 0 15px 0; color: #1E3A8A; font-size: 14px; line-height: 1.5;">
                      Have questions? Our dedicated vendor support team is ready to assist you.
                    </p>
                    <p style="margin: 0; color: #1E3A8A; font-size: 14px;">
                      📧 <a href="mailto:vendors@afrimercato.com" style="color: #3B82F6; text-decoration: none; font-weight: 600;">vendors@afrimercato.com</a><br>
                      📞 <strong>+44 20 1234 5678</strong> (Mon-Fri, 9am-6pm)
                    </p>
                  </div>

                  <p style="font-size: 16px; color: #333; margin: 30px 0 0 0; line-height: 1.6; text-align: center;">
                    Welcome to the Afrimercato family! We can't wait to see your store thrive. 🌟
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="margin: 0 0 15px 0; color: #6B7280; font-size: 14px;">
                    Cheers to your success,<br>
                    <strong style="color: #059669;">The Afrimercato Team</strong>
                  </p>
                  <div style="margin: 20px 0;">
                    <a href="${dashboardUrl}" style="color: #059669; text-decoration: none; margin: 0 10px; font-size: 13px;">Dashboard</a>
                    <span style="color: #D1D5DB;">•</span>
                    <a href="${process.env.FRONTEND_URL}/vendor/help" style="color: #059669; text-decoration: none; margin: 0 10px; font-size: 13px;">Help Center</a>
                    <span style="color: #D1D5DB;">•</span>
                    <a href="${process.env.FRONTEND_URL}/vendor/best-practices" style="color: #059669; text-decoration: none; margin: 0 10px; font-size: 13px;">Best Practices</a>
                  </div>
                  <p style="margin: 20px 0 0 0; color: #9CA3AF; font-size: 12px;">
                    © ${new Date().getFullYear()} Afrimercato. All rights reserved.<br>
                    Connecting vendors with customers across the UK
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `🎉 Congratulations! ${vendor.storeName} is Now Live on Afrimercato`,
    html
  });
};

/**
 * EMAIL 4: Store Rejected (Optional - if manual review rejects)
 * Triggers: Admin manually rejects vendor
 * Purpose: Explain rejection with actionable feedback
 */
const sendStoreRejectedEmail = async (user, vendor, reason) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0;">
      <title>Store Application Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

              <tr>
                <td style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                    Application Update Required
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 30px;">
                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0; line-height: 1.6;">
                    Hi <strong>${user.name}</strong>,
                  </p>

                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0; line-height: 1.6;">
                    Thank you for applying to sell on Afrimercato. Unfortunately, we're unable to approve your store <strong>${vendor.storeName}</strong> at this time.
                  </p>

                  <div style="background-color: #FEE2E2; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #DC2626;">
                    <h3 style="color: #991B1B; margin: 0 0 10px 0; font-size: 16px;">Reason:</h3>
                    <p style="margin: 0; color: #7F1D1D; font-size: 14px; line-height: 1.6;">${reason || 'Please review our vendor requirements and reapply.'}</p>
                  </div>

                  <div style="background-color: #EFF6FF; padding: 20px; margin: 25px 0; border-radius: 8px;">
                    <h3 style="color: #1E40AF; margin: 0 0 15px 0; font-size: 18px;">What You Can Do:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #1E3A8A;">
                      <li style="margin-bottom: 10px;">Review and update your store information</li>
                      <li style="margin-bottom: 10px;">Ensure all required documents are provided</li>
                      <li style="margin-bottom: 10px;">Contact our support team for guidance</li>
                      <li>Resubmit your application when ready</li>
                    </ul>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:vendors@afrimercato.com" style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                      Contact Support
                    </a>
                  </div>

                  <p style="font-size: 14px; color: #6B7280; margin: 20px 0 0 0; line-height: 1.6;">
                    We're here to help you succeed. Please reach out if you have any questions.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="margin: 0; color: #6B7280; font-size: 14px;">
                    The Afrimercato Vendor Team<br>
                    <a href="mailto:vendors@afrimercato.com" style="color: #059669; text-decoration: none;">vendors@afrimercato.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Application Update - ${vendor.storeName} | Afrimercato`,
    html
  });
};

module.exports = {
  sendVendorWelcomeEmail,
  sendStoreProfileCreatedEmail,
  sendStoreApprovedEmail,
  sendStoreRejectedEmail
};
