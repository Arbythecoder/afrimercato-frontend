
// =================================================================
// VENDOR ONBOARDING EMAILS
// =================================================================

/**
 * Send vendor welcome email after registration
 */
const sendVendorWelcomeEmail = async (vendor, user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2D5F3F 0%, #1E4029 100%); 
                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { background: #2D5F3F; color: white; padding: 12px 30px; 
                 text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .steps { margin: 30px 0; }
        .step { display: flex; margin-bottom: 20px; align-items: center; }
        .step-number { background: #2D5F3F; color: white; width: 35px; height: 35px; 
                      border-radius: 50%; display: flex; align-items: center; 
                      justify-content: center; margin-right: 15px; font-weight: bold; }
        .info-box { background: #e8f5e9; padding: 20px; border-radius: 5px; 
                    margin: 20px 0; border-left: 4px solid #2D5F3F; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Afrimercato! 🎉</h1>
          <p>Your journey as a vendor starts here</p>
        </div>
        
        <div class="content">
          <h2>Hi ${user.name},</h2>
          <p>Welcome to Afrimercato! Your store <strong>${vendor.storeName}</strong> has been registered.</p>
          
          <div class="steps">
            <h3>📋 Your 4-Step Setup Process:</h3>
            
            <div class="step">
              <div class="step-number">1</div>
              <div>
                <strong>Verify Your Email</strong>
                <p>Click the button below to confirm your email address:</p>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                <p><small>Or copy this link: ${verificationUrl}</small></p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div>
                <strong>Complete Store Profile</strong>
                <p>Log in and complete your business details after email verification.</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div>
                <strong>Business Verification</strong>
                <p>Our team will verify your business details within <strong>24-48 hours</strong>.</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">4</div>
              <div>
                <strong>Start Selling!</strong>
                <p>Add your products and start receiving orders!</p>
              </div>
            </div>
          </div>
          
          <div class="info-box">
            <p><strong>📊 Your Store ID:</strong> ${vendor.storeId}</p>
            <p><strong>⏱️ Estimated Timeline:</strong> 24-48 hours for business verification</p>
            <p><strong>📞 Need Help?</strong> Email: vendors@afrimercato.com</p>
          </div>
          
          <p>Best regards,<br>The Afrimercato Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Welcome to Afrimercato - Verify Your Email`,
    html
  });
};

/**
 * Send vendor profile submission confirmation
 */
const sendVendorProfileSubmittedEmail = async (vendor, user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .status-card { background: white; padding: 25px; border-radius: 8px; margin: 25px 0; 
                       box-shadow: 0 3px 10px rgba(0,0,0,0.1); border-left: 5px solid #2196F3; }
        .timeline { display: flex; justify-content: space-between; margin: 30px 0; }
        .timeline-item { text-align: center; }
        .timeline-date { font-weight: bold; color: #2196F3; font-size: 16px; }
        .highlight { font-size: 24px; font-weight: bold; color: #2196F3; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Store Profile Submitted! ✅</h1>
          <p>Your application is now under review</p>
        </div>
        
        <div class="content">
          <h2>Hi ${user.name},</h2>
          <p>Great news! Your store profile for <strong>${vendor.storeName}</strong> has been submitted successfully.</p>
          
          <div class="status-card">
            <h3>⏳ What Happens Next?</h3>
            <p>Our verification team will review your business details. The estimated review time is:</p>
            
            <div class="highlight">24-48 Hours</div>
            
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-date">Now</div>
                <p>Profile Submitted</p>
              </div>
              <div class="timeline-item">
                <div style="font-size: 24px;">→</div>
              </div>
              <div class="timeline-item">
                <div class="timeline-date">24-48h</div>
                <p>Verification Complete</p>
              </div>
            </div>
            
            <p><strong>📧 You'll receive an email notification</strong> once your store is approved and ready to go live.</p>
            <p><em>You can prepare your product listings while waiting for approval.</em></p>
          </div>
          
          <p><strong>📊 Store Details:</strong></p>
          <ul>
            <li><strong>Store ID:</strong> ${vendor.storeId}</li>
            <li><strong>Store Name:</strong> ${vendor.storeName}</li>
            <li><strong>Submission Date:</strong> ${new Date(vendor.createdAt).toLocaleDateString()}</li>
          </ul>
          
          <p><strong>📞 Support:</strong> vendors@afrimercato.com</p>
          
          <p>Thank you for your patience,<br>The Afrimercato Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Store Profile Submitted - ${vendor.storeName}`,
    html
  });
};

