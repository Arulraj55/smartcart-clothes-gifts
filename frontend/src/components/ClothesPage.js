/* eslint-disable unicode-bom */
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import clothingCatalog from '../data/clothing-catalog.json';

const ClothesProductCard = ({ product, onAddToCart, isAuthenticated, onAuthRequired, onViewProduct }) => {
  // Only render if image exists and matches available images
  const imageFilename = product.image?.split('/').pop();
  if (!imageFilename || !imageFilename.startsWith('clothes_')) return null;

  return (
    <div className="smartcart-card" style={{ height: 'fit-content', position: 'relative' }}>
      {/* Discount Badge */}
      {product.discount > 0 && (
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
          {product.discount}% OFF
        </div>
      )}

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
          onClick={() => onViewProduct && onViewProduct(product)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key==='Enter') { onViewProduct && onViewProduct(product); } }}
        />
      </div>

      {/* Product Information */}
      <div style={{ padding: '0 0.5rem' }}>
        {/* Product Name */}
        <h3 onClick={() => onViewProduct && onViewProduct(product)} style={{
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: '#1f2937',
          lineHeight: '1.2',
          cursor: 'pointer'
        }}>
          {product.name}
        </h3>

        {/* Category */}
        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          marginBottom: '0.5rem',
          backgroundColor: '#f3f4f6',
          padding: '0.125rem 0.5rem',
          borderRadius: '12px',
          display: 'inline-block'
        }}>
          {product.category}
        </div>

        {/* Rating and Reviews */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '0.5rem'
          }}>
            <span style={{ color: '#fbbf24', marginRight: '0.25rem' }}>★</span>
            <span style={{ color: '#374151', fontWeight: '500' }}>{product.rating}</span>
          </div>
          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
            ({product.reviews} reviews)
          </span>
        </div>

        {/* Pricing Section */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ 
              fontSize: '1.2rem', 
              fontWeight: 'bold', 
              color: '#059669' 
            }}>
              ₹{product.price.toLocaleString()}
            </span>
            {product.discount > 0 && (
              <span style={{ 
                fontSize: '0.9rem', 
                color: '#9ca3af', 
                textDecoration: 'line-through' 
              }}>
                ₹{(product.price + (product.price * product.discount / 100)).toLocaleString()}
              </span>
            )}
          </div>
          {product.discount > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '500' }}>
              You save ₹{Math.floor(product.price * product.discount / 100).toLocaleString()} ({product.discount}%)
            </div>
          )}
        </div>

        {/* Colors Available */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Colors Available:
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {product.colors && product.colors.slice(0, 4).map((color, index) => (
              <span 
                key={index}
                style={{
                  fontSize: '0.6rem',
                  padding: '0.125rem 0.375rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  color: '#374151'
                }}
              >
                {color}
              </span>
            ))}
          </div>
        </div>

        {/* Sizes Available */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Sizes Available:
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {product.sizes && product.sizes.map((size, index) => (
              <span 
                key={index}
                style={{
                  fontSize: '0.6rem',
                  padding: '0.125rem 0.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  color: '#374151'
                }}
              >
                {size}
              </span>
            ))}
          </div>
        </div>

        {/* Brand and Material */}
        <div style={{ marginBottom: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
          <div>Brand: {product.brand}</div>
          <div>Material: {product.material}</div>
        </div>

        {/* Stock Status */}
        <div style={{ marginBottom: '1rem' }}>
          {product.inStock ? (
            <span style={{ 
              fontSize: '0.75rem', 
              color: '#059669', 
              fontWeight: '500',
              backgroundColor: '#ecfdf5',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px'
            }}>
              ✓ In Stock
            </span>
          ) : (
            <span style={{ 
              fontSize: '0.75rem', 
              color: '#dc2626', 
              fontWeight: '500',
              backgroundColor: '#fef2f2',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px'
            }}>
              Out of Stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={() => {
            if (!isAuthenticated) {
              onAuthRequired();
              return;
            }
            onAddToCart(product);
          }}
          disabled={!product.inStock}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: product.inStock ? '#3b82f6' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: product.inStock ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (product.inStock) {
              e.target.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseOut={(e) => {
            if (product.inStock) {
              e.target.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

const ClothesPage = ({ onAddToCart, isAuthenticated, onAuthRequired, onViewProduct }) => {
  const { user } = useAuth();
  const isAuthed = typeof isAuthenticated === 'boolean' ? isAuthenticated : !!user;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const itemsPerPage = 40;

  // Get unique categories
  const categories = ['All', ...new Set(clothingCatalog.map(item => item.category))];

  // Filter and sort products, only with available images
  const filteredProducts = useMemo(() => {
    let filtered = clothingCatalog.filter(product => {
      const imageFilename = product.image?.split('/').pop();
      return imageFilename && imageFilename.startsWith('clothes_');
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

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          Clothing Collection
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          Discover our complete collection of {filteredProducts.length} premium clothing items
        </p>
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

      {/* Products Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {currentProducts.map(product => (
          <ClothesProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            isAuthenticated={isAuthed}
            onAuthRequired={handleAuthRequired}
            onViewProduct={onViewProduct}
          />
        ))}
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
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
  );
};

export default ClothesPage;
