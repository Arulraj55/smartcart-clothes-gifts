// Test email service
require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmailService = async () => {
  try {
    console.log('Testing email service...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Test the connection
    await transporter.verify();
    console.log('✓ Email service connected successfully!');
    
    // Send a test email
    const mailOptions = {
      from: {
        name: 'Test Email Service',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - Service Working!',
      html: `
        <h2>Email Service Test</h2>
        <p>This is a test email to verify that the email service is working correctly.</p>
        <p>If you received this email, the service is configured properly!</p>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('✗ Email service test failed:', error.message);
    console.error('Error details:', error);
  }
};

testEmailService();
