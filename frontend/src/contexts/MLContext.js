import React, { createContext, useContext, useCallback, useRef } from 'react';
import axios from 'axios';

const MLContext = createContext();

/**
 * ML Context Provider
 * Handles recommendations, search ranking, and user behavior tracking.
 *
 * All behavior tracking is fire-and-forget — ML failures must never crash the UI.
 */
export const MLProvider = ({ children }) => {
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // ---------------------------------------------------------------------------
  // trackBehavior — send a single behavior event to the backend immediately.
  // Only fires when the user is authenticated (token in localStorage).
  // Silent on any error.
  // ---------------------------------------------------------------------------
  const trackBehavior = useCallback(async (action, productId = null, metadata = {}) => {
    const token = localStorage.getItem('token');
    if (!token) return; // only track authenticated users

    try {
      await axios.post(
        '/api/analytics/behavior',
        {
          action,
          productId: productId ? String(productId) : undefined,
          metadata: {
            ...metadata,
            device: (() => {
              const w = window.innerWidth;
              if (w < 768) return 'mobile';
              if (w < 1024) return 'tablet';
              return 'desktop';
            })(),
            pageUrl: window.location.href
          },
          sessionId: sessionId.current
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (_) {
      // Silent — analytics must never crash the app
    }
  }, []); // no user dep needed — we check token directly

  // ---------------------------------------------------------------------------
  // getRecommendations — fetch personalized or cold-start recommendations.
  // API returns: { success, recommendations: [...], source }
  // Falls back to [] on any error.
  // ---------------------------------------------------------------------------
  const getRecommendations = useCallback(async (type = 'general', options = {}) => {
    try {
      const params = new URLSearchParams({
        limit: options.limit || 10
      });

      const response = await axios.get(`/api/recommendations?${params}`);
      // Backend returns { success, recommendations: [...] }
      return response.data?.recommendations || [];
    } catch (_) {
      return [];
    }
  }, []);

  // ---------------------------------------------------------------------------
  // searchProducts — ML-ranked search via backend.
  // API returns: { success, results: [...], total, page, totalPages }
  // Falls back to { results: [], total: 0 } on error.
  // ---------------------------------------------------------------------------
  const searchProducts = useCallback(async (query, filters = {}, options = {}) => {
    try {
      const params = {
        q: query,
        ...filters,
        page: options.page || 1,
        limit: options.limit || 20
      };
      const response = await axios.get('/api/search', { params });
      // Backend returns { success, results: [...], total, ... }
      return response.data || { results: [], total: 0 };
    } catch (_) {
      return { results: [], total: 0 };
    }
  }, []);

  // ---------------------------------------------------------------------------
  // getSearchSuggestions — autocomplete suggestions from backend.
  // API returns: { success, suggestions: [...] }
  // Falls back to [] on error.
  // ---------------------------------------------------------------------------
  const getSearchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) return [];
    try {
      const response = await axios.get('/api/search/suggestions', {
        params: { q: query }
      });
      // Backend returns { success, suggestions: [...] }
      return response.data?.suggestions || [];
    } catch (_) {
      return [];
    }
  }, []);

  // ---------------------------------------------------------------------------
  // getTrendingSearches — not yet a dedicated backend endpoint.
  // Returns empty array gracefully so SmartSearch doesn't break.
  // ---------------------------------------------------------------------------
  const getTrendingSearches = useCallback(async () => {
    return [];
  }, []);

  // ---------------------------------------------------------------------------
  // trackProductView — track a product view event.
  // Returns a cleanup fn that can be called on unmount to record time spent.
  // ---------------------------------------------------------------------------
  const trackProductView = useCallback((productId, metadata = {}) => {
    const startTime = Date.now();
    trackBehavior('view', productId, metadata);

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent >= 3) {
        // Only record meaningful dwell — ignore accidental hovers
        trackBehavior('view', productId, { ...metadata, timeSpent });
      }
    };
  }, [trackBehavior]);

  // ---------------------------------------------------------------------------
  // trackSearchClick — track when a user clicks a search result.
  // ---------------------------------------------------------------------------
  const trackSearchClick = useCallback((productId, searchQuery, position, metadata = {}) => {
    trackBehavior('search_click', productId, {
      searchTerm: searchQuery,
      clickPosition: position,
      ...metadata
    });
  }, [trackBehavior]);

  // ---------------------------------------------------------------------------
  // trackFilterUsage — track filter application (category_browse).
  // ---------------------------------------------------------------------------
  const trackFilterUsage = useCallback((filters, searchQuery = null) => {
    if (filters.category) {
      trackBehavior('category_browse', null, {
        category: filters.category,
        searchTerm: searchQuery,
        filterCount: Object.keys(filters).length
      });
    }
  }, [trackBehavior]);

  const value = {
    trackBehavior,
    getRecommendations,
    searchProducts,
    getSearchSuggestions,
    getTrendingSearches,
    trackProductView,
    trackSearchClick,
    trackFilterUsage,
    sessionId: sessionId.current,
    isMLEnabled: Boolean(localStorage.getItem('token'))
  };

  return (
    <MLContext.Provider value={value}>
      {children}
    </MLContext.Provider>
  );
};

export const useML = () => {
  const context = useContext(MLContext);
  if (!context) {
    throw new Error('useML must be used within MLProvider');
  }
  return context;
};

export default MLContext;
