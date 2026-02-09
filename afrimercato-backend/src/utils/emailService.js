// =================================================================
// EMAIL SERVICE - Send transactional emails
// =================================================================
// Simple email service for verification, password reset, etc.
// In production, integrate with SendGrid, AWS SES, or similar

/**
 * Send verification email
 * @param {String} email - Recipient email
 * @param {String} token - Verification token
 * @param {String} firstName - User's first name
 */
const sendVerificationEmail = async (email, token, firstName = 'User') => {
  const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;

  console.log('\n==============================================');
  console.log('📧 EMAIL VERIFICATION');
  console.log('==============================================');
  console.log(`To: ${email}`);
  console.log(`Name: ${firstName}`);
  console.log(`Verification Link: ${verificationLink}`);
  console.log('==============================================\n');

  // TODO: In production, integrate with email provider
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: email,
  //   from: 'noreply@afrimercato.com',
  //   subject: 'Verify Your Email - Afrimercato',
  //   html: `<p>Hi ${firstName},</p>
  //          <p>Please verify your email by clicking: <a href="${verificationLink}">Verify Email</a></p>`
  // });

  return {
    success: true,
    message: 'Email sent (development mode - check console)',
    verificationLink: process.env.NODE_ENV === 'development' ? verificationLink : undefined
  };
};

/**
 * Send password reset email
 * @param {String} email - Recipient email
 * @param {String} token - Reset token
 * @param {String} firstName - User's first name
 */
const sendPasswordResetEmail = async (email, token, firstName = 'User') => {
  const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  console.log('\n==============================================');
  console.log('🔐 PASSWORD RESET');
  console.log('==============================================');
  console.log(`To: ${email}`);
  console.log(`Name: ${firstName}`);
  console.log(`Reset Link: ${resetLink}`);
  console.log('==============================================\n');

  return {
    success: true,
    message: 'Reset email sent (development mode - check console)',
    resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
  };
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
