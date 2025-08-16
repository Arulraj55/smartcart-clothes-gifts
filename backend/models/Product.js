const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be a positive number']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare at price must be a positive number']
  },
  cost: {
    type: Number,
    min: [0, 'Cost must be a positive number']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'men-clothing',
      'women-clothing',
      'kids-clothing',
      'accessories',
      'shoes',
      'bags',
      'jewelry',
      'gifts',
      'home-decor',
      'electronics-gifts',
      'books-stationery',
      'beauty-personal-care'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  vendor: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    cloudinaryId: String
  }],
  variants: [{
    name: String, // e.g., "Size", "Color"
    options: [String] // e.g., ["S", "M", "L"] or ["Red", "Blue"]
  }],
  inventory: {
    trackQuantity: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    }
  },
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inch'],
        default: 'cm'
      }
    },
    material: String,
    color: String,
    size: String,
    style: String,
    occasion: String,
    season: String,
    careInstructions: String
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  pricing: {
    currency: {
      type: String,
      default: 'USD'
    },
    taxable: {
      type: Boolean,
      default: true
    },
    taxClass: String
  },
  shipping: {
    weight: Number,
    requiresShipping: {
      type: Boolean,
      default: true
    },
    shippingClass: String
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    comment: String,
    images: [String],
    verified: {
      type: Boolean,
      default: false
    },
    helpful: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  ratingDistribution: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  soldCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  },
  // ML-related fields
  mlFeatures: {
    popularity: {
      type: Number,
      default: 0
    },
    trendingScore: {
      type: Number,
      default: 0
    },
    seasonalityScore: {
      type: Number,
      default: 0
    },
    crossSellScore: {
      type: Number,
      default: 0
    },
    lastRecommendationUpdate: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'seo.slug': 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (!this.inventory.trackQuantity) return 'in_stock';
  if (this.inventory.quantity <= 0) return 'out_of_stock';
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
    return;
  }

  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.averageRating = Number((total / this.reviews.length).toFixed(1));
  this.totalReviews = this.reviews.length;

  // Update rating distribution
  this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  this.reviews.forEach(review => {
    this.ratingDistribution[review.rating]++;
  });
};

// Method to update ML features
productSchema.methods.updateMLFeatures = function() {
  const now = new Date();
  const daysSinceCreated = (now - this.createdAt) / (1000 * 60 * 60 * 24);
  
  // Calculate popularity score
  this.mlFeatures.popularity = (this.soldCount * 0.5) + (this.viewCount * 0.3) + (this.wishlistCount * 0.2);
  
  // Calculate trending score (higher for recent activity)
  const recentViews = this.viewCount / Math.max(daysSinceCreated, 1);
  this.mlFeatures.trendingScore = recentViews * this.averageRating;
  
  // Simple seasonality (can be enhanced with actual seasonal data)
  const month = now.getMonth();
  this.mlFeatures.seasonalityScore = this.calculateSeasonalityScore(month);
  
  this.mlFeatures.lastRecommendationUpdate = now;
};

productSchema.methods.calculateSeasonalityScore = function(month) {
  // Simple seasonality logic (can be enhanced)
  const seasonalCategories = {
    'winter': ['sweaters', 'coats', 'boots'],
    'summer': ['t-shirts', 'shorts', 'sandals'],
    'spring': ['light-jackets', 'sneakers'],
    'fall': ['jeans', 'boots']
  };
  
  const currentSeason = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 
                        'summer', 'summer', 'fall', 'fall', 'fall', 'winter'][month];
  
  const categoryLower = this.category.toLowerCase();
  const subcategoryLower = (this.subcategory || '').toLowerCase();
  
  if (seasonalCategories[currentSeason].some(item => 
    categoryLower.includes(item) || subcategoryLower.includes(item))) {
    return 1.0;
  }
  
  return 0.5; // Neutral score for non-seasonal items
};

// Static method to get trending products
productSchema.statics.getTrending = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'mlFeatures.trendingScore': -1, soldCount: -1 })
    .limit(limit);
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ isActive: true, isFeatured: true })
    .sort({ averageRating: -1, soldCount: -1 })
    .limit(limit);
};

// Static method to search products
productSchema.statics.searchProducts = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    brand,
    rating,
    sortBy = 'relevance',
    page = 1,
    limit = 20
  } = options;

  const searchQuery = { isActive: true };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (category) searchQuery.category = category;
  if (brand) searchQuery.brand = new RegExp(brand, 'i');
  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = minPrice;
    if (maxPrice) searchQuery.price.$lte = maxPrice;
  }
  if (rating) searchQuery.averageRating = { $gte: rating };

  let sortOptions = {};
  switch (sortBy) {
    case 'price_low':
      sortOptions = { price: 1 };
      break;
    case 'price_high':
      sortOptions = { price: -1 };
      break;
    case 'rating':
      sortOptions = { averageRating: -1, totalReviews: -1 };
      break;
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'popularity':
      sortOptions = { soldCount: -1, viewCount: -1 };
      break;
    default:
      sortOptions = query ? { score: { $meta: 'textScore' } } : { soldCount: -1 };
  }

  const skip = (page - 1) * limit;

  return this.find(searchQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('reviews.user', 'name avatar');
};

module.exports = mongoose.model('Product', productSchema);