/**
 * Send admin notification for new vendor
 */
const sendAdminVendorNotification = async (vendor, user) => {
  const adminUrl = `${process.env.ADMIN_URL || process.env.FRONTEND_URL || 'http://localhost:3000'}/admin`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; border: 2px solid #ff9800; border-radius: 10px;">
        <div style="background: #ff9800; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">⚠️ New Vendor Registration</h1>
          <p>Requires Admin Approval</p>
        </div>
        
        <div style="padding: 25px;">
          <h2>New Vendor Details:</h2>
          
          <div style="background: #fff8e1; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Store Name:</strong> ${vendor.storeName}</p>
            <p><strong>Store ID:</strong> ${vendor.storeId}</p>
            <p><strong>Vendor Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
            <p><strong>Category:</strong> ${vendor.category}</p>
            <p><strong>Registered:</strong> ${new Date(vendor.createdAt).toLocaleString()}</p>
          </div>
          
          <p><strong>📋 Action Required:</strong></p>
          <ul>
            <li>Review business details</li>
            <li>Verify documents if needed</li>
            <li>Approve or reject within 48 hours</li>
          </ul>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${adminUrl}/vendors/${vendor._id}/review" 
               style="background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 5px; font-weight: bold; display: inline-block;">
              Review Vendor
            </a>
          </div>
          
          <p><small>This is an automated notification. Vendor status: <strong>PENDING</strong></small></p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (process.env.ADMIN_EMAIL) {
    return sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `[ACTION REQUIRED] New Vendor: ${vendor.storeName}`,
      html
    });
  } else {
    console.log('⚠️ ADMIN_EMAIL not configured - skipping admin notification');
    return { success: false, message: 'ADMIN_EMAIL not configured' };
  }
};

// =================================================================
// EMAIL SERVICE - Universal Email Sender
// =================================================================
// Supports: SendGrid, AWS SES, SMTP (Gmail)
// Configure via environment variables

const nodemailer = require('nodemailer');

/**
 * Get email transporter based on configuration
 */
const getTransporter = () => {
  const service = process.env.EMAIL_SERVICE || 'sendgrid';

  switch (service) {
    case 'sendgrid':
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('⚠️ SendGrid API key not configured');
        return null;
      }
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });

    case 'aws-ses':
      if (!process.env.AWS_SES_ACCESS_KEY || !process.env.AWS_SES_SECRET_KEY) {
        console.warn('⚠️ AWS SES credentials not configured');
        return null;
      }
      return nodemailer.createTransport({
        host: `email.${process.env.AWS_SES_REGION || 'eu-west-1'}.amazonaws.com`,
        port: 587,
        auth: {
          user: process.env.AWS_SES_ACCESS_KEY,
          pass: process.env.AWS_SES_SECRET_KEY
        }
      });

    case 'smtp':
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn('⚠️ SMTP credentials not configured');
        return null;
      }
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });

    default:
      console.warn('⚠️ Unknown email service:', service);
      return null;
  }
};

/**
 * Send email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log('📧 Email not sent (no transporter configured)');
    console.log('   To:', to);
    console.log('   Subject:', subject);
    return { success: false, message: 'Email service not configured' };
  }

  const fromEmail = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@afrimercato.com';

  try {
    await transporter.sendMail({
      from: `Afrimercato <${fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });

    console.log(`✅ Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Email Templates
 */

const sendOrderConfirmation = async (order, customer) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2D5F3F 0%, #1E4029 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <p style="font-size: 16px;">Hi ${customer.name},</p>
        <p>Thank you for your order! We've received it and will start preparing it shortly.</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Order #${order.orderNumber}</h2>
          <p><strong>Total:</strong> £${order.pricing.total.toFixed(2)}</p>
          <p><strong>Delivery Address:</strong><br>${order.deliveryAddress.street}, ${order.deliveryAddress.city}</p>
        </div>

        <p>You can track your order at: <a href="${process.env.FRONTEND_URL}/customer/orders/${order._id}">View Order</a></p>

        <p style="margin-top: 30px; color: #666;">
          Thanks,<br>
          The Afrimercato Team
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customer.email,
    subject: `Order Confirmed - ${order.orderNumber}`,
    html
  });
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2D5F3F 0%, #1E4029 100%); padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to Afrimercato!</h1>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 16px;">Hi ${user.name},</p>
        <p>We're excited to have you join our community!</p>
        <p>Afrimercato connects you with authentic African groceries delivered fresh to your door.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background: #2D5F3F; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Start Shopping
          </a>
        </div>

        <p style="color: #666;">
          Best regards,<br>
          The Afrimercato Team
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Afrimercato - Fresh African Groceries',
    html
  });
};

