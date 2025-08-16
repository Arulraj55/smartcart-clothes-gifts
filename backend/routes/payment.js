const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Initialize payment gateways
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) ? 
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  }) : null;

// @route   POST /api/payment/create-stripe-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-stripe-payment-intent', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ success: false, message: 'Stripe is not configured on the server. Set STRIPE_SECRET_KEY.' });
    }
    const { amount, currency = 'usd', orderId } = req.body;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

// @route   POST /api/payment/create-razorpay-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-razorpay-order', auth, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(400).json({ success: false, message: 'Razorpay is not configured on the server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' });
    }
    const { amount, currency = 'INR', orderId } = req.body;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `order_${orderId}`,
      notes: {
        orderId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    const status = error?.statusCode || 500;
    const description = error?.error?.description || error?.message || 'Unknown error';
    res.status(status).json({
      success: false,
      message: 'Failed to create Razorpay order',
      reason: description,
      code: error?.error?.code || undefined
    });
  }
});

// @route   POST /api/payment/verify-stripe-payment
// @desc    Verify Stripe payment
// @access  Private
router.post('/verify-stripe-payment', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ success: false, message: 'Stripe is not configured on the server.' });
    }
    const { paymentIntentId, orderId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
    const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          paymentMethod: 'stripe',
          transactionId: paymentIntentId,
      isPaid: true,
          paidAt: new Date()
        },
        { new: true }
      ).populate('user', 'name email');

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Stripe payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// @route   POST /api/payment/verify-razorpay-payment
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify-razorpay-payment', auth, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ success: false, message: 'Razorpay is not configured on the server.' });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      // Update order status
    const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          paymentMethod: 'razorpay',
          transactionId: razorpay_payment_id,
      isPaid: true,
          paidAt: new Date()
        },
        { new: true }
      ).populate('user', 'name email');

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// @route   GET /api/payment/config
// @desc    Get payment gateway configuration
// @access  Private
router.get('/config', auth, (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const masked = keyId ? keyId.slice(0, 6) + '****' : '';
  res.json({
    success: true,
    config: {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      razorpayKeyId: keyId,
      razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      razorpayKeyMasked: masked
    }
  });
});

// Razorpay redirect callback for WebView flows
// Razorpay posts form data: razorpay_payment_id, razorpay_order_id, razorpay_signature
// We expect backendOrderId in the callback_url query: /razorpay/callback?orderId=<backendOrderId>
router.post('/razorpay/callback', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body || {};
    const { orderId: backendOrderId } = req.query || {};

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !backendOrderId) {
      return res.status(400).send('<h3>Payment Error</h3><p>Missing required payment parameters.</p>');
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).send('<h3>Server Error</h3><p>Razorpay not configured.</p>');
    }

    // Verify signature
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).send('<h3>Payment Verification Failed</h3><p>Invalid signature.</p>');
    }

    // Mark order paid
    const order = await Order.findByIdAndUpdate(
      backendOrderId,
      {
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        transactionId: razorpay_payment_id,
        isPaid: true,
        paidAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).send('<h3>Order Not Found</h3>');
    }

    // Best-effort: clear user's cart on success
    try {
      const cart = await Cart.findOne({ user: order.user });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
    } catch (e) {
      // ignore cart clear errors
    }

    // Simple HTML response suitable for WebView
    res.setHeader('Content-Type', 'text/html');
    return res.send(`<!doctype html>
      <html><head><meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Payment Successful</title>
      <style>body{font-family:Arial, sans-serif;padding:2rem;}</style>
      </head><body>
        <h2>Payment Successful</h2>
        <p>Your payment was verified. You can close this page and return to the app.</p>
        <p><strong>Order ID:</strong> ${backendOrderId}</p>
      </body></html>`);
  } catch (err) {
    console.error('Razorpay redirect callback error:', err);
    res.status(500).send('<h3>Server Error</h3><p>Could not process payment.</p>');
  }
});

// Diagnostics: verify Razorpay credentials by creating a tiny test order
router.get('/diagnose-razorpay', auth, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(400).json({ success: false, message: 'Razorpay not configured (missing keys).' });
    }
    const test = await razorpay.orders.create({
      amount: 100, // 100 paise = ₹1
      currency: 'INR',
      receipt: `diag_${Date.now()}`,
      notes: { type: 'diagnostic' }
    });
    return res.json({ success: true, orderId: test.id, status: test.status, keyMasked: (process.env.RAZORPAY_KEY_ID || '').slice(0, 6) + '****' });
  } catch (error) {
    return res.status(error?.statusCode || 500).json({ success: false, code: error?.error?.code, reason: error?.error?.description || error?.message || 'Unknown error' });
  }
});

module.exports = router;
 
// Below: Razorpay redirect-based callback (for WebView environments)
// Note: We export a new route definition above this line; to avoid export issues,
// we append additional routes before the final module.exports if needed.
