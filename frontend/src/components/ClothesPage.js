/* eslint-disable unicode-bom */
import React, { useState, useMemo, useEffect } from 'react';
import ModernProductCard from './product/ModernProductCard';
import PageHero from './layout/PageHero';
import { useAuth } from '../contexts/AuthContext';
import clothingCatalog from '../data/clothing-catalog.json';

const ClothesPage = ({ onAddToCart, isAuthenticated, onAuthRequired, onViewProduct, initialCategory='All', wishlistIds = [], onToggleWishlist }) => {
  const { user } = useAuth();
  const isAuthed = typeof isAuthenticated === 'boolean' ? isAuthenticated : !!user;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const wishlistSet = useMemo(() => new Set((wishlistIds || []).map(id => String(id))), [wishlistIds]);
  
  const itemsPerPage = 40;

  useEffect(() => {
    setSelectedCategory(initialCategory || 'All');
    setCurrentPage(1);
  }, [initialCategory]);

  // Get unique categories
  const categories = ['All', ...new Set(clothingCatalog.map(item => item.category))];

  // Filter and sort products, only with available images
  const filteredProducts = useMemo(() => {
    let filtered = clothingCatalog.filter(product => {
      return product.image && product.image.startsWith('http');
    });

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return parseFloat(b.rating) - parseFloat(a.rating);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [selectedCategory, sortBy, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      console.log('Adding to cart (local fallback):', product);
    }
  };

  const handleAuthRequired = () => {
    if (onAuthRequired) onAuthRequired();
    setShowAuthModal(true);
  };

  useEffect(() => { window.scrollTo({ top:0, behavior:'smooth' }); }, []);
  useEffect(() => { window.scrollTo({ top:0, behavior:'smooth' }); }, [currentPage, selectedCategory, sortBy, searchTerm]);

  const heroTags = ['Monochrome Edits', 'Statement Silks', 'Weekend Denim'];

  return (
    <div style={{ width:'100vw', position:'relative', left:'50%', right:'50%', marginLeft:'-50vw', marginRight:'-50vw' }}>
      <PageHero
        fullBleed
        variant="clothes"
        title="Wardrobe Capsules Crafted For You"
        description="Layer breathable fabrics, refined tailoring, and elevated essentials into polished looks styled by our in-house trend team."
        spotlightTitle="Curated Capsule Drop"
        spotlightSubtitle="Tailored layers, smart co-ords, and elevated basics designed to mix and match all season."
        tags={heroTags}
      />
      <div style={{ padding:'1.75rem 2rem 2.75rem' }}>
      {/* Header (SMARTCART removed – already in navbar) */}
      <div style={{ textAlign:'center', maxWidth:1400, margin:'0 auto' }}>
        <h2 style={{ fontSize:'2.2rem', fontWeight:700, letterSpacing:'-.5px', margin:0, color:'#111827' }}>Clothing Collection</h2>
        <p style={{ fontSize:'0.95rem', color:'#6b7280', margin:'0 0 2.1rem' }}>Discover our complete collection of {filteredProducts.length} premium clothing items</p>
        <div style={{ fontSize:'0.7rem', letterSpacing:'.55px', color:'#9ca3af', marginTop:6, fontWeight:600 }}>
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length}{selectedCategory !== 'All' ? ` • ${selectedCategory}` : ''}
        </div>
  </div>

      {/* Filters and Search */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '1rem', 
        marginBottom: '2rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search clothing items..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: 'white',
              minWidth: '200px'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: 'white',
              minWidth: '150px'
            }}
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ 
        marginBottom: '1.5rem', 
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
        {selectedCategory !== 'All' && (
          <span> in "{selectedCategory}"</span>
        )}
        {searchTerm && (
          <span> matching "{searchTerm}"</span>
        )}
      </div>

      {/* Products Grid full-bleed 4 columns like homepage */}
  <div style={{ width:'100%', margin:'2.25rem 0 0', display:'grid', gap:'1.75rem', gridTemplateColumns:'repeat(4, 1fr)' }}>
        {currentProducts.map(product => {
          if (!product.image || !product.image.startsWith('http')) return null;
          return (
            <ModernProductCard
              key={product.id}
              product={product}
              onAdd={handleAddToCart}
              isAuthenticated={isAuthed}
              onAuth={handleAuthRequired}
              onView={onViewProduct}
              size="xl"
              isFavorite={wishlistSet.has(String(product._id || product.id))}
              onToggleFavorite={onToggleWishlist}
            />
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👗</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No items found</h3>
          <p>Try adjusting your search terms or category filter.</p>
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
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: currentPage === 1 ? '#f9fafb' : 'white',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>

          <span style={{ 
            padding: '0.5rem 1rem',
            color: '#374151',
            fontSize: '0.875rem'
          }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: currentPage === totalPages ? '#f9fafb' : 'white',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
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
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Sign In Required</h3>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Please sign in to add items to your cart.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  // Navigate to login
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ClothesPage;
