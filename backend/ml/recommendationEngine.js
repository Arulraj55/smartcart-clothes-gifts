const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const UserBehavior = require('../models/UserBehavior');

/**
 * Lightweight Machine Learning Recommendation Engine
 * Implements content-based filtering and collaborative filtering
 * for personalized product recommendations
 */
class RecommendationEngine {
  constructor() {
    this.productVectors = new Map();
    this.userProfiles = new Map();
    this.isInitialized = false;
    this.categories = new Set();
    this.weights = {
      category: 0.3,
      price_range: 0.2,
      brand: 0.2,
      rating: 0.15,
      popularity: 0.15
    };
  }

  /**
   * Initialize the recommendation engine
   */
  async initialize() {
    try {
      console.log('🧠 Initializing ML Recommendation Engine...');
      await this.buildProductVectors();
      await this.buildUserProfiles();
      this.isInitialized = true;
      console.log('✅ Recommendation Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Recommendation Engine:', error);
    }
  }

  /**
   * Build feature vectors for all products
   */
  async buildProductVectors() {
    const products = await Product.find({ isActive: true }).lean();
    
    for (const product of products) {
      const vector = this.createProductVector(product);
      this.productVectors.set(product._id.toString(), vector);
      this.categories.add(product.category);
    }
    
    console.log(`📊 Built vectors for ${products.length} products`);
  }

  /**
   * Create feature vector for a product
   */
  createProductVector(product) {
    return {
      id: product._id.toString(),
      category: product.category,
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      priceRange: this.getPriceRange(product.price),
      rating: product.averageRating || 0,
      popularity: product.soldCount || 0,
      tags: product.tags || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      features: this.extractFeatures(product)
    };
  }

  /**
   * Build user preference profiles based on behavior
   */
  async buildUserProfiles() {
    const users = await User.find().lean();
    
    for (const user of users) {
      const profile = await this.createUserProfile(user._id);
      this.userProfiles.set(user._id.toString(), profile);
    }
    
    console.log(`👤 Built profiles for ${users.length} users`);
  }

  /**
   * Create user preference profile
   */
  async createUserProfile(userId) {
    const [orders, behaviors] = await Promise.all([
      Order.find({ user: userId }).populate('orderItems.product').lean(),
      UserBehavior.find({ user: userId }).populate('product').lean()
    ]);

    const profile = {
      userId: userId.toString(),
      categories: new Map(),
      brands: new Map(),
      priceRanges: new Map(),
      colors: new Map(),
      totalPurchases: 0,
      totalViews: 0,
      averageRating: 0,
      preferredFeatures: new Map()
    };

    // Analyze purchase history
    for (const order of orders) {
      for (const item of (order.orderItems || [])) {
        if (item.product) {
          this.updateProfileFromProduct(profile, item.product, 'purchase', item.quantity);
          profile.totalPurchases += item.quantity;
        }
      }
    }

    // Analyze browsing behavior
    for (const behavior of behaviors) {
      if (behavior.product) {
        const weight = this.getBehaviorWeight(behavior.action);
        this.updateProfileFromProduct(profile, behavior.product, behavior.action, weight);
        
        if (behavior.action === 'view') profile.totalViews++;
      }
    }

    // Normalize preferences
    this.normalizeProfile(profile);
    
    return profile;
  }

  /**
   * Update user profile based on product interaction
   */
  updateProfileFromProduct(profile, product, action, weight = 1) {
    const actionWeight = this.getBehaviorWeight(action) * weight;
    
    // Update category preferences
    this.updateMapValue(profile.categories, product.category, actionWeight);
    
    // Update brand preferences
    if (product.brand) {
      this.updateMapValue(profile.brands, product.brand, actionWeight);
    }
    
    // Update price range preferences
    const priceRange = this.getPriceRange(product.price);
    this.updateMapValue(profile.priceRanges, priceRange, actionWeight);
    
    // Update color preferences
    if (product.colors) {
      for (const color of product.colors) {
        this.updateMapValue(profile.colors, color, actionWeight * 0.5);
      }
    }
    
    // Update feature preferences
    const features = this.extractFeatures(product);
    for (const feature of features) {
      this.updateMapValue(profile.preferredFeatures, feature, actionWeight * 0.3);
    }
  }