// =================================================================
// VENDOR APPROVAL/REJECTION EMAILS
// =================================================================

/**
 * Send vendor approval email
 */
const sendVendorApprovalEmail = async (vendorEmail, storeName, approvalNote) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #2D5F3F 100%);
                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { background: #4CAF50; color: white; padding: 15px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block;
                 margin: 20px 0; font-weight: bold; }
        .success-box { background: #e8f5e9; padding: 20px; border-radius: 5px;
                      margin: 20px 0; border-left: 4px solid #4CAF50; }
        .next-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <p>Your store has been approved</p>
        </div>

        <div class="content">
          <div class="success-box">
            <h2 style="color: #4CAF50; margin-top: 0;">✅ ${storeName} is Now Live!</h2>
            <p><strong>Your vendor account has been approved and activated.</strong></p>
            ${approvalNote ? `<p><em>${approvalNote}</em></p>` : ''}
          </div>

          <p>You can now access your vendor dashboard and start selling on Afrimercato!</p>

          <div class="next-steps">
            <h3>🚀 Next Steps:</h3>
            <ol>
              <li><strong>Add Products:</strong> Upload your products with images and descriptions</li>
              <li><strong>Set Availability:</strong> Configure your business hours and delivery zones</li>
              <li><strong>Manage Orders:</strong> Start receiving and processing customer orders</li>
              <li><strong>Connect Riders:</strong> Set up delivery riders for your store</li>
            </ol>
          </div>

          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">Go to Vendor Dashboard</a>
          </div>

          <p style="margin-top: 30px;">
            <strong>Need Help?</strong><br>
            📧 Email: vendors@afrimercato.com<br>
            📱 Phone: +44 (0) 123 456 7890
          </p>

          <p style="margin-top: 30px;">
            Welcome to the Afrimercato family!<br>
            <strong>The Afrimercato Team</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: `🎉 Your Store "${storeName}" Has Been Approved!`,
    html
  });
};

/**
 * Send vendor rejection email
 */
const sendVendorRejectionEmail = async (vendorEmail, storeName, rejectionReason) => {
  const contactUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .warning-box { background: #ffebee; padding: 20px; border-radius: 5px;
                      margin: 20px 0; border-left: 4px solid #f44336; }
        .button { background: #2196F3; color: white; padding: 12px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Update</h1>
          <p>Regarding ${storeName}</p>
        </div>

        <div class="content">
          <div class="warning-box">
            <h3 style="margin-top: 0;">Application Status: Not Approved</h3>
            <p><strong>Reason:</strong></p>
            <p>${rejectionReason || 'Your application did not meet our verification requirements at this time.'}</p>
          </div>

          <p>We appreciate your interest in joining Afrimercato. Unfortunately, we are unable to approve your vendor application at this time.</p>

          <h3>What Can You Do?</h3>
          <ul>
            <li><strong>Review Requirements:</strong> Check our vendor guidelines and ensure all information is accurate</li>
            <li><strong>Update Information:</strong> You may reapply with updated business details</li>
            <li><strong>Contact Support:</strong> Reach out if you have questions about this decision</li>
          </ul>

          <div style="text-align: center;">
            <a href="${contactUrl}" class="button">Contact Support</a>
          </div>

          <p style="margin-top: 30px;">
            <strong>Support:</strong><br>
            📧 Email: vendors@afrimercato.com<br>
            📱 Phone: +44 (0) 123 456 7890
          </p>

          <p style="margin-top: 30px;">
            Thank you for your understanding,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: `Application Update - ${storeName}`,
    html
  });
};

/**
 * Send vendor request for more information
 */
