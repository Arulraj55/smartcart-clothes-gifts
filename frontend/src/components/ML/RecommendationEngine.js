import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useML } from '../../contexts/MLContext';
import { useAuth } from '../../hooks/useAuth';
import ProductCard from '../Products/ProductCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

/**
 * ML-Powered Product Recommendations Component
 * Displays personalized product recommendations based on user behavior
 */
const RecommendationEngine = ({ 
  productId = null, 
  type = 'general', 
  title = 'Recommended for You',
  maxItems = 8,
  showMLBadge = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { getRecommendations, trackBehavior } = useML();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);

  // Responsive items per view
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 768) setItemsPerView(2);
      else if (window.innerWidth < 1024) setItemsPerView(3);
      else setItemsPerView(4);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user && type === 'personalized') return;
      
      setLoading(true);
      setError(null);
      
      try {
        let data;
        
        switch (type) {
          case 'similar':
            if (!productId) throw new Error('Product ID required for similar products');
            data = await getRecommendations('similar', { productId, limit: maxItems });
            break;
          case 'personalized':
            data = await getRecommendations('personalized', { limit: maxItems });
            break;
          case 'trending':
            data = await getRecommendations('trending', { limit: maxItems });
            break;
          case 'featured':
            data = await getRecommendations('featured', { limit: maxItems });
            break;
          default:
            data = await getRecommendations('general', { limit: maxItems });
        }
        
        setRecommendations(data || []);
        
        // Track recommendation view
        if (user && data?.length > 0) {
          trackBehavior('recommendation_view', null, {
            recommendationType: type,
            productId: productId,
            recommendationCount: data.length,
            recommendationIds: data.map(p => p._id)
          });
        }
        
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, productId, type, maxItems, getRecommendations, trackBehavior]);

  const handleProductClick = (product, index) => {
    // Track recommendation click
    if (user) {
      trackBehavior('recommendation_click', product._id, {
        recommendationType: type,
        clickPosition: index,
        recommendationScore: product.recommendationScore
      });
    }
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, recommendations.length - itemsPerView);
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < recommendations.length - itemsPerView;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500">Unable to load recommendations</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null; // Don't render if no recommendations
  }

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showMLBadge && (
              <SparklesIcon className="h-5 w-5 text-purple-600" />
            )}
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {showMLBadge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                AI Powered
              </span>
            )}
          </div>
          
          {/* Navigation buttons */}
          {recommendations.length > itemsPerView && (
            <div className="flex space-x-2">
              <button
                onClick={prevSlide}
                disabled={!canGoPrev}
                className={`p-2 rounded-full border ${
                  canGoPrev
                    ? 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className={`p-2 rounded-full border ${
                  canGoNext
                    ? 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        {/* ML Explanation */}
        {showMLBadge && type === 'personalized' && (
          <p className="text-sm text-gray-500 mt-1">
            Based on your browsing history and preferences
          </p>
        )}
        {showMLBadge && type === 'similar' && (
          <p className="text-sm text-gray-500 mt-1">
            Products similar to the one you're viewing
          </p>
        )}
      </div>

      {/* Products Carousel */}
      <div className="p-6">
        <div className="overflow-hidden">
          <motion.div
            className="flex"
            animate={{
              x: `-${(currentIndex * 100) / itemsPerView}%`
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {recommendations.map((product, index) => (
              <div
                key={product._id}
                className={`flex-shrink-0 px-2`}
                style={{ width: `${100 / itemsPerView}%` }}
              >
                <div onClick={() => handleProductClick(product, index)}>
                  <ProductCard
                    product={product}
                    showMLScore={showMLBadge && product.recommendationScore}
                    compact={true}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dots indicator for mobile */}
        {recommendations.length > itemsPerView && itemsPerView === 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: recommendations.length }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with ML insights */}
      {showMLBadge && recommendations.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {recommendations.length} personalized recommendations
            </span>
            {type === 'personalized' && (
              <span>
                Updated based on your recent activity
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationEngine;
