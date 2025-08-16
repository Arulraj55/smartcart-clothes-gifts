const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
    default: 'M'
  },
  color: {
    type: String,
    default: 'Default'
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'India'
  },
  phone: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'razorpay', 'cod', 'paypal']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  trackingNumber: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate prices before saving
orderSchema.pre('save', function(next) {
  // Calculate items price
  this.itemsPrice = this.orderItems.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);

  // Calculate tax (18% GST for India)
  this.taxPrice = this.itemsPrice * 0.18;

  // Calculate shipping (free for orders above ₹500)
  this.shippingPrice = this.itemsPrice > 500 ? 0 : 50;

  // Calculate total
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;

  next();
});

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalPrice' }
      }
    }
  ]);
  return stats;
};

// Instance method to update order status
orderSchema.methods.updateStatus = function(status, notes = '') {
  this.orderStatus = status;
  if (notes) this.notes = notes;
  
  if (status === 'delivered') {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);
