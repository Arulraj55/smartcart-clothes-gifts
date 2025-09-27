const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RegistrationToken = require('../models/RegistrationToken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');
const { auth } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
// Helper: kick off email sending in background (non-blocking)
function startEmailSend(normalizedEmail, verifyUrl, apiVerifyUrl) {
  (async () => {
    try {
      await sendVerificationEmail(normalizedEmail, verifyUrl);
    } catch (e1) {
      console.error('sendVerificationEmail failed (pre-registration). Trying API link fallback:', e1.message);
      try {
        await sendVerificationEmail(normalizedEmail, apiVerifyUrl);
      } catch (e2) {
        console.error('Fallback sendVerificationEmail also failed:', e2.message);
      }
    }
  })();
}

router.post('/register', async (req, res) => {
  try {
  const { name, email, password } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();
    // If a fully-verified user already exists, block
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // If an unverified legacy user exists, we won't create a second User.
    // We'll still proceed with token-based flow and overwrite their password upon verification.

    // Hash the password now and store in a registration token document
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Upsert a single active registration token per email
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await RegistrationToken.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, name, passwordHash, tokenHash, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Build verify URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;
  const apiBase = process.env.API_BASE_URL || process.env.API_base_URL || 'http://localhost:5000';
  const apiVerifyUrl = `${apiBase}/api/auth/verify-email?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Fire-and-forget email send (do not block the response)
    startEmailSend(normalizedEmail, verifyUrl, apiVerifyUrl);

    // 202 Accepted clearly communicates “pending verification”
    const exposeDev = String(process.env.EXPOSE_DEV_VERIFY_LINK || '').toLowerCase() === 'true';
    const isProd = (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production');
    const devPayload = (!isProd || exposeDev) ? { devVerifyUrl: verifyUrl } : {};
    res.status(202).json({
      success: true,
      message: 'We sent (or are sending) a verification email. Please check your inbox.',
      pendingVerification: true,
      ...devPayload
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
  const { email, password } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      // If there's a pending pre-registration, resend verification email and instruct verification
      const pending = await RegistrationToken.findOne({ email: normalizedEmail, expiresAt: { $gt: new Date() } });
      if (pending) {
        const plainToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
        await RegistrationToken.updateOne({ _id: pending._id }, { $set: { tokenHash, expiresAt } });
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verifyUrl = `${baseUrl}/verify-email?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;
  const apiBase = process.env.API_BASE_URL || process.env.API_base_URL || 'http://localhost:5000';
  const apiVerifyUrl = `${apiBase}/api/auth/verify-email?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;
        console.log('Login pending verification link:', verifyUrl);
        // Background resend (non-blocking)
        startEmailSend(normalizedEmail, verifyUrl, apiVerifyUrl);
        const exposeDev = String(process.env.EXPOSE_DEV_VERIFY_LINK || '').toLowerCase() === 'true';
        const isProd = (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production');
        const devPayload = (!isProd || exposeDev) ? { devVerifyUrl: verifyUrl } : {};
        return res.status(403).json({ success: false, message: 'Registration pending. We sent you a fresh verification link.', pendingVerification: true, ...devPayload });
      }
      // No user and no pending registration: instruct to register (do not send any email)
      return res.status(404).json({ success: false, message: 'No account found for this email. Please register first.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isEmailVerified) {
      // Legacy unverified user - issue a new token and send verification email
      const plainToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = crypto.createHash('sha256').update(plainToken).digest('hex');
      user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
      await user.save();
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verifyUrl = `${baseUrl}/verify-email?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;
  const apiBase = process.env.API_BASE_URL || process.env.API_base_URL || 'http://localhost:5000';
  const apiVerifyUrl = `${apiBase}/api/auth/verify-email?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;
      console.log('Login legacy verification link:', verifyUrl);
      // Background resend (non-blocking)
      startEmailSend(normalizedEmail, verifyUrl, apiVerifyUrl);
      const exposeDev2 = String(process.env.EXPOSE_DEV_VERIFY_LINK || '').toLowerCase() === 'true';
      const isProd2 = (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production');
      const devPayload2 = (!isProd2 || exposeDev2) ? { devVerifyUrl: verifyUrl } : {};
      return res.status(403).json({ success: false, message: 'Email not verified. We sent you a new verification email.', pendingVerification: true, ...devPayload2 });
    }

    // Create JWT token
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRE || '30d').toString().trim() });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// @route   GET /api/auth/verify-email
// @desc    Verify email using token sent via email
// @access  Public
router.get('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.query;
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!token || !email) {
      return res.status(400).json({ success: false, message: 'Invalid verification link' });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Preferred: find pre-registration token
    const regToken = await RegistrationToken.findOne({ email: normalizedEmail, tokenHash, expiresAt: { $gt: new Date() } });

    if (regToken) {
      if (!regToken.passwordHash) {
        return res.status(400).json({ success: false, message: 'Verification cannot be completed. Please register again to set your password.' });
      }
      // Create or update the user as verified using pre-registered data
      let user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        user = new User({ name: regToken.name, email: normalizedEmail, password: regToken.passwordHash, isEmailVerified: true });
      } else {
        // Legacy unverified user path: update password and mark verified
        user.password = regToken.passwordHash;
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
      }
      await user.save();
      await RegistrationToken.deleteOne({ _id: regToken._id });
      return res.json({ success: true, message: 'Email verified successfully' });
    }

    // Fallback: legacy flow where token was stored on User
    const legacyUser = await User.findOne({ email: normalizedEmail, emailVerificationToken: tokenHash, emailVerificationExpires: { $gt: new Date() } });
    if (legacyUser) {
      legacyUser.isEmailVerified = true;
      legacyUser.emailVerificationToken = undefined;
      legacyUser.emailVerificationExpires = undefined;
      await legacyUser.save();
      return res.json({ success: true, message: 'Email verified successfully' });
    }

    return res.status(400).json({ success: false, message: 'Verification link is invalid or expired' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying email', error: error.message });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (user && user.isEmailVerified) {
      return res.json({ success: true, message: 'Email already verified' });
    }
    // Check if a pending pre-registration exists
    const existingReg = await RegistrationToken.findOne({ email: normalizedEmail, expiresAt: { $gt: new Date() } });
    if (!user && !existingReg) {
      return res.status(404).json({ success: false, message: 'No pending registration found for this email. Please register first.' });
    }
    // Prepare a token for either legacy user or pre-registration
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    if (user && !user.isEmailVerified) {
      user.emailVerificationToken = tokenHash;
      user.emailVerificationExpires = expiresAt;
      await user.save();
    } else {
      // Update the existing registration token; do not create a new one without a stored passwordHash
      await RegistrationToken.updateOne(
        { email: normalizedEmail },
        { $set: { tokenHash, expiresAt } }
      );
    }
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;
  const apiBase = process.env.API_BASE_URL || process.env.API_base_URL || 'http://localhost:5000';
  const apiVerifyUrl = `${apiBase}/api/auth/verify-email?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;
    // Background resend (non-blocking)
    startEmailSend(normalizedEmail, verifyUrl, apiVerifyUrl);
    const exposeDev = String(process.env.EXPOSE_DEV_VERIFY_LINK || '').toLowerCase() === 'true';
    const isProd = (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production');
    const devPayload = (!isProd || exposeDev) ? { devVerifyUrl: verifyUrl } : {};
    res.json({ success: true, message: 'Verification email has been sent (or is being sent). Please check your inbox.', ...devPayload });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error resending email', error: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
