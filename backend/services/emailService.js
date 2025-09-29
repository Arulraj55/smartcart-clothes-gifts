const nodemailer = require('nodemailer');
let sgMail = null;
const hasSendgrid = !!process.env.SENDGRID_API_KEY;
if (hasSendgrid) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } catch (e) {
    console.error('SendGrid module not installed; falling back to SMTP/Gmail:', e.message);
  }
}

// Determine transport: explicit SMTP if provided, otherwise Gmail service
const useSmtp = !!process.env.SMTP_HOST;
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_EMAIL;

// Only construct nodemailer transporter when not using SendGrid
let transporter = null;
if (!hasSendgrid || !sgMail) {
  transporter = nodemailer.createTransport(
    useSmtp
      ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT || 587) === 465,
          auth: {
            user: process.env.EMAIL_USER || process.env.SMTP_EMAIL,
            pass: process.env.EMAIL_PASS || process.env.SMTP_PASSWORD,
          },
          // Keep aggressive timeouts to avoid 4-6 minute hangs
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
          // Match token-email-verification defaults
          tls: { rejectUnauthorized: false },
        }
      : {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
          tls: { rejectUnauthorized: false },
        }
  );
}

// On boot, verify transporter
if (hasSendgrid && sgMail) {
  console.log('✉️  Email provider ready via SendGrid API');
} else if (transporter) {
  transporter
    .verify()
    .then(() => {
      console.log(
        `✉️  Email transporter ready via ${useSmtp ? 'SMTP' : 'Gmail'} as ${
          (process.env.EMAIL_USER || process.env.SMTP_EMAIL || '').split('@')[0]
        }@***`
      );
    })
    .catch((err) => {
      console.error('✉️  Email transporter verification failed:', err.message);
    });
}

function getEmailProviderInfo() {
  return {
    provider: useSmtp ? 'smtp' : 'gmail',
    from: EMAIL_FROM || '',
  };
}

async function sendViaNodemailer(to, subject, html) {
  const fromValue = /<.+@.+>/.test(EMAIL_FROM || '') || /.+@.+\..+/.test(EMAIL_FROM || '')
    ? EMAIL_FROM
    : process.env.EMAIL_USER;
  const mailOptions = {
    from: fromValue,
    to,
    subject,
    html,
  };
  const maskedTo = Array.isArray(to) ? to.map(maskEmail).join(',') : maskEmail(String(to || ''));
  console.log(`✉️  [Email] Sending to ${maskedTo} • subject="${subject}"`);
  try {
    if (hasSendgrid && sgMail) {
      const [result] = await sgMail.send({
        from: fromValue,
        to,
        subject,
        html,
      });
      const msgId = (result && result.headers && result.headers['x-message-id']) || 'sent';
      console.log(`✅ [Email] Sent to ${maskedTo} • id=${msgId}`);
      return result;
    }
    const result = await transporter.sendMail(mailOptions);
    const msgId = result && (result.messageId || result.response || 'sent');
    console.log(`✅ [Email] Sent to ${maskedTo} • id=${msgId}`);
    return result;
  } catch (err) {
    console.error(`❌ [Email] Failed to send to ${maskedTo}: ${err.message}`);
    throw err;
  }
}

async function sendVerificationEmail(to, verifyUrl) {
  const subject = 'Verify your SmartCart email';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:16px">
      <h2>Verify your email</h2>
      <p>Thanks for signing up for SmartCart. Please verify your email to complete registration.</p>
      <p><a href="${verifyUrl}" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Verify Email</a></p>
      <p>Or copy this link into your browser:</p>
      <p style="word-break:break-all">${verifyUrl}</p>
    </div>
  `;

  await sendViaNodemailer(to, subject, html);
}

module.exports = {
  sendVerificationEmail,
  getEmailProviderInfo,
};

// Helpers
function maskEmail(email) {
  try {
    const [user, domain] = email.split('@');
    if (!user || !domain) return '***@***';
    const u = user.length <= 2 ? user[0] + '*' : user[0] + '***' + user[user.length - 1];
    return `${u}@${domain}`;
  } catch {
    return '***@***';
  }
}
