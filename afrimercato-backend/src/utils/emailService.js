// =================================================================
// EMAIL SERVICE — Gmail SMTP via Nodemailer
// =================================================================
const nodemailer = require('nodemailer');

// Single reusable transporter (Gmail SMTP with App Password)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS on port 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `"Afrimercato" <${process.env.GMAIL_USER}>`;

// Verify SMTP connection at startup
transporter.verify((err) => {
  if (err) {
    console.error('[email] SMTP connection FAILED:', err.message, '— emails will not send until fixed');
  } else {
    console.log('[email] SMTP connection OK — ready to send');
  }
});

// App uses HashRouter — links must include /#/ so the browser loads
// index.html and React Router picks up the hash path correctly.
const buildLink = (path, query) => {
  const base = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  return query ? `${base}/#/${path}?${query}` : `${base}/#/${path}`;
};

// =================================================================
// SHARED TEMPLATE HELPERS
// =================================================================

const emailWrap = (bodyHtml) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#00897B;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Afrimercato</h1>
            <p style="margin:8px 0 0;color:#b2dfdb;font-size:14px;">African Groceries Delivered to Your Door</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${bodyHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:13px;">© 2026 Afrimercato. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const itemsTable = (items = []) => {
  if (!items || items.length === 0) return '';
  const rows = items.map(item => {
    const name = item.name || item.productName || 'Product';
    const qty = item.quantity || 1;
    const price = ((item.price || 0) * qty).toFixed(2);
    return `<tr>
      <td style="padding:8px 0;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6;">${name}</td>
      <td style="padding:8px 0;color:#374151;font-size:14px;text-align:center;border-bottom:1px solid #f3f4f6;">x${qty}</td>
      <td style="padding:8px 0;color:#374151;font-size:14px;text-align:right;border-bottom:1px solid #f3f4f6;">£${price}</td>
    </tr>`;
  }).join('');
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr>
      <th style="text-align:left;padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Item</th>
      <th style="text-align:center;padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Qty</th>
      <th style="text-align:right;padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Total</th>
    </tr>
    ${rows}
  </table>`;
};

// Human-readable status labels
const STATUS_LABELS = {
  confirmed: 'Order Confirmed',
  preparing: 'Being Prepared',
  ready: 'Ready for Collection',
  'out-for-delivery': 'Out for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered!',
  cancelled: 'Cancelled',
  rider_accepted: 'Rider Assigned',
  picked_up_by_rider: 'Out for Delivery',
};

const STATUS_MESSAGES = {
  confirmed: 'Great news! Your order has been confirmed and will be prepared shortly.',
  preparing: 'Your order is now being prepared by the vendor. It will be ready for dispatch soon.',
  ready: 'Your order is packed and ready! A rider will collect it shortly.',
  'out-for-delivery': 'Your rider is on the way with your order. Get ready!',
  out_for_delivery: 'Your rider is on the way with your order. Get ready!',
  delivered: 'Your order has been delivered. We hope you enjoy it!',
  cancelled: 'Unfortunately your order has been cancelled. If payment was taken, a refund will be processed.',
  rider_accepted: 'A rider has been assigned to your order and will collect it shortly.',
  picked_up_by_rider: 'Your rider has collected your order and is heading to you.',
};

// =================================================================
// SEND VERIFICATION EMAIL
// =================================================================
const sendVerificationEmail = async (email, token, firstName = 'User') => {
  const verificationLink = buildLink('verify-email', `token=${token}`);

  console.log(`[email] Sending verification to ${email} → ${verificationLink}`);

  const html = emailWrap(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Hi ${firstName},</h2>
    <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
      Welcome to Afrimercato! Please verify your email address to activate your account and start using all features.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${verificationLink}"
         style="display:inline-block;background:#00897B;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;">
        Verify My Email
      </a>
    </div>
    <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
      Or copy and paste this link into your browser:<br>
      <a href="${verificationLink}" style="color:#00897B;word-break:break-all;">${verificationLink}</a>
    </p>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">
      This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
    </p>
  `);

  try {
    await transporter.sendMail({ from: FROM, to: email, subject: 'Verify your email — Afrimercato', html });
    console.log(`[email] Verification email delivered to ${email}`);
    return { success: true, message: 'Verification email sent' };
  } catch (err) {
    console.error('[email] Failed to send verification email:', err.message);
    return { success: false, message: err.message };
  }
};

