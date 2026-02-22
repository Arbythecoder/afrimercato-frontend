// =================================================================
// EMAIL SERVICE — Brevo (Sendinblue) SMTP via Nodemailer
// =================================================================
const nodemailer = require('nodemailer');

// Single reusable transporter (Brevo SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // TLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM = `"Afrimercato" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`;

// App uses HashRouter — links must include /#/ so the browser loads
// index.html and React Router picks up the hash path correctly.
const buildLink = (path, query) => {
  const base = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${base}/#/${path}?${query}`;
};

// =================================================================
// SEND VERIFICATION EMAIL
// =================================================================
const sendVerificationEmail = async (email, token, firstName = 'User') => {
  const verificationLink = buildLink('verify-email', `token=${token}`);

  console.log(`[email] Sending verification to ${email} → ${verificationLink}`);

  const html = `
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

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'Verify your email — Afrimercato',
      html,
    });
    console.log(`[email] Verification email delivered to ${email}`);
    return { success: true, message: 'Verification email sent' };
  } catch (err) {
    console.error('[email] Failed to send verification email:', err.message);
    // Don't throw — registration should still succeed even if email fails
    return { success: false, message: err.message };
  }
};

// =================================================================
// SEND PASSWORD RESET EMAIL
// =================================================================
const sendPasswordResetEmail = async (email, token, firstName = 'User') => {
  const resetLink = buildLink('reset-password', `token=${token}`);

  console.log(`[email] Sending password reset to ${email} → ${resetLink}`);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#00897B;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Afrimercato</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
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
          </td>
        </tr>
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

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'Reset your password — Afrimercato',
      html,
    });
    console.log(`[email] Password reset email delivered to ${email}`);
    return { success: true, message: 'Password reset email sent' };
  } catch (err) {
    console.error('[email] Failed to send password reset email:', err.message);
    return { success: false, message: err.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
