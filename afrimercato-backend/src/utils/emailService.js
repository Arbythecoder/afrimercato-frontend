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
  sendWelcomeEmail
};