// =================================================================
// SEND PASSWORD RESET EMAIL
// =================================================================
const sendPasswordResetEmail = async (email, token, firstName = 'User') => {
  const resetLink = buildLink('reset-password', `token=${token}`);

  console.log(`[email] Sending password reset to ${email} → ${resetLink}`);

  const html = emailWrap(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Hi ${firstName},</h2>
    <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
      We received a request to reset your password. Click the button below to choose a new password.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetLink}"
         style="display:inline-block;background:#00897B;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;">
        Reset My Password
      </a>
    </div>
    <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
      Or copy and paste this link:<br>
      <a href="${resetLink}" style="color:#00897B;word-break:break-all;">${resetLink}</a>
    </p>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">
      This link expires in 1 hour. If you did not request a password reset, ignore this email — your account is safe.
    </p>
  `);

  try {
    await transporter.sendMail({ from: FROM, to: email, subject: 'Reset your password — Afrimercato', html });
    console.log(`[email] Password reset email delivered to ${email}`);
    return { success: true, message: 'Password reset email sent' };
  } catch (err) {
    console.error('[email] Failed to send password reset email:', err.message);
    return { success: false, message: err.message };
  }
};

// =================================================================
// SEND ORDER CONFIRMATION EMAIL (customer — order placed)
// =================================================================
// customer: { email, firstName }
// order:    { orderNumber, items, totalAmount, deliveryAddress, deliveryAddressDetails }
const sendOrderConfirmationEmail = async (customer, order) => {
  const firstName = customer.firstName || customer.name || 'Customer';
  const email = customer.email;
  if (!email) return { success: false, message: 'No customer email' };

  const orderLink = buildLink(`orders/${order._id || ''}`, '');
  const address = order.deliveryAddressDetails
    ? `${order.deliveryAddressDetails.street || ''}, ${order.deliveryAddressDetails.city || ''} ${order.deliveryAddressDetails.postcode || ''}`.trim().replace(/^,\s*/, '')
    : (order.deliveryAddress || 'Your saved address');

  const html = emailWrap(`
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Hi ${firstName},</h2>
    <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
      Thank you for your order! We've received it and will get started as soon as possible.
    </p>

    <!-- Order summary box -->
    <div style="background:#f0faf8;border:1px solid #b2dfdb;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Order Number</p>
      <p style="margin:0;color:#00897B;font-size:22px;font-weight:700;">${order.orderNumber || '—'}</p>
    </div>

    <!-- Items -->
    ${itemsTable(order.items)}

    <!-- Total -->
    <div style="text-align:right;margin:16px 0 24px;">
      <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">
        Total: £${(order.totalAmount || 0).toFixed(2)}
      </p>
    </div>

    <!-- Delivery address -->
    <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;">Delivery Address</p>
      <p style="margin:0;color:#374151;font-size:14px;">${address}</p>
    </div>

    <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.6;">
      We'll send you updates as your order progresses. Estimated delivery: <strong>30–60 min</strong> (same-day orders).
    </p>

    <div style="text-align:center;">
      <a href="${orderLink}"
         style="display:inline-block;background:#00897B;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;">
        Track My Order
      </a>
    </div>
  `);

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `Order confirmed #${order.orderNumber || ''} — Afrimercato`,
      html,
    });
    console.log(`[email] Order confirmation sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.error('[email] Failed to send order confirmation:', err.message);
    return { success: false, message: err.message };
  }
};

// =================================================================
// SEND ORDER STATUS UPDATE EMAIL (customer — status changed)
// =================================================================
// customer:  { email, firstName }
// order:     { orderNumber, _id }
// newStatus: string — one of the order status enum values
const sendOrderStatusEmail = async (customer, order, newStatus) => {
  const firstName = customer.firstName || customer.name || 'Customer';
  const email = customer.email;
  if (!email) return { success: false, message: 'No customer email' };

  const label = STATUS_LABELS[newStatus] || newStatus;
  const message = STATUS_MESSAGES[newStatus] || `Your order status has been updated to: ${newStatus}.`;
  const orderLink = buildLink(`orders/${order._id || ''}`, '');

  // Status icon + colour
  const isDelivered = newStatus === 'delivered';
  const isCancelled = newStatus === 'cancelled';
  const accentColor = isCancelled ? '#ef4444' : '#00897B';
  const statusIcon = isDelivered ? '🎉' : isCancelled ? '❌' : '📦';

  const html = emailWrap(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Hi ${firstName},</h2>

    <!-- Status badge -->
    <div style="background:${accentColor}15;border-left:4px solid ${accentColor};border-radius:4px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0;color:${accentColor};font-size:18px;font-weight:700;">${statusIcon} ${label}</p>
      <p style="margin:8px 0 0;color:#374151;font-size:14px;">${message}</p>
    </div>

    <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Order number:</p>
    <p style="margin:0 0 24px;color:#111827;font-size:18px;font-weight:700;">#${order.orderNumber || '—'}</p>

    ${!isCancelled ? `<div style="text-align:center;">
      <a href="${orderLink}"
         style="display:inline-block;background:#00897B;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;">
        View Order
      </a>
    </div>` : ''}
  `);

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `${statusIcon} ${label} — Order #${order.orderNumber || ''} — Afrimercato`,
      html,
    });
    console.log(`[email] Status email (${newStatus}) sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.error(`[email] Failed to send status email (${newStatus}):`, err.message);
    return { success: false, message: err.message };
  }
};

// =================================================================
// SEND NEW ORDER EMAIL (vendor — a customer placed an order)
// =================================================================
// vendor: { email, storeName }
// order:  { orderNumber, items, totalAmount, deliveryAddress }
const sendNewOrderEmail = async (vendor, order) => {
  const email = vendor.email;
  if (!email) return { success: false, message: 'No vendor email' };
  const storeName = vendor.storeName || 'Your store';

  const dashboardLink = buildLink('vendor/orders', '');

  const html = emailWrap(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">New Order Received!</h2>
    <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
      Hi ${storeName}, you have a new order waiting to be confirmed.
    </p>

    <!-- Order number -->
    <div style="background:#f0faf8;border:1px solid #b2dfdb;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Order Number</p>
      <p style="margin:0;color:#00897B;font-size:22px;font-weight:700;">${order.orderNumber || '—'}</p>
    </div>

    <!-- Items -->
    ${itemsTable(order.items)}

    <!-- Total -->
    <div style="text-align:right;margin:16px 0 24px;">
      <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">
        Order Total: £${(order.totalAmount || 0).toFixed(2)}
      </p>
    </div>

    <!-- Delivery address -->
    <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;">Deliver To</p>
      <p style="margin:0;color:#374151;font-size:14px;">${order.deliveryAddress || 'See dashboard for details'}</p>
    </div>

    <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.6;">
      Please confirm and begin preparing this order as soon as possible.
    </p>

    <div style="text-align:center;">
      <a href="${dashboardLink}"
         style="display:inline-block;background:#00897B;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;">
        Go to Dashboard
      </a>
    </div>
  `);

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `New order #${order.orderNumber || ''} — Action required`,
      html,
    });
    console.log(`[email] New order notification sent to vendor ${email}`);
    return { success: true };
  } catch (err) {
    console.error('[email] Failed to send new order notification to vendor:', err.message);
    return { success: false, message: err.message };
  }
};

