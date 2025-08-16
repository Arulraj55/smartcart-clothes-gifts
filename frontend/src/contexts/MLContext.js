import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const MLContext = createContext();

/**
 * ML Context Provider - Manages all Machine Learning features
 * Handles recommendations, search ranking, and user behavior tracking
 */
export const MLProvider = ({ children }) => {
  const { user } = useAuth();
  const behaviorQueue = useRef([]);
  const sessionId = useRef(null);

  // Initialize session
  React.useEffect(() => {
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Batch process behavior tracking
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (behaviorQueue.current.length > 0) {
        processBehaviorQueue();
      }
    }, 5000); // Process every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const processBehaviorQueue = async () => {
    if (behaviorQueue.current.length === 0 || !user) return;

    const behaviors = [...behaviorQueue.current];
    behaviorQueue.current = [];

    try {
      await axios.post('/api/analytics/behavior/batch', {
        behaviors: behaviors.map(behavior => ({
          ...behavior,
          sessionId: sessionId.current,
          timestamp: new Date().toISOString()
        }))
      });
    } catch (error) {
      console.error('Error processing behavior queue:', error);
      // Re-add to queue if failed
      behaviorQueue.current.unshift(...behaviors);
    }
  };

  /**
   * Track user behavior for ML processing
   */
  const trackBehavior = useCallback(async (action, productId = null, metadata = {}) => {
    if (!user) return;

    const behaviorData = {
      action,
      productId,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        device: getDeviceType(),
        pageUrl: window.location.href,
        pageTitle: document.title,
        timestamp: Date.now()
      }
    };

    // Add to queue for batch processing
    behaviorQueue.current.push(behaviorData);

    // For critical actions, process immediately
    if (['purchase', 'add_to_cart', 'search'].includes(action)) {
      try {
        await axios.post('/api/analytics/behavior', {
          ...behaviorData,
          sessionId: sessionId.current
        });
      } catch (error) {
        console.error('Error tracking behavior:', error);
      }
    }
  }, [user]);

  /**
   * Get ML-powered product recommendations
   */
  const getRecommendations = useCallback(async (type = 'general', options = {}) => {
    try {
      const params = new URLSearchParams({
        type,
        limit: options.limit || 10,
        ...(options.productId && { productId: options.productId }),
        ...(options.category && { category: options.category }),
        ...(options.excludeIds && { excludeIds: options.excludeIds.join(',') })
      });

      const response = await axios.get(`/api/recommendations?${params}`);
      
      // Track recommendation view
      if (user && response.data?.length > 0) {
        trackBehavior('recommendation_view', null, {
          recommendationType: type,
          recommendationCount: response.data.length,
          ...options
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }, [user, trackBehavior]);

  /**
   * Search products with ML-powered ranking
   */
  const searchProducts = useCallback(async (query, filters = {}, options = {}) => {
    try {
      const searchParams = {
        q: query,
        ...filters,
        page: options.page || 1,
        limit: options.limit || 20,
        sortBy: options.sortBy || 'relevance'
      };

      const response = await axios.get('/api/search', { params: searchParams });
      
      // Track search behavior
      if (user) {
        trackBehavior('search', null, {
          searchTerm: query,
          filters,
          resultsCount: response.data.total || 0,
          page: options.page || 1
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return { products: [], total: 0, suggestions: [] };
    }
  }, [user, trackBehavior]);

  /**
   * Get smart search suggestions
   */
  const getSearchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) return [];

    try {
      const response = await axios.get('/api/search/suggestions', {
        params: { q: query }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return [];
    }
  }, []);

  /**
   * Get trending searches
   */
  const getTrendingSearches = useCallback(async () => {
    try {
      const response = await axios.get('/api/search/trending');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching trending searches:', error);
      return [];
    }
  }, []);

  /**
   * Track product view with engagement metrics
   */
  const trackProductView = useCallback(async (productId, metadata = {}) => {
    const startTime = Date.now();
    
    trackBehavior('view', productId, {
      ...metadata,
      viewStartTime: startTime
    });

    // Return a function to track view end
    return () => {
      const endTime = Date.now();
      const timeSpent = Math.round((endTime - startTime) / 1000); // seconds
      
      trackBehavior('view_end', productId, {
        ...metadata,
        timeSpent,
        engagementLevel: getEngagementLevel(timeSpent)
      });
    };
  }, [trackBehavior]);

  /**
   * Track search click with position
   */
  const trackSearchClick = useCallback(async (productId, searchQuery, position, metadata = {}) => {
    trackBehavior('search_click', productId, {
      searchTerm: searchQuery,
      clickPosition: position,
      ...metadata
    });
  }, [trackBehavior]);

  /**
   * Track filter usage
   */
  const trackFilterUsage = useCallback(async (filters, searchQuery = null) => {
    trackBehavior('filter_apply', null, {
      filters,
      searchTerm: searchQuery,
      filterCount: Object.keys(filters).length
    });
  }, [trackBehavior]);

  /**
   * Get personalized product sorting
   */
  const getPersonalizedSort = useCallback(async (products, context = {}) => {
    if (!user || !products.length) return products;

    try {
      const response = await axios.post('/api/recommendations/sort', {
        productIds: products.map(p => p._id),
        context
      });

      // Merge with original products while maintaining ML scores
      const sortedProducts = response.data.map(item => {
        const originalProduct = products.find(p => p._id === item.productId);
        return {
          ...originalProduct,
          mlScore: item.score,
          mlRank: item.rank
        };
      });

      return sortedProducts;
    } catch (error) {
      console.error('Error getting personalized sort:', error);
      return products;
    }
  }, [user]);

  /**
   * Get ML insights for analytics dashboard
   */
  const getMLInsights = useCallback(async () => {
    if (!user) return null;

    try {
      const response = await axios.get('/api/analytics/ml-insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching ML insights:', error);
      return null;
    }
  }, [user]);

  /**
   * Preload recommendations for better UX
   */
  const preloadRecommendations = useCallback(async (types = ['general', 'trending']) => {
    const promises = types.map(type => 
      getRecommendations(type, { limit: 6 })
    );

    try {
      const results = await Promise.all(promises);
      return Object.fromEntries(
        types.map((type, index) => [type, results[index]])
      );
    } catch (error) {
      console.error('Error preloading recommendations:', error);
      return {};
    }
  }, [getRecommendations]);

  // Helper functions
  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const getEngagementLevel = (timeSpent) => {
    if (timeSpent < 5) return 'low';
    if (timeSpent < 30) return 'medium';
    if (timeSpent < 120) return 'high';
    return 'very_high';
  };

  // Context value
  const value = {
    // Core ML functions
    trackBehavior,
    getRecommendations,
    searchProducts,
    getSearchSuggestions,
    getTrendingSearches,
    
    // Specialized tracking
    trackProductView,
    trackSearchClick,
    trackFilterUsage,
    
    // Advanced features
    getPersonalizedSort,
    getMLInsights,
    preloadRecommendations,
    
    // Utilities
    sessionId: sessionId.current,
    isMLEnabled: !!user
  };

  return (
    <MLContext.Provider value={value}>
      {children}
    </MLContext.Provider>
  );
};

/**
 * Hook to use ML context
 */
export const useML = () => {
  const context = useContext(MLContext);
  if (!context) {
    throw new Error('useML must be used within MLProvider');
  }
  return context;
};

export default MLContext;
