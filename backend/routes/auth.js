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

    // If any user already exists (verified or not), do NOT send mail here — instruct to login
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(200).json({ success: false, message: 'Account already exists. Please login to continue.' });
    }

    // Create the user immediately so login doesn't depend on email verification
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ name, email: normalizedEmail, password: passwordHash, isEmailVerified: false });

    // Prepare a verification token (optional, does not block login)
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    user.emailVerificationToken = tokenHash;
    user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await user.save();

    // Build verify URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;
    const apiBase = process.env.API_BASE_URL || process.env.API_base_URL || 'http://localhost:5000';
    const apiVerifyUrl = `${apiBase}/api/auth/verify-email?token=${plainToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Fire-and-forget email send (do not block the response)
    startEmailSend(normalizedEmail, verifyUrl, apiVerifyUrl);

    const exposeDev = String(process.env.EXPOSE_DEV_VERIFY_LINK || '').toLowerCase() === 'true';
    const devPayload = exposeDev ? { devVerifyUrl: verifyUrl } : {};
    return res.status(201).json({
      success: true,
      message: 'Account created. We sent (or are sending) a verification email. You can login now.',
      pendingVerification: true,
      ...devPayload
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
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
      // No user: instruct to register (do not send any email)
      return res.status(404).json({ success: false, message: 'No account found for this email. Please register first.' });
    }

    // Verify password; email verification is NOT required for login per requirements
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Create JWT token
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRE || '30d').toString().trim() });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: !!user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
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

    // Preferred: find pre-registration token (check existence first to tailor error messaging)
    const regTokenAny = await RegistrationToken.findOne({ email: normalizedEmail, tokenHash });
    if (regTokenAny && regTokenAny.expiresAt > new Date()) {
      if (!regTokenAny.passwordHash) {
        return res.status(400).json({ success: false, message: 'Verification cannot be completed. Please register again to set your password.' });
      }
      // Create or update the user as verified using pre-registered data
      let user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        user = new User({ name: regTokenAny.name, email: normalizedEmail, password: regTokenAny.passwordHash, isEmailVerified: true });
      } else {
        // Legacy unverified user path: update password and mark verified
        user.password = regTokenAny.passwordHash;
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
      }
      await user.save();
      await RegistrationToken.deleteOne({ _id: regTokenAny._id });
      return res.json({ success: true, message: 'Email verified successfully' });
    }
    // If we found a matching pre-registration token but it's expired, return tailored message
    if (regTokenAny && !(regTokenAny.expiresAt > new Date())) {
      return res.status(400).json({ success: false, message: 'Verification link expired. Please resend a new verification email.', canResend: true, email: normalizedEmail });
    }

    // Fallback: legacy flow where token was stored on User
    const legacyAny = await User.findOne({ email: normalizedEmail, emailVerificationToken: tokenHash });
    if (legacyAny) {
      if (legacyAny.emailVerificationExpires && legacyAny.emailVerificationExpires > new Date()) {
        legacyAny.isEmailVerified = true;
        legacyAny.emailVerificationToken = undefined;
        legacyAny.emailVerificationExpires = undefined;
        await legacyAny.save();
        return res.json({ success: true, message: 'Email verified successfully' });
      }
      return res.status(400).json({ success: false, message: 'Verification link expired. Please resend a new verification email.', canResend: true, email: normalizedEmail });
    }

    // If no token match but the user for this email is already verified, treat as success (idempotent)
    const already = await User.findOne({ email: normalizedEmail, isEmailVerified: true });
    if (already) {
      return res.json({ success: true, message: 'Email already verified' });
    }
    return res.status(400).json({ success: false, message: 'Verification link is invalid or expired', canResend: true, email: normalizedEmail });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying email', error: error.message });
  }
});

// @route   GET /api/auth/verify/:token
// @desc    Verify email using token (no email param required)
// @access  Public
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Invalid verification link' });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Try pre-registration token by tokenHash only (check existence first)
    const regTokenAny = await RegistrationToken.findOne({ tokenHash });
    if (regTokenAny) {
      const normalizedEmail = (regTokenAny.email || '').trim().toLowerCase();
      if (!(regTokenAny.expiresAt > new Date())) {
        return res.status(400).json({ success: false, message: 'Verification link expired. Please resend a new verification email.', canResend: true, email: normalizedEmail });
      }
      if (!regTokenAny.passwordHash) {
        return res.status(400).json({ success: false, message: 'Verification cannot be completed. Please register again to set your password.' });
      }
      let user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        user = new User({ name: regTokenAny.name, email: normalizedEmail, password: regTokenAny.passwordHash, isEmailVerified: true });
      } else {
        user.password = regTokenAny.passwordHash;
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
      }
      await user.save();
      await RegistrationToken.deleteOne({ _id: regTokenAny._id });
      return res.json({ success: true, message: 'Email verified successfully' });
    }

    // Fallback: legacy user token path (check existence first)
    const legacyAny = await User.findOne({ emailVerificationToken: tokenHash });
    if (legacyAny) {
      if (legacyAny.emailVerificationExpires && legacyAny.emailVerificationExpires > new Date()) {
        legacyAny.isEmailVerified = true;
        legacyAny.emailVerificationToken = undefined;
        legacyAny.emailVerificationExpires = undefined;
        await legacyAny.save();
        return res.json({ success: true, message: 'Email verified successfully' });
      }
      return res.status(400).json({ success: false, message: 'Verification link expired. Please resend a new verification email.', canResend: true, email: legacyAny.email });
    }

  // If no token match but any user is already verified (rare without email), respond generically
  return res.status(400).json({ success: false, message: 'Verification link is invalid or expired', canResend: true });
  } catch (error) {
    console.error('Verify email (param) error:', error);
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
  const devPayload = exposeDev ? { devVerifyUrl: verifyUrl } : {};
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
