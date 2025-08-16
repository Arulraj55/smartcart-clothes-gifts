const Product = require('../models/Product');
const UserBehavior = require('../models/UserBehavior');

/**
 * Lightweight Machine Learning Search Ranking System
 * Implements personalized search result ranking based on user behavior
 * and product relevance signals
 */
class SearchRanking {
  constructor() {
    this.userSearchProfiles = new Map();
    this.globalSearchStats = new Map();
    this.isInitialized = false;
    this.rankingWeights = {
      textRelevance: 0.35,
      userPreference: 0.25,
      popularity: 0.20,
      recency: 0.10,
      rating: 0.10
    };
  }

  /**
   * Initialize the search ranking system
   */
  async initialize() {
    try {
      console.log('🔍 Initializing ML Search Ranking System...');
      await this.buildSearchProfiles();
      await this.buildGlobalStats();
      this.isInitialized = true;
      console.log('✅ Search Ranking System initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Search Ranking System:', error);
    }
  }

  /**
   * Build user search preference profiles
   */
  async buildSearchProfiles() {
    const searchBehaviors = await UserBehavior.find({
      action: { $in: ['search', 'search_click', 'search_purchase'] }
    }).populate('user product').lean();

    for (const behavior of searchBehaviors) {
      if (!behavior.user) continue;

      const userId = behavior.user._id.toString();
      if (!this.userSearchProfiles.has(userId)) {
        this.userSearchProfiles.set(userId, {
          searchTerms: new Map(),
          clickedCategories: new Map(),
          clickedBrands: new Map(),
          purchasedCategories: new Map(),
          avgPriceClicked: 0,
          totalSearches: 0,
          totalClicks: 0
        });
      }

      const profile = this.userSearchProfiles.get(userId);
      this.updateSearchProfile(profile, behavior);
    }

    console.log(`🔍 Built search profiles for ${this.userSearchProfiles.size} users`);
  }

  /**
   * Build global search statistics
   */
  async buildGlobalStats() {
    const products = await Product.find({ isActive: true }).lean();
    
    for (const product of products) {
      this.globalSearchStats.set(product._id.toString(), {
        clickCount: 0,
        searchCount: 0,
        purchaseCount: 0,
        lastSearched: null,
        popularSearchTerms: new Map()
      });
    }

    // Aggregate search behaviors
    const searchBehaviors = await UserBehavior.find({
      action: { $in: ['search_click', 'search_purchase'] }
    }).populate('product').lean();

    for (const behavior of searchBehaviors) {
      if (!behavior.product) continue;

      const productId = behavior.product._id.toString();
      const stats = this.globalSearchStats.get(productId);
      
      if (stats) {
        if (behavior.action === 'search_click') {
          stats.clickCount++;
        } else if (behavior.action === 'search_purchase') {
          stats.purchaseCount++;
        }

        if (behavior.metadata?.searchTerm) {
          const term = behavior.metadata.searchTerm.toLowerCase();
          stats.popularSearchTerms.set(term, (stats.popularSearchTerms.get(term) || 0) + 1);
        }

        stats.lastSearched = behavior.timestamp;
      }
    }

    console.log(`📊 Built global stats for ${this.globalSearchStats.size} products`);
  }

  /**
   * Rank search results for a user
   */
  async rankSearchResults(searchQuery, products, userId = null, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const rankedProducts = [];
    const searchTerms = this.extractSearchTerms(searchQuery);
    const userProfile = userId ? this.userSearchProfiles.get(userId.toString()) : null;

    for (const product of products) {
      const score = this.calculateRankingScore(product, searchTerms, userProfile);
      rankedProducts.push({
        ...product,
        rankingScore: score,
        relevanceBreakdown: this.getScoreBreakdown(product, searchTerms, userProfile)
      });
    }

    // Sort by ranking score
    rankedProducts.sort((a, b) => b.rankingScore - a.rankingScore);

    // Apply diversity filter if requested
    if (options.diversify) {
      return this.diversifyResults(rankedProducts, options.diversifyFactor || 0.3);
    }

    return rankedProducts;
  }

  /**
   * Calculate ranking score for a product
   */
  calculateRankingScore(product, searchTerms, userProfile) {
    let score = 0;

    // Text relevance score
    const textRelevance = this.calculateTextRelevance(product, searchTerms);
    score += textRelevance * this.rankingWeights.textRelevance;

    // User preference score
    const userPreference = userProfile ? 
      this.calculateUserPreference(product, userProfile) : 0.5;
    score += userPreference * this.rankingWeights.userPreference;

    // Popularity score
    const popularity = this.calculatePopularityScore(product);
    score += popularity * this.rankingWeights.popularity;

    // Recency score
    const recency = this.calculateRecencyScore(product);
    score += recency * this.rankingWeights.recency;

    // Rating score
    const rating = (product.averageRating || 0) / 5.0;
    score += rating * this.rankingWeights.rating;

    return Math.max(0, Math.min(score, 1));
  }