const sendVendorInfoRequestEmail = async (vendorEmail, storeName, infoNeeded) => {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/login`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .info-box { background: #fff3e0; padding: 20px; border-radius: 5px;
                   margin: 20px 0; border-left: 4px solid #FF9800; }
        .button { background: #FF9800; color: white; padding: 12px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Additional Information Required</h1>
          <p>Action needed for ${storeName}</p>
        </div>

        <div class="content">
          <div class="info-box">
            <h3 style="margin-top: 0;">We Need More Information</h3>
            <p>${infoNeeded || 'Please provide additional information to complete your verification.'}</p>
          </div>

          <p>We're reviewing your vendor application, but we need some additional details to continue.</p>

          <h3>What to Do:</h3>
          <ol>
            <li>Log in to your vendor account</li>
            <li>Update the requested information</li>
            <li>Resubmit for review</li>
          </ol>

          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Update Information</a>
          </div>

          <p style="margin-top: 30px;">
            <strong>Need Help?</strong><br>
            📧 Email: vendors@afrimercato.com
          </p>

          <p style="margin-top: 30px;">
            Best regards,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: `Action Required - ${storeName} Verification`,
    html
  });
};

/**
 * Send vendor suspension email
 */
const sendVendorSuspensionEmail = async (vendorEmail, storeName, suspensionReason) => {
  const contactUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .alert-box { background: #ffebee; padding: 20px; border-radius: 5px;
                    margin: 20px 0; border-left: 4px solid #f44336; }
        .button { background: #f44336; color: white; padding: 12px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Account Suspended</h1>
          <p>${storeName}</p>
        </div>

        <div class="content">
          <div class="alert-box">
            <h3 style="margin-top: 0;">Your Vendor Account Has Been Suspended</h3>
            <p><strong>Reason:</strong></p>
            <p>${suspensionReason || 'Your account has been suspended due to policy violations.'}</p>
          </div>

          <p>Your vendor account has been temporarily suspended. You will not be able to receive new orders during this period.</p>

          <h3>What This Means:</h3>
          <ul>
            <li>Your store is no longer visible to customers</li>
            <li>You cannot receive new orders</li>
            <li>Existing orders must still be fulfilled</li>
          </ul>

          <h3>Next Steps:</h3>
          <p>Please contact our support team to resolve this issue and discuss reactivation.</p>

          <div style="text-align: center;">
            <a href="${contactUrl}" class="button">Contact Support</a>
          </div>

          <p style="margin-top: 30px;">
            <strong>Support:</strong><br>
            📧 Email: vendors@afrimercato.com<br>
            📱 Phone: +44 (0) 123 456 7890
          </p>

          <p style="margin-top: 30px;">
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: `⚠️ Account Suspended - ${storeName}`,
    html
  });
};

/**
 * Send vendor reactivation email
 */
const sendVendorReactivationEmail = async (vendorEmail, storeName) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #2D5F3F 100%);
                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .success-box { background: #e8f5e9; padding: 20px; border-radius: 5px;
                      margin: 20px 0; border-left: 4px solid #4CAF50; }
        .button { background: #4CAF50; color: white; padding: 15px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Account Reactivated!</h1>
          <p>${storeName} is back online</p>
        </div>

        <div class="content">
          <div class="success-box">
            <h3 style="margin-top: 0;">Welcome Back!</h3>
            <p>Your vendor account has been reactivated and your store is now live again.</p>
          </div>

          <p>You can now access your dashboard and start receiving orders again.</p>

          <h3>What's Next:</h3>
          <ul>
            <li>Check your product listings</li>
            <li>Review your business hours</li>
            <li>Update any pending information</li>
            <li>Start accepting orders</li>
          </ul>

          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
          </div>

          <p style="margin-top: 30px;">
            <strong>Support:</strong><br>
            📧 Email: vendors@afrimercato.com
          </p>

          <p style="margin-top: 30px;">
            Great to have you back!<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: `✅ ${storeName} Account Reactivated`,
    html
  });
};

// =================================================================
// PRODUCT APPROVAL/REJECTION EMAILS
// =================================================================

/**
 * Send product approval email
 */
const sendProductApprovalEmail = async (vendorEmail, productName, storeName) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/products`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .success-box { background: #e8f5e9; padding: 15px; border-radius: 5px;
                      margin: 15px 0; border-left: 4px solid #4CAF50; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Product Approved</h1>
        </div>

        <div class="content">
          <p>Hi ${storeName},</p>

          <div class="success-box">
            <p><strong>"${productName}"</strong> has been approved and is now live on Afrimercato!</p>
          </div>

          <p>Customers can now see and purchase this product from your store.</p>

          <p><a href="${dashboardUrl}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Products</a></p>

          <p style="margin-top: 30px;">
            Best regards,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: `Product Approved: ${productName}`,
    html
  });
};

/**
 * Send product rejection email
 */