// =================================================================
// SEND RIDER ASSIGNED EMAIL (customer — rider is on the way)
// =================================================================
// customer: { email, firstName }
// order:    { orderNumber, _id }
// rider:    { name, phone }
const sendRiderAssignedEmail = async (customer, order, rider) => {
  const firstName = customer.firstName || customer.name || 'Customer';
  const email = customer.email;
  if (!email) return { success: false, message: 'No customer email' };

  const riderName = rider.firstName ? `${rider.firstName} ${rider.lastName || ''}`.trim() : (rider.name || 'Your rider');
  const riderPhone = rider.phone || null;
  const orderLink = buildLink(`orders/${order._id || ''}`, '');

  const html = emailWrap(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Hi ${firstName},</h2>
    <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
      Great news — a rider has been assigned to your order and will collect it shortly!
    </p>

    <!-- Rider card -->
    <div style="background:#f0faf8;border:1px solid #b2dfdb;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;">Your Rider</p>
      <p style="margin:0 0 4px;color:#111827;font-size:18px;font-weight:700;">🛵 ${riderName}</p>
      ${riderPhone ? `<p style="margin:4px 0 0;color:#374151;font-size:14px;">📞 ${riderPhone}</p>` : ''}
    </div>

    <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Order number:</p>
    <p style="margin:0 0 24px;color:#111827;font-size:18px;font-weight:700;">#${order.orderNumber || '—'}</p>

    <div style="text-align:center;">
      <a href="${orderLink}"
         style="display:inline-block;background:#00897B;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;">
        Track My Order
      </a>
    </div>
  `);

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `🛵 Rider assigned — Order #${order.orderNumber || ''} — Afrimercato`,
      html,
    });
    console.log(`[email] Rider assigned email sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.error('[email] Failed to send rider assigned email:', err.message);
    return { success: false, message: err.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendNewOrderEmail,
  sendRiderAssignedEmail,
};