  /**
   * Calculate text relevance between product and search terms
   */
  calculateTextRelevance(product, searchTerms) {
    let relevance = 0;
    const productText = this.getProductSearchableText(product).toLowerCase();
    
    for (const term of searchTerms) {
      const termLower = term.toLowerCase();
      
      // Exact match in title (highest weight)
      if (product.name.toLowerCase().includes(termLower)) {
        relevance += 0.4;
      }
      
      // Match in description
      if (product.description?.toLowerCase().includes(termLower)) {
        relevance += 0.2;
      }
      
      // Match in category
      if (product.category?.toLowerCase().includes(termLower)) {
        relevance += 0.15;
      }
      
      // Match in tags
      if (product.tags?.some(tag => tag.toLowerCase().includes(termLower))) {
        relevance += 0.1;
      }
      
      // Match in brand
      if (product.brand?.toLowerCase().includes(termLower)) {
        relevance += 0.1;
      }
      
      // Fuzzy match for typos (simplified)
      if (this.fuzzyMatch(termLower, productText)) {
        relevance += 0.05;
      }
    }

    return Math.min(relevance, 1.0);
  }

  /**
   * Calculate user preference score
   */
  calculateUserPreference(product, userProfile) {
    let preference = 0;

    // Category preference
    const categoryPref = userProfile.clickedCategories.get(product.category) || 0;
    preference += categoryPref * 0.4;

    // Brand preference
    const brandPref = userProfile.clickedBrands.get(product.brand) || 0;
    preference += brandPref * 0.3;

    // Price preference (how close to user's typical price range)
    const priceDiff = Math.abs(product.price - userProfile.avgPriceClicked);
    const priceScore = Math.max(0, 1 - (priceDiff / userProfile.avgPriceClicked || 1));
    preference += priceScore * 0.3;

    return Math.min(preference, 1.0);
  }

  /**
   * Calculate popularity score
   */
  calculatePopularityScore(product) {
    const stats = this.globalSearchStats.get(product._id?.toString()) || {};
    
    const clickScore = Math.min((stats.clickCount || 0) / 100, 1.0) * 0.4;
    const purchaseScore = Math.min((stats.purchaseCount || 0) / 50, 1.0) * 0.4;
    const soldScore = Math.min((product.soldCount || 0) / 100, 1.0) * 0.2;
    
    return clickScore + purchaseScore + soldScore;
  }

  /**
   * Calculate recency score
   */
  calculateRecencyScore(product) {
    const now = new Date();
    const createdDate = new Date(product.createdAt);
    const daysSinceCreated = (now - createdDate) / (1000 * 60 * 60 * 24);
    
    // Boost newer products
    const recencyBoost = Math.max(0, 1 - (daysSinceCreated / 365));
    
    // Boost recently searched products
    const stats = this.globalSearchStats.get(product._id?.toString()) || {};
    let searchRecency = 0;
    if (stats.lastSearched) {
      const daysSinceSearched = (now - new Date(stats.lastSearched)) / (1000 * 60 * 60 * 24);
      searchRecency = Math.max(0, 1 - (daysSinceSearched / 30));
    }
    
    return (recencyBoost * 0.6) + (searchRecency * 0.4);
  }

  /**
   * Get search suggestions based on user behavior
   */
  async getSearchSuggestions(query, userId = null, limit = 5) {
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    // Get suggestions from user's search history
    if (userId) {
      const userProfile = this.userSearchProfiles.get(userId.toString());
      if (userProfile) {
        for (const [term, count] of userProfile.searchTerms) {
          if (term.includes(queryLower) && term !== queryLower) {
            suggestions.push({ term, score: count, source: 'user_history' });
          }
        }
      }
    }
    
    // Get suggestions from global popular terms
    const globalTerms = new Map();
    for (const stats of this.globalSearchStats.values()) {
      for (const [term, count] of stats.popularSearchTerms) {
        if (term.includes(queryLower) && term !== queryLower) {
          globalTerms.set(term, (globalTerms.get(term) || 0) + count);
        }
      }
    }
    
    for (const [term, count] of globalTerms) {
      suggestions.push({ term, score: count, source: 'global' });
    }
    
    // Get suggestions from product names and categories
    const products = await Product.find({
      $or: [
        { name: { $regex: queryLower, $options: 'i' } },
        { category: { $regex: queryLower, $options: 'i' } },
        { tags: { $regex: queryLower, $options: 'i' } }
      ]
    }).limit(20).lean();
    
    for (const product of products) {
      suggestions.push({ term: product.name, score: 1, source: 'product' });
      if (product.category) {
        suggestions.push({ term: product.category, score: 0.5, source: 'category' });
      }
    }
    
    // Sort and deduplicate
    const uniqueSuggestions = new Map();
    for (const suggestion of suggestions) {
      const existing = uniqueSuggestions.get(suggestion.term);
      if (!existing || existing.score < suggestion.score) {
        uniqueSuggestions.set(suggestion.term, suggestion);
      }
    }
    
    return Array.from(uniqueSuggestions.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.term);
  }