const sendProductRejectionEmail = async (vendorEmail, productName, storeName, rejectionReason) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/products`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .warning-box { background: #ffebee; padding: 15px; border-radius: 5px;
                      margin: 15px 0; border-left: 4px solid #f44336; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Product Not Approved</h1>
        </div>

        <div class="content">
          <p>Hi ${storeName},</p>

          <div class="warning-box">
            <p><strong>"${productName}"</strong> was not approved.</p>
            <p><strong>Reason:</strong> ${rejectionReason || 'Does not meet our quality standards'}</p>
          </div>

          <p>Please update the product details and resubmit for review.</p>

          <p><a href="${dashboardUrl}" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Edit Product</a></p>

          <p style="margin-top: 30px;">
            Best regards,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: `Product Needs Revision: ${productName}`,
    html
  });
};

// =================================================================
// RIDER NOTIFICATION EMAILS
// =================================================================

/**
 * Send rider approval email
 */
const sendRiderApprovalEmail = async (riderEmail, riderName, storeName) => {
  const riderDashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rider/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #2D5F3F 100%);
                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .success-box { background: #e8f5e9; padding: 20px; border-radius: 5px;
                      margin: 20px 0; border-left: 4px solid #4CAF50; }
        .button { background: #4CAF50; color: white; padding: 12px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Connection Approved!</h1>
          <p>You're now connected with ${storeName}</p>
        </div>

        <div class="content">
          <p>Hi ${riderName},</p>

          <div class="success-box">
            <h3 style="margin-top: 0;">✅ Great News!</h3>
            <p>Your connection request with <strong>${storeName}</strong> has been approved!</p>
          </div>

          <p>You can now receive delivery requests from this vendor.</p>

          <h3>What's Next:</h3>
          <ul>
            <li>Log in to your rider dashboard</li>
            <li>Set your availability status</li>
            <li>Start receiving delivery requests</li>
          </ul>

          <div style="text-align: center;">
            <a href="${riderDashboardUrl}" class="button">Go to Dashboard</a>
          </div>

          <p style="margin-top: 30px;">
            Best regards,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: riderEmail,
    subject: `✅ Connection Approved with ${storeName}`,
    html
  });
};

/**
 * Send rider rejection email
 */
const sendRiderRejectionEmail = async (riderEmail, riderName, storeName, rejectionReason) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .warning-box { background: #ffebee; padding: 15px; border-radius: 5px;
                      margin: 15px 0; border-left: 4px solid #f44336; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Connection Request Update</h1>
        </div>

        <div class="content">
          <p>Hi ${riderName},</p>

          <div class="warning-box">
            <p>Your connection request with <strong>${storeName}</strong> was not approved at this time.</p>
            ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
          </div>

          <p>You can continue working with other vendors on the platform.</p>

          <p style="margin-top: 30px;">
            Best regards,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: riderEmail,
    subject: `Connection Update - ${storeName}`,
    html
  });
};

/**
 * Send rider removal notification
 */
const sendRiderRemovalEmail = async (riderEmail, riderName, storeName, removalReason) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .alert-box { background: #ffebee; padding: 15px; border-radius: 5px;
                    margin: 15px 0; border-left: 4px solid #f44336; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Connection Removed</h1>
        </div>

        <div class="content">
          <p>Hi ${riderName},</p>

          <div class="alert-box">
            <p>Your connection with <strong>${storeName}</strong> has been removed.</p>
            ${removalReason ? `<p><strong>Reason:</strong> ${removalReason}</p>` : ''}
          </div>

          <p>You will no longer receive delivery requests from this vendor.</p>

          <p>If you believe this is an error, please contact support.</p>

          <p style="margin-top: 30px;">
            Best regards,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: riderEmail,
    subject: `Connection Removed - ${storeName}`,
    html
  });
};

/**
 * Send vendor notification about new rider connection request
 */
const sendVendorRiderRequestEmail = async (vendorEmail, storeName, riderName) => {
  const vendorDashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/riders`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .info-box { background: #e3f2fd; padding: 15px; border-radius: 5px;
                   margin: 15px 0; border-left: 4px solid #2196F3; }
        .button { background: #2196F3; color: white; padding: 12px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚴 New Rider Connection Request</h1>
        </div>

        <div class="content">
          <p>Hi ${storeName},</p>

          <div class="info-box">
            <p><strong>${riderName}</strong> has requested to connect with your store for deliveries.</p>
          </div>

          <p>Please review their profile and approve or reject the request.</p>

          <div style="text-align: center;">
            <a href="${vendorDashboardUrl}" class="button">Review Request</a>
          </div>

          <p style="margin-top: 30px;">
            Best regards,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: `New Rider Request from ${riderName}`,
    html
  });
};

// =================================================================
// PAYMENT & ORDER EMAILS
// =================================================================

