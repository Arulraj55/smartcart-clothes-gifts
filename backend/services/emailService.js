const nodemailer = require('nodemailer');

// Prefer explicit SMTP settings if provided; otherwise fall back to Gmail service
const useSmtp = !!process.env.SMTP_HOST;
const transporter = nodemailer.createTransport(
  useSmtp
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false, // STARTTLS
        auth: {
          user: process.env.EMAIL_USER || process.env.SMTP_EMAIL,
          pass: process.env.EMAIL_PASS || process.env.SMTP_PASSWORD,
        },
      }
    : {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
);

// On boot, verify transporter so we can see config issues early
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

async function sendVerificationEmail(to, verifyUrl) {
  const mailOptions = {
    from: `SmartCart <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your SmartCart email',
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:16px">
        <h2>Verify your email</h2>
        <p>Thanks for signing up for SmartCart. Please verify your email to complete registration.</p>
        <p><a href="${verifyUrl}" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Verify Email</a></p>
        <p>Or copy this link into your browser:</p>
        <p style="word-break:break-all">${verifyUrl}</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendVerificationEmail,
};