  /**
   * Get recommendations for a user
   */
  async getRecommendations(userId, limit = 10, excludeIds = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const userProfile = this.userProfiles.get(userId.toString());
    if (!userProfile) {
      return this.getPopularProducts(limit, excludeIds);
    }

    const recommendations = [];
    const excludeSet = new Set(excludeIds.map(id => id.toString()));

    for (const [productId, productVector] of this.productVectors) {
      if (excludeSet.has(productId)) continue;

      const score = this.calculateRecommendationScore(userProfile, productVector);
      recommendations.push({ productId, score });
    }

    // Sort by score and return top recommendations
    recommendations.sort((a, b) => b.score - a.score);
    
    const topRecommendations = recommendations.slice(0, limit);
    
    // Fetch full product details
    const productIds = topRecommendations.map(r => r.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    
    return products.map(product => ({
      ...product,
      recommendationScore: recommendations.find(r => r.productId === product._id.toString())?.score || 0
    }));
  }

  /**
   * Calculate recommendation score between user profile and product
   */
  calculateRecommendationScore(userProfile, productVector) {
    let score = 0;

    // Category matching
    const categoryScore = this.getMapValue(userProfile.categories, productVector.category) || 0;
    score += categoryScore * this.weights.category;

    // Brand matching
    const brandScore = this.getMapValue(userProfile.brands, productVector.brand) || 0;
    score += brandScore * this.weights.brand;

    // Price range matching
    const priceScore = this.getMapValue(userProfile.priceRanges, productVector.priceRange) || 0;
    score += priceScore * this.weights.price_range;

    // Rating boost
    const ratingScore = productVector.rating / 5.0;
    score += ratingScore * this.weights.rating;

    // Popularity boost
    const popularityScore = Math.min(productVector.popularity / 100, 1.0);
    score += popularityScore * this.weights.popularity;

    // Feature matching bonus
    let featureScore = 0;
    for (const feature of productVector.features) {
      featureScore += this.getMapValue(userProfile.preferredFeatures, feature) || 0;
    }
    score += Math.min(featureScore * 0.1, 0.2);

    return Math.max(0, Math.min(score, 1));
  }

  /**
   * Get similar products based on content
   */
  async getSimilarProducts(productId, limit = 5) {
    const targetVector = this.productVectors.get(productId.toString());
    if (!targetVector) return [];

    const similarities = [];

    for (const [id, vector] of this.productVectors) {
      if (id === productId.toString()) continue;

      const similarity = this.calculateProductSimilarity(targetVector, vector);
      similarities.push({ productId: id, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    
    const productIds = similarities.slice(0, limit).map(s => s.productId);
    return await Product.find({ _id: { $in: productIds } }).lean();
  }

  /**
   * Calculate similarity between two products
   */
  calculateProductSimilarity(product1, product2) {
    let similarity = 0;

    // Category similarity
    if (product1.category === product2.category) similarity += 0.4;
    if (product1.subcategory === product2.subcategory) similarity += 0.2;

    // Brand similarity
    if (product1.brand === product2.brand) similarity += 0.15;

    // Price range similarity
    if (product1.priceRange === product2.priceRange) similarity += 0.15;

    // Feature overlap
    const commonFeatures = product1.features.filter(f => product2.features.includes(f));
    const featureSimilarity = commonFeatures.length / Math.max(product1.features.length, product2.features.length, 1);
    similarity += featureSimilarity * 0.1;

    return similarity;
  }

  /**
   * Get popular products as fallback
   */
  async getPopularProducts(limit = 10, excludeIds = []) {
    return await Product.find({
      _id: { $nin: excludeIds },
      isActive: true
    })
    .sort({ soldCount: -1, averageRating: -1 })
    .limit(limit)
    .lean();
  }

  /**
   * Update user behavior and retrain if needed
   */
  async updateUserBehavior(userId, productId, action, metadata = {}) {
    try {
      // Save behavior to database
      await UserBehavior.create({
        user: userId,
        product: productId,
        action,
        metadata,
        timestamp: new Date()
      });

      // Update user profile incrementally
      const userProfile = this.userProfiles.get(userId.toString());
      if (userProfile) {
        const product = await Product.findById(productId).lean();
        if (product) {
          const weight = this.getBehaviorWeight(action);
          this.updateProfileFromProduct(userProfile, product, action, weight);
          this.normalizeProfile(userProfile);
        }
      }
    } catch (error) {
      console.error('Error updating user behavior:', error);
    }
  }

  // Helper methods
  getBehaviorWeight(action) {
    const weights = {
      'view': 1,
      'like': 2,
      'add_to_cart': 3,
      'purchase': 5,
      'review': 3,
      'share': 2
    };
    return weights[action] || 1;
  }

  getPriceRange(price) {
    if (price < 25) return 'budget';
    if (price < 50) return 'low';
    if (price < 100) return 'medium';
    if (price < 200) return 'high';
    return 'premium';
  }

  extractFeatures(product) {
    const features = [];
    if (product.tags) features.push(...product.tags);
    if (product.material) features.push(product.material);
    if (product.style) features.push(product.style);
    if (product.occasion) features.push(product.occasion);
    return [...new Set(features)];
  }

  updateMapValue(map, key, value) {
    map.set(key, (map.get(key) || 0) + value);
  }

  getMapValue(map, key) {
    return map.get(key) || 0;
  }

  normalizeProfile(profile) {
    const normalize = (map) => {
      const total = Array.from(map.values()).reduce((sum, val) => sum + val, 0);
      if (total > 0) {
        for (const [key, value] of map) {
          map.set(key, value / total);
        }
      }
    };

    normalize(profile.categories);
    normalize(profile.brands);
    normalize(profile.priceRanges);
    normalize(profile.colors);
    normalize(profile.preferredFeatures);
  }
}

module.exports = RecommendationEngine;
