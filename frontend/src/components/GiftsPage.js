/* eslint-disable unicode-bom */
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import giftsCatalog from '../data/gifts-catalog.json';

const GiftProductCard = ({ product, onAddToCart, isAuthenticated }) => {
  // Use product properties directly
  const originalPrice = product.discount > 0 ? Math.floor(product.price / (1 - product.discount / 100)) : product.price;
  const currentPrice = product.price;
  const discountPercent = product.discount;
  const savings = originalPrice - currentPrice;

  // Only render if image exists and matches available images
  const imageFilename = product.image?.split('/').pop();
  if (!imageFilename || !imageFilename.startsWith('gifts_')) return null;

  return (
    <div className="smartcart-card" style={{ height: 'fit-content', position: 'relative' }}>
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          zIndex: 2
        }}>
          {discountPercent}% OFF
        </div>
      )}

      {/* Product Image */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <img 
          src={(product.image || '').startsWith('http') 
            ? `${(typeof window!== 'undefined' && (window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1') ? 'http://localhost:5000' : '')}/api/images/proxy?url=${encodeURIComponent(product.image)}` 
            : product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '224px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      </div>

      {/* Product Info */}
      <div style={{ padding: '1rem' }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#111827', 
          marginBottom: '0.5rem',
          lineHeight: '1.4'
        }}>
          {product.name}
        </h3>
        
        <div style={{ marginBottom: '0.75rem' }}>
          <span style={{ 
            backgroundColor: '#ddd6fe', 
            color: '#7c3aed', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '12px', 
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {product.category}
          </span>
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
            ₹{currentPrice.toLocaleString()}
          </span>
          {discountPercent > 0 && (
            <span style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              textDecoration: 'line-through',
              marginLeft: '0.5rem'
            }}>
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {discountPercent > 0 && (
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#059669', 
            fontWeight: '500',
            marginBottom: '1rem'
          }}>
            You save ₹{savings.toLocaleString()}!
          </div>
        )}

        {/* Rating and Reviews */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginBottom: '1rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <span style={{ color: '#f59e0b' }}>★</span>
          <span>{product.rating}</span>
          <span>({product.reviews} reviews)</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => isAuthenticated ? onAddToCart(product, currentPrice) : alert('Please log in to add items to cart')}
          disabled={!product.inStock}
          style={{
            backgroundColor: product.inStock ? '#10b981' : '#9ca3af',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: product.inStock ? 'pointer' : 'not-allowed',
            width: '100%',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (product.inStock) {
              e.target.style.backgroundColor = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (product.inStock) {
              e.target.style.backgroundColor = '#10b981';
            }
          }}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

const FilterModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [tempFilters, setTempFilters] = useState({
    category: '',
    priceRange: '',
    discount: ''
  });

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Filter Gifts</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Category
          </label>
          <select
            value={tempFilters.category}
            onChange={(e) => setTempFilters(prev => ({ ...prev, category: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All Categories</option>
            <option value="Baby & Kids">Baby & Kids</option>
            <option value="Kitchen & Dining">Kitchen & Dining</option>
            <option value="Leather Goods">Leather Goods</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Home Decor">Home Decor</option>
            <option value="Bath & Beauty">Bath & Beauty</option>
            <option value="Personalized">Personalized</option>
            <option value="Tech & Electronics">Tech & Electronics</option>
            <option value="Gifts & Accessories">Gifts & Accessories</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Price Range
          </label>
          <select
            value={tempFilters.priceRange}
            onChange={(e) => setTempFilters(prev => ({ ...prev, priceRange: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All Prices</option>
            <option value="0-500">Under ₹500</option>
            <option value="500-1000">₹500 - ₹1,000</option>
            <option value="1000-2000">₹1,000 - ₹2,000</option>
            <option value="2000-3000">₹2,000 - ₹3,000</option>
            <option value="3000+">Above ₹3,000</option>
          </select>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Minimum Discount
          </label>
          <select
            value={tempFilters.discount}
            onChange={(e) => setTempFilters(prev => ({ ...prev, discount: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          >
            <option value="">Any Discount</option>
            <option value="10">10% or more</option>
            <option value="25">25% or more</option>
            <option value="50">50% or more</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setTempFilters({ category: '', priceRange: '', discount: '' })}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#10b981',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const GiftsPage = ({ onAddToCart, isAuthenticated, onAuthRequired }) => {
  const authCtx = useAuth();
  const isAuthed = typeof isAuthenticated === 'boolean' ? isAuthenticated : !!authCtx?.user || !!authCtx?.isAuthenticated;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    discount: ''
  });

  const itemsPerPage = 40;

  // Only use products with available images
  const processedGifts = useMemo(() => {
    return giftsCatalog.filter(product => {
      const imageFilename = product.image?.split('/').pop();
      return imageFilename && imageFilename.startsWith('gifts_');
    });
  }, []);

  // Filtering and searching logic
  const filteredGifts = useMemo(() => {
    return processedGifts.filter(gift => {
      const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gift.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !filters.category || gift.category === filters.category;

      let matchesPrice = true;
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(p => p.replace('+', ''));
        if (max) {
          matchesPrice = gift.price >= parseInt(min) && gift.price <= parseInt(max);
        } else {
          matchesPrice = gift.price >= parseInt(min);
        }
      }

      const matchesDiscount = !filters.discount || gift.discount >= parseInt(filters.discount);

      return matchesSearch && matchesCategory && matchesPrice && matchesDiscount;
    });
  }, [processedGifts, searchTerm, filters]);

  // Sorting logic
  const sortedGifts = useMemo(() => {
    const sorted = [...filteredGifts].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'discount':
          comparison = a.discount - b.discount;
          break;
        case 'rating':
          comparison = parseFloat(a.rating) - parseFloat(b.rating);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredGifts, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedGifts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGifts = sortedGifts.slice(startIndex, startIndex + itemsPerPage);

  const handleAddToCart = (gift, price) => {
    if (!isAuthed) {
      onAuthRequired && onAuthRequired();
      return;
    }
    if (onAddToCart) {
      // Normalize to product shape expected by cart (id, name, price, image)
      onAddToCart({ id: gift.id, name: gift.name, price: price ?? gift.price, image: gift.image, quantity: 1 });
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎁 Perfect Gifts Collection
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
          Discover {giftsCatalog.length} unique and thoughtful gifts for every occasion
        </p>
      </div>

      {/* Search and Controls */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1rem', 
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search for the perfect gift..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#10b981'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <div style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            fontSize: '1.25rem'
          }}>
            🔍
          </div>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '1rem', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {/* Filter Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              🔧 Filters
            </button>

            {/* Sort Options */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Sort by:</span>
              {['name', 'price', 'discount', 'rating'].map(option => (
                <button
                  key={option}
                  onClick={() => handleSort(option)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: sortBy === option ? '#10b981' : '#e5e7eb',
                    color: sortBy === option ? 'white' : '#374151',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {option} {sortBy === option && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Showing {paginatedGifts.length} of {filteredGifts.length} gifts
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.category || filters.priceRange || filters.discount) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Active filters:</span>
            {filters.category && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#ddd6fe',
                color: '#7c3aed',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {filters.category}
              </span>
            )}
            {filters.priceRange && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                ₹{filters.priceRange.replace('-', ' - ₹')}
              </span>
            )}
            {filters.discount && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {filters.discount}%+ off
              </span>
            )}
            <button
              onClick={() => {
                setFilters({ category: '', priceRange: '', discount: '' });
                setCurrentPage(1);
              }}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Clear all ✕
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {paginatedGifts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {paginatedGifts.map((gift) => (
            <GiftProductCard
              key={gift.id}
              product={gift}
              onAddToCart={handleAddToCart}
              isAuthenticated={isAuthed}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            No gifts found
          </h3>
          <p style={{ fontSize: '1rem' }}>
            Try adjusting your search terms or filters to find more gifts.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '2rem'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: currentPage === 1 ? '#f9fafb' : 'white',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Previous
          </button>

          {[...Array(Math.min(totalPages, 5))].map((_, index) => {
            const pageNum = currentPage <= 3 ? index + 1 : 
                           currentPage >= totalPages - 2 ? totalPages - 4 + index : 
                           currentPage - 2 + index;
            
            if (pageNum < 1 || pageNum > totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: currentPage === pageNum ? '#10b981' : 'white',
                  color: currentPage === pageNum ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  minWidth: '40px'
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: currentPage === totalPages ? '#f9fafb' : 'white',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default GiftsPage;
