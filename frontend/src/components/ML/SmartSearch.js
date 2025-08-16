import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash.debounce';
import { useML } from '../../contexts/MLContext';
import { useAuth } from '../../hooks/useAuth';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ClockIcon,
  SparklesIcon,
  TrendingUpIcon
} from '@heroicons/react/24/outline';

/**
 * Smart Search Component with ML-powered ranking and suggestions
 */
const SmartSearch = ({ 
  placeholder = "Search for clothing, gifts, and more...",
  showSuggestions = true,
  showTrending = true,
  onSearch,
  className = ""
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { searchProducts, getSearchSuggestions, trackBehavior, getTrendingSearches } = useML();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  }, []);

  // Load trending searches
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const trending = await getTrendingSearches();
        setTrendingSearches(trending.slice(0, 5));
      } catch (error) {
        console.error('Error loading trending searches:', error);
      }
    };

    if (showTrending) {
      loadTrending();
    }
  }, [getTrendingSearches, showTrending]);

  // Debounced function to fetch suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const suggestions = await getSearchSuggestions(searchQuery);
        setSuggestions(suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [getSearchSuggestions]
  );

  // Effect to fetch suggestions when query changes
  useEffect(() => {
    if (showSuggestions && query.length >= 2) {
      debouncedGetSuggestions(query);
    } else {
      setSuggestions([]);
    }
    
    setActiveIndex(-1);
  }, [query, debouncedGetSuggestions, showSuggestions]);

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  // Handle search submission
  const handleSearch = async (searchQuery = query) => {
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) return;

    // Track search behavior
    if (user) {
      trackBehavior('search', null, {
        searchTerm: trimmedQuery,
        source: 'search_bar'
      });
    }

    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updatedRecent = [
      trimmedQuery,
      ...recent.filter(item => item !== trimmedQuery)
    ].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    setRecentSearches(updatedRecent.slice(0, 5));

    // Close suggestions
    setIsOpen(false);
    setActiveIndex(-1);

    // Navigate to search results or call onSearch callback
    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const allItems = [
      ...suggestions,
      ...recentSearches.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      ),
      ...trendingSearches.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      )
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < allItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && allItems[activeIndex]) {
          handleSuggestionClick(allItems[activeIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const hasContent = suggestions.length > 0 || recentSearches.length > 0 || trendingSearches.length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && hasContent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {/* Loading indicator */}
            {loading && (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Searching...
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 flex items-center">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  AI Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center ${
                      index === activeIndex ? 'bg-blue-50' : ''
                    }`}
                  >
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="truncate">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && query.length < 2 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Recent Searches
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={search}
                    onClick={() => handleSuggestionClick(search)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center ${
                      index + suggestions.length === activeIndex ? 'bg-blue-50' : ''
                    }`}
                  >
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="truncate">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Trending Searches */}
            {trendingSearches.length > 0 && query.length < 2 && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 flex items-center">
                  <TrendingUpIcon className="h-3 w-3 mr-1" />
                  Trending Now
                </div>
                {trendingSearches.map((search, index) => (
                  <button
                    key={search}
                    onClick={() => handleSuggestionClick(search)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center ${
                      index + suggestions.length + recentSearches.length === activeIndex ? 'bg-blue-50' : ''
                    }`}
                  >
                    <TrendingUpIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="truncate">{search}</span>
                    <span className="ml-auto text-xs text-gray-400">trending</span>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && suggestions.length === 0 && query.length >= 2 && (
              <div className="px-4 py-3 text-sm text-gray-500">
                No suggestions found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close suggestions */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SmartSearch;
