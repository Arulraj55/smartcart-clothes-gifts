// Quick debug test for registration
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { sendVerificationEmail } = require('./utils/emailService');

const testRegistration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');
    
    // Create a test user
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123'
    };
    
    console.log('Testing user creation...');
    const user = new User(testUser);
    
    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    console.log('✓ Verification token generated');
    
    // Test email sending
    console.log('Testing email sending...');
    await sendVerificationEmail(user, verificationToken);
    console.log('✓ Email sent successfully!');
    
    // Clean up - don't save the test user
    console.log('✓ Test completed successfully');
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testRegistration();