  /**
   * Update search behavior and retrain
   */
  async updateSearchBehavior(userId, searchQuery, action, productId = null, metadata = {}) {
    try {
      // Save to database
      await UserBehavior.create({
        user: userId,
        product: productId,
        action: `search_${action}`,
        metadata: { searchTerm: searchQuery, ...metadata },
        timestamp: new Date()
      });

      // Update user profile
      const userProfile = this.userSearchProfiles.get(userId.toString()) || {
        searchTerms: new Map(),
        clickedCategories: new Map(),
        clickedBrands: new Map(),
        purchasedCategories: new Map(),
        avgPriceClicked: 0,
        totalSearches: 0,
        totalClicks: 0
      };

      if (action === 'query') {
        const terms = this.extractSearchTerms(searchQuery);
        for (const term of terms) {
          userProfile.searchTerms.set(term, (userProfile.searchTerms.get(term) || 0) + 1);
        }
        userProfile.totalSearches++;
      }

      if (action === 'click' && productId) {
        userProfile.totalClicks++;
        const product = await Product.findById(productId).lean();
        if (product) {
          userProfile.clickedCategories.set(
            product.category, 
            (userProfile.clickedCategories.get(product.category) || 0) + 1
          );
          if (product.brand) {
            userProfile.clickedBrands.set(
              product.brand, 
              (userProfile.clickedBrands.get(product.brand) || 0) + 1
            );
          }
          
          // Update average price
          const totalPrice = userProfile.avgPriceClicked * (userProfile.totalClicks - 1) + product.price;
          userProfile.avgPriceClicked = totalPrice / userProfile.totalClicks;
        }
      }

      this.userSearchProfiles.set(userId.toString(), userProfile);

      // Update global stats
      if (productId) {
        const stats = this.globalSearchStats.get(productId.toString()) || {
          clickCount: 0,
          searchCount: 0,
          purchaseCount: 0,
          lastSearched: null,
          popularSearchTerms: new Map()
        };

        if (action === 'click') stats.clickCount++;
        if (action === 'purchase') stats.purchaseCount++;
        
        stats.lastSearched = new Date();
        
        const terms = this.extractSearchTerms(searchQuery);
        for (const term of terms) {
          stats.popularSearchTerms.set(term, (stats.popularSearchTerms.get(term) || 0) + 1);
        }

        this.globalSearchStats.set(productId.toString(), stats);
      }

    } catch (error) {
      console.error('Error updating search behavior:', error);
    }
  }

  // Helper methods
  extractSearchTerms(query) {
    return query.toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
      .map(term => term.replace(/[^\w]/g, ''));
  }

  getProductSearchableText(product) {
    return [
      product.name,
      product.description,
      product.category,
      product.subcategory,
      product.brand,
      ...(product.tags || [])
    ].filter(Boolean).join(' ');
  }

  fuzzyMatch(term, text) {
    // Simple fuzzy matching for typos
    if (term.length < 3) return false;
    
    const threshold = Math.floor(term.length * 0.8);
    const words = text.split(/\s+/);
    
    for (const word of words) {
      if (word.length >= threshold && word.includes(term.substring(0, threshold))) {
        return true;
      }
    }
    return false;
  }

  diversifyResults(products, factor = 0.3) {
    const diversified = [];
    const categoryCount = new Map();
    
    for (const product of products) {
      const categoryPopulation = categoryCount.get(product.category) || 0;
      const diversityPenalty = categoryPopulation * factor;
      const adjustedScore = product.rankingScore - diversityPenalty;
      
      diversified.push({
        ...product,
        rankingScore: Math.max(0, adjustedScore)
      });
      
      categoryCount.set(product.category, categoryPopulation + 1);
    }
    
    return diversified.sort((a, b) => b.rankingScore - a.rankingScore);
  }

  getScoreBreakdown(product, searchTerms, userProfile) {
    return {
      textRelevance: this.calculateTextRelevance(product, searchTerms),
      userPreference: userProfile ? this.calculateUserPreference(product, userProfile) : 0.5,
      popularity: this.calculatePopularityScore(product),
      recency: this.calculateRecencyScore(product),
      rating: (product.averageRating || 0) / 5.0
    };
  }

  updateSearchProfile(profile, behavior) {
    if (behavior.metadata?.searchTerm) {
      const terms = this.extractSearchTerms(behavior.metadata.searchTerm);
      for (const term of terms) {
        profile.searchTerms.set(term, (profile.searchTerms.get(term) || 0) + 1);
      }
    }

    if (behavior.action === 'search_click' && behavior.product) {
      profile.clickedCategories.set(
        behavior.product.category,
        (profile.clickedCategories.get(behavior.product.category) || 0) + 1
      );
      
      if (behavior.product.brand) {
        profile.clickedBrands.set(
          behavior.product.brand,
          (profile.clickedBrands.get(behavior.product.brand) || 0) + 1
        );
      }
    }
  }
}

module.exports = SearchRanking;
