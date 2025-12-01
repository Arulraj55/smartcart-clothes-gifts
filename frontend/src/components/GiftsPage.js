/* eslint-disable unicode-bom */
import React, { useState, useMemo, useEffect } from 'react';
import ModernProductCard from './product/ModernProductCard';
import PageHero from './layout/PageHero';
import { useAuth } from '../contexts/AuthContext';
import giftsCatalog from '../data/gifts-catalog.json';

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

const GiftsPage = ({ onAddToCart, isAuthenticated, onAuthRequired, onViewProduct, initialCategory='All', wishlistIds = [], onToggleWishlist }) => {
  const authCtx = useAuth();
  const isAuthed = typeof isAuthenticated === 'boolean' ? isAuthenticated : !!authCtx?.user || !!authCtx?.isAuthenticated;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    category: initialCategory && initialCategory !== 'All' ? initialCategory : '',
    priceRange: '',
    discount: ''
  });
  const wishlistSet = useMemo(() => new Set((wishlistIds || []).map(id => String(id))), [wishlistIds]);

  const itemsPerPage = 40;

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: initialCategory && initialCategory !== 'All' ? initialCategory : ''
    }));
    setCurrentPage(1);
  }, [initialCategory]);

  // Only use products with available images
  const processedGifts = useMemo(() => {
    return giftsCatalog.filter(product => {
      return product.image && product.image.startsWith('http');
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

  // Scroll to top when page mounts & when navigating between contexts
  useEffect(() => { window.scrollTo({ top:0, behavior:'smooth' }); }, []);
  useEffect(() => { window.scrollTo({ top:0, behavior:'smooth' }); }, [currentPage, filters, sortBy, sortOrder, searchTerm]);

  const heroTags = ['Personal Notes', 'Heirloom Finds', 'Next-Day Surprise'];

  return (
    <div style={{ width:'100vw', position:'relative', left:'50%', right:'50%', marginLeft:'-50vw', marginRight:'-50vw' }}>
      <PageHero
        fullBleed
        variant="gifts"
        title="Signature Gifts Wrapped With Care"
        description="Celebrate milestones with personalised keepsakes, handcrafted hampers, and ready-to-gift sets that arrive beautifully wrapped."
        spotlightTitle="Celebration Edit"
        spotlightSubtitle="Keepsake boxes, bespoke notes, and limited-run treasures ready to surprise and delight."
        tags={heroTags}
      />
      <div style={{ padding:'1.75rem 2rem 2.75rem' }}>
      {/* Header (SMARTCART removed – in navbar) */}
      <div style={{ textAlign:'center', maxWidth:1400, margin:'0 auto' }}>
        <h2 style={{ fontSize:'2.2rem', fontWeight:700, letterSpacing:'-.5px', margin:0, color:'#111827' }}>Gifts Collection</h2>
        <p style={{ fontSize:'0.95rem', color:'#6b7280', margin:'0 0 2.1rem' }}>Discover {filteredGifts.length} unique and thoughtful gifts for every occasion</p>
        <div style={{ fontSize:'0.7rem', letterSpacing:'.55px', color:'#9ca3af', marginTop:6, fontWeight:600 }}>
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredGifts.length)} of {filteredGifts.length}{filters.category ? ` • ${filters.category}` : ''}
        </div>
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

    {/* Products Grid Full-Bleed using homepage card style */}
    {paginatedGifts.length > 0 ? (
  <div style={{ width:'100%', margin:'2.25rem 0 0', display:'grid', gap:'1.75rem', gridTemplateColumns:'repeat(4, 1fr)' }}>
          {paginatedGifts.map(gift => {
            if (!gift.image || !gift.image.startsWith('http')) return null;
            return (
              <ModernProductCard
                key={gift.id}
                product={gift}
                onAdd={(prod) => handleAddToCart(prod)}
                isAuthenticated={isAuthed}
                onAuth={onAuthRequired}
                onView={onViewProduct}
                size="xl"
                isFavorite={wishlistSet.has(String(gift._id || gift.id))}
                onToggleFavorite={onToggleWishlist}
              />
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>No gifts found</h3>
          <p style={{ fontSize: '1rem' }}>Try adjusting your search terms or filters to find more gifts.</p>
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
            type="button"
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
                type="button"
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
            type="button"
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
    </div>
  );
};

export default GiftsPage;
