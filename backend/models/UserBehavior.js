const mongoose = require('mongoose');

const userBehaviorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'view',
      'like',
      'unlike',
      'add_to_cart',
      'remove_from_cart',
      'add_to_wishlist',
      'remove_from_wishlist',
      'purchase',
      'review',
      'share',
      'search',
      'search_click',
      'search_purchase',
      'filter_apply',
      'sort_change',
      'category_browse',
      'compare_add',
      'compare_remove',
      'quick_view'
    ],
    index: true
  },
  metadata: {
    // Additional context based on action type
    searchTerm: String,
    searchFilters: mongoose.Schema.Types.Mixed,
    searchResults: Number,
    clickPosition: Number,
    sessionId: String,
    referrer: String,
    userAgent: String,
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    // For purchases
    quantity: Number,
    price: Number,
    variant: String,
    // For reviews
    rating: Number,
    // For comparisons
    comparedWith: [mongoose.Schema.Types.ObjectId],
    // Time spent
    timeSpent: Number, // in seconds
    // Page information
    pageUrl: String,
    pageTitle: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionInfo: {
    sessionId: String,
    sessionStart: Date,
    sessionDuration: Number,
    pageViews: Number,
    isNewSession: Boolean
  },
  // ML-specific fields
  mlProcessed: {
    type: Boolean,
    default: false
  },
  mlWeight: {
    type: Number,
    default: 1.0
  },
  mlTags: [String], // For ML categorization
  // A/B testing
  experimentId: String,
  variantId: String
}, {
  timestamps: true
});

// Compound indexes for efficient ML queries
userBehaviorSchema.index({ user: 1, action: 1, timestamp: -1 });
userBehaviorSchema.index({ product: 1, action: 1, timestamp: -1 });
userBehaviorSchema.index({ user: 1, product: 1, action: 1 });
userBehaviorSchema.index({ action: 1, timestamp: -1 });
userBehaviorSchema.index({ 'metadata.searchTerm': 1, action: 1 });
userBehaviorSchema.index({ 'sessionInfo.sessionId': 1, timestamp: 1 });
userBehaviorSchema.index({ mlProcessed: 1, timestamp: 1 });

// TTL index to automatically delete old behavior data (optional)
// userBehaviorSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }); // 1 year

// Virtual for behavior score (used in ML calculations)
userBehaviorSchema.virtual('behaviorScore').get(function() {
  const actionScores = {
    'view': 1,
    'like': 2,
    'add_to_cart': 3,
    'add_to_wishlist': 2,
    'share': 2,
    'review': 3,
    'purchase': 5,
    'search_click': 2,
    'search_purchase': 5,
    'quick_view': 1.5
  };
  
  const baseScore = actionScores[this.action] || 1;
  return baseScore * this.mlWeight;
});

// Static method to get user behavior patterns
userBehaviorSchema.statics.getUserPatterns = function(userId, days = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: cutoffDate }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true }
    },
    {
      $group: {
        _id: {
          action: '$action',
          category: '$productInfo.category'
        },
        count: { $sum: 1 },
        avgTimeSpent: { $avg: '$metadata.timeSpent' },
        products: { $addToSet: '$product' },
        lastActivity: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get product engagement metrics
userBehaviorSchema.statics.getProductEngagement = function(productId, days = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        product: mongoose.Types.ObjectId(productId),
        timestamp: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
        avgTimeSpent: { $avg: '$metadata.timeSpent' },
        totalTimeSpent: { $sum: '$metadata.timeSpent' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get search analytics
userBehaviorSchema.statics.getSearchAnalytics = function(days = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        action: { $in: ['search', 'search_click'] },
        timestamp: { $gte: cutoffDate },
        'metadata.searchTerm': { $exists: true, $ne: '' }
      }
    },
    {
      $group: {
        _id: '$metadata.searchTerm',
        searches: {
          $sum: {
            $cond: [{ $eq: ['$action', 'search'] }, 1, 0]
          }
        },
        clicks: {
          $sum: {
            $cond: [{ $eq: ['$action', 'search_click'] }, 1, 0]
          }
        },
        uniqueUsers: { $addToSet: '$user' },
        avgClickPosition: {
          $avg: {
            $cond: [
              { $eq: ['$action', 'search_click'] },
              '$metadata.clickPosition',
              null
            ]
          }
        }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' },
        clickThroughRate: {
          $cond: [
            { $gt: ['$searches', 0] },
            { $divide: ['$clicks', '$searches'] },
            0
          ]
        }
      }
    },
    {
      $sort: { searches: -1 }
    },
    {
      $limit: 100
    }
  ]);
};

// Static method to get user session analytics
userBehaviorSchema.statics.getSessionAnalytics = function(userId, sessionId) {
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        'sessionInfo.sessionId': sessionId
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true }
    },
    {
      $sort: { timestamp: 1 }
    },
    {
      $group: {
        _id: '$sessionInfo.sessionId',
        actions: {
          $push: {
            action: '$action',
            product: '$productInfo',
            timestamp: '$timestamp',
            metadata: '$metadata'
          }
        },
        totalActions: { $sum: 1 },
        duration: {
          $max: {
            $subtract: ['$timestamp', { $min: '$timestamp' }]
          }
        },
        categories: { $addToSet: '$productInfo.category' },
        products: { $addToSet: '$product' }
      }
    }
  ]);
};

// Method to calculate behavior relevance for recommendations
userBehaviorSchema.methods.getRelevanceScore = function(targetCategory = null, targetBrand = null) {
  let score = this.behaviorScore;
  
  // Time decay - newer behaviors are more relevant
  const daysSinceAction = (Date.now() - this.timestamp) / (1000 * 60 * 60 * 24);
  const timeDecay = Math.exp(-daysSinceAction / 30); // 30-day half-life
  score *= timeDecay;
  
  // Category/brand boost
  if (this.product && targetCategory) {
    // This would need product population to work properly
    score *= 1.2;
  }
  
  return score;
};

// Pre-save middleware to set ML weight based on action importance
userBehaviorSchema.pre('save', function(next) {
  if (this.isNew) {
    const actionWeights = {
      'view': 1.0,
      'like': 1.5,
      'add_to_cart': 2.0,
      'add_to_wishlist': 1.8,
      'share': 1.6,
      'review': 2.2,
      'purchase': 3.0,
      'search_click': 1.4,
      'search_purchase': 3.5
    };
    
    this.mlWeight = actionWeights[this.action] || 1.0;
    
    // Add ML tags based on action and context
    this.mlTags = [this.action];
    
    if (this.metadata.device) {
      this.mlTags.push(`device:${this.metadata.device}`);
    }
    
    if (this.metadata.searchTerm) {
      this.mlTags.push('search-related');
    }
    
    if (['purchase', 'review'].includes(this.action)) {
      this.mlTags.push('high-intent');
    }
  }
  next();
});

module.exports = mongoose.model('UserBehavior', userBehaviorSchema);
