
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

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendWelcomeEmail,
  sendVendorWelcomeEmail,
  sendVendorProfileSubmittedEmail,
  sendAdminVendorNotification
};