/**
 * Send customer payment failure notification
 */
const sendPaymentFailureEmail = async (customerEmail, customerName, orderNumber) => {
  const ordersUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/orders`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .alert-box { background: #ffebee; padding: 15px; border-radius: 5px;
                    margin: 15px 0; border-left: 4px solid #f44336; }
        .button { background: #f44336; color: white; padding: 12px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Payment Failed</h1>
        </div>

        <div class="content">
          <p>Hi ${customerName},</p>

          <div class="alert-box">
            <p>Unfortunately, the payment for your order <strong>#${orderNumber}</strong> could not be processed.</p>
          </div>

          <p>This could be due to:</p>
          <ul>
            <li>Insufficient funds</li>
            <li>Card declined by your bank</li>
            <li>Incorrect payment details</li>
            <li>Technical issues</li>
          </ul>

          <p>Please try again with a different payment method or contact your bank for assistance.</p>

          <div style="text-align: center;">
            <a href="${ordersUrl}" class="button">Retry Payment</a>
          </div>

          <p style="margin-top: 30px;">
            If you need help, contact: support@afrimercato.com
          </p>

          <p style="margin-top: 30px;">
            Best regards,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Payment Failed - Order #${orderNumber}`,
    html
  });
};

// =================================================================
// GDPR & PASSWORD RESET EMAILS
// =================================================================

/**
 * Send GDPR data deletion confirmation email
 */
const sendGDPRConfirmationEmail = async (userEmail, userName, cancellationToken) => {
  const cancellationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel-deletion/${cancellationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .warning-box { background: #ffebee; padding: 20px; border-radius: 5px;
                      margin: 20px 0; border-left: 4px solid #f44336; }
        .button { background: #2196F3; color: white; padding: 12px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Data Deletion Request Received</h1>
        </div>

        <div class="content">
          <p>Hi ${userName},</p>

          <div class="warning-box">
            <p><strong>Your account data will be permanently deleted in 30 days.</strong></p>
            <p>This action cannot be undone after the 30-day period.</p>
          </div>

          <h3>What Will Be Deleted:</h3>
          <ul>
            <li>Your account information</li>
            <li>Order history</li>
            <li>Saved addresses</li>
            <li>Personal preferences</li>
          </ul>

          <h3>Changed Your Mind?</h3>
          <p>You can cancel this deletion request within the next 30 days by clicking the button below:</p>

          <div style="text-align: center;">
            <a href="${cancellationUrl}" class="button">Cancel Deletion</a>
          </div>

          <p style="margin-top: 30px;">
            <small>If you didn't request this deletion, please click the cancel button immediately and contact support.</small>
          </p>

          <p style="margin-top: 30px;">
            Best regards,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `⚠️ Account Deletion Request - Action Required`,
    html
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .info-box { background: #e3f2fd; padding: 20px; border-radius: 5px;
                   margin: 20px 0; border-left: 4px solid #2196F3; }
        .button { background: #2196F3; color: white; padding: 15px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block;
                 margin: 15px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>

        <div class="content">
          <p>Hi ${userName},</p>

          <p>We received a request to reset your password for your Afrimercato account.</p>

          <div class="info-box">
            <p><strong>Click the button below to reset your password:</strong></p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>

            <p style="margin-top: 15px;"><small>Or copy this link: ${resetUrl}</small></p>

            <p style="margin-top: 15px;"><strong>⏰ This link expires in 1 hour.</strong></p>
          </div>

          <p><strong>Didn't request this?</strong></p>
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

          <p style="margin-top: 30px;">
            Best regards,<br>
            The Afrimercato Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Password Reset Request - Afrimercato`,
    html
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendWelcomeEmail,
  sendVendorWelcomeEmail,
  sendVendorProfileSubmittedEmail,
  sendAdminVendorNotification,
  // Vendor approval/rejection
  sendVendorApprovalEmail,
  sendVendorRejectionEmail,
  sendVendorInfoRequestEmail,
  sendVendorSuspensionEmail,
  sendVendorReactivationEmail,
  // Product approval/rejection
  sendProductApprovalEmail,
  sendProductRejectionEmail,
  // Rider notifications
  sendRiderApprovalEmail,
  sendRiderRejectionEmail,
  sendRiderRemovalEmail,
  sendVendorRiderRequestEmail,
  // Payment & orders
  sendPaymentFailureEmail,
  // GDPR & auth
  sendGDPRConfirmationEmail,
  sendPasswordResetEmail
};
