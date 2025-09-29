const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email verification
const sendVerificationEmail = async (user, token) => {
  try {
    const transporter = createTransporter();
    
    // Test the connection
    await transporter.verify();
    console.log('✓ Email service connected successfully');
    
    const verificationUrl = `${process.env.FRONTEND_URL}/?verify=${token}`;
    
    const mailOptions = {
      from: {
        name: 'Token Verification System',
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: 'Email Verification Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Thank you for registering with us! To complete your registration, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
              <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
            
            <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>© 2025 Token Verification System. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Verification email sent successfully to:', user.email);
    return result;
  } catch (error) {
    console.error('✗ Email sending failed:', error.message);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  try {
    const transporter = createTransporter();
    
    // Test the connection
    await transporter.verify();
    console.log('✓ Email service connected successfully');
    
    const resetUrl = `${process.env.FRONTEND_URL}/?reset=${token}`;
    
    const mailOptions = {
      from: {
        name: 'Token Verification System',
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>We received a request to reset your password. Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
            
            <p><strong>Note:</strong> This reset link will expire in 10 minutes.</p>
            
            <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>© 2025 Token Verification System. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Password reset email sent successfully to:', user.email);
    return result;
  } catch (error) {
    console.error('✗ Password reset email sending failed:', error.message);
    throw error;
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Token Verification System',
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: 'Welcome! Your Account is Verified',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745; text-align: center;">Welcome to Our Platform!</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>🎉 Congratulations! Your email has been successfully verified and your account is now active.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Access your dashboard</li>
              <li>Use all platform features</li>
              <li>Manage your profile</li>
              <li>Receive important notifications</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            
            <p>Thank you for joining us! We're excited to have you on board.</p>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>© 2025 Token Verification System. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Welcome email sent successfully to:', user.email);
    return result;
  } catch (error) {
    console.error('✗ Welcome email sending failed:', error.message);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
