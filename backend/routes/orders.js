const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// Helper to map incoming shipping from frontend to schema
function mapShippingAddress(shipping) {
  if (!shipping) return null;
  const fullName = shipping.fullName || '';
  const [firstName, ...rest] = fullName.split(' ').filter(Boolean);
  const lastName = rest.join(' ') || firstName || 'Customer';
  return {
    firstName: firstName || 'Customer',
    lastName,
    address: shipping.address || '',
    city: shipping.city || '',
    postalCode: shipping.pincode || shipping.postalCode || '',
    country: shipping.country || 'India',
    phone: shipping.phone || ''
  };
}

// Create an order
// POST /api/orders
router.post('/', auth, async (req, res) => {
  try {
    const { items = [], shippingAddress = {}, paymentMethod = 'razorpay', notes } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    // Map items to schema, generating placeholder product ObjectIds if not provided
    const orderItems = items.map((it) => ({
      product: (it.product && mongoose.Types.ObjectId.isValid(it.product))
        ? new mongoose.Types.ObjectId(it.product)
        : new mongoose.Types.ObjectId(),
      name: it.name,
      image: it.image,
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
      size: it.size || 'M',
      color: it.color || 'Default'
    }));

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress: mapShippingAddress(shippingAddress),
      paymentMethod,
      notes
    });

    await order.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
});

// Get current user's orders
// GET /api/orders/my
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch my orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

// Get specific order
// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to get order', error: error.message });
  }
});

module.exports = router;
