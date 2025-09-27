const nodemailer = require('nodemailer');
// Use dynamic import for node-fetch v3 in CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Config
const useResend = !!process.env.RESEND_API_KEY; // Recommended on platforms that block SMTP
const useSmtp = !!process.env.SMTP_HOST; // Explicit SMTP
const useGmail = !useResend && !useSmtp; // Fallback to Gmail creds if provided
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_EMAIL;

// Create nodemailer transporter only if using SMTP/Gmail
let transporter = null;
if (!useResend) {
  transporter = nodemailer.createTransport(
    useSmtp
      ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false, // STARTTLS
          auth: {
            user: process.env.EMAIL_USER || process.env.SMTP_EMAIL,
            pass: process.env.EMAIL_PASS || process.env.SMTP_PASSWORD,
          },
          // Keep aggressive timeouts to avoid 4-6 minute hangs
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
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
        }
  );

  // On boot, verify transporter (skip if Resend is configured)
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

async function sendViaResend(to, subject, html) {
  if (!useResend) throw new Error('Resend not configured');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
      signal: controller.signal
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Resend API error: ${res.status} ${text}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function sendViaNodemailer(to, subject, html) {
  if (!transporter) throw new Error('Email transporter not configured');
  const mailOptions = {
    from: `SmartCart <${EMAIL_FROM}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
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

  // Prefer Resend API if configured; else fall back to Nodemailer
  if (useResend) {
    await sendViaResend(to, subject, html);
    return;
  }
  await sendViaNodemailer(to, subject, html);
}

module.exports = {
  sendVerificationEmail,
};
