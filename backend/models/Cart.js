const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  // Store product id as string to support external catalogs
  product: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
    default: 'M'
  },
  color: {
    type: String,
    default: 'Default'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', async function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  this.updatedAt = Date.now();
  next();
});

// Instance method to add item to cart
cartSchema.methods.addItem = async function(product, quantity = 1, size = 'M', color = 'Default') {
  const productId = typeof product === 'object' ? (product._id || product.id || product.product) : product;
  const existingItemIndex = this.items.findIndex(
    item => item.product === String(productId) && item.size === size && item.color === color
  );

  if (existingItemIndex > -1) {
    // Update existing item
    const existing = this.items[existingItemIndex];
    existing.quantity += quantity;
    // Backfill/refresh details if provided
    if (product) {
      if (product.name && existing.name !== product.name) existing.name = product.name;
      const img = product.image || product.images?.[0];
      if (img && existing.image !== img) existing.image = img;
      const p = Number(product.price);
      if (!isNaN(p) && p > 0 && existing.price !== p) existing.price = p;
    }
  } else {
    // Add new item
    const name = product?.name || 'Product';
    const image = product?.image || product?.images?.[0] || '';
    const price = Number(product?.price || 0);
    this.items.push({ product: String(productId), name, image, price, quantity, size, color });
  }

  return this.save();
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId);
  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.find(item => item._id.toString() === itemId);
  if (item) {
    item.quantity = quantity;
  }
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
