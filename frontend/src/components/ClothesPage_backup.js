/* eslint-disable unicode-bom */
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import fetchedImages from '../data/clothing-catalog.json';

const ClothesProductCard = ({ product, onAddToCart, isAuthenticated, onAuthRequired }) => {
  // Use the product's actual pricing from the catalog
  const originalPrice = product.price + product.discount;
  const currentPrice = product.price;
  const discountPercent = product.discount;
  const savings = originalPrice - currentPrice;

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

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <img 
          src={product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '224px', // h-56 equivalent
            objectFit: 'cover',
            borderRadius: '8px'
          }}
          onError={(e) => {
            // Use clothing-appropriate placeholder as fallback
            e.target.src = `https://via.placeholder.com/400x300/667eea/ffffff?text=${encodeURIComponent(product.name)}`;
          }}
        />
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                fontSize: '0.6rem',
                padding: '1px 4px',
                borderRadius: '2px',
                opacity: '0.8'
              }}>
                Photo by <span style={{ color: 'white' }}>
                  {productImage.attribution.photographer}
                </span> on {productImage.source === 'pixabay' ? 'Pixabay' : 'LoremFlickr'}
              </div>
            )}
          </div>
        ) : null}
        
        {/* Fallback placeholder - shown when no image */}
        <div style={{
          width: '100%',
          height: '224px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          display: (productImage && productImage.image_url) ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          border: '2px dashed #d1d5db'
        }}>
          <div style={{
            fontSize: '3rem',
            color: '#9ca3af',
            marginBottom: '0.5rem'
          }}>
            👗
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            textAlign: 'center',
            padding: '0 1rem'
          }}>
            {product.name || product.keyword || 'Clothing Item'}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            marginTop: '0.25rem'
          }}>
            Real Image Available
          </div>
        </div>
      </div>
      
      {/* Product Title */}
      <h3 style={{ 
        color: '#1f2937', 
        marginBottom: '0.5rem', 
        fontSize: '1.1rem', 
        fontWeight: 'bold',
        lineHeight: '1.3',
        minHeight: '2.6rem',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {product.name || product.keyword || 'Clothing Item'}
      </h3>
      
      {/* Product Type/Category */}
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '0.5rem', 
        fontSize: '0.85rem',
        fontWeight: '500',
        textTransform: 'capitalize' 
      }}>
        {product.type}
      </p>

      {/* Pricing Section */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ 
            fontSize: '1.4rem', 
            fontWeight: 'bold', 
            color: '#059669' 
          }}>
            ₹{currentPrice.toLocaleString()}
          </span>
          <span style={{ 
            fontSize: '1rem', 
            color: '#9ca3af', 
            textDecoration: 'line-through' 
          }}>
            ₹{originalPrice.toLocaleString()}
          </span>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#059669', fontWeight: '500' }}>
          You save ₹{savings.toLocaleString()} ({discountPercent}%)
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => onAddToCart(product)}
        style={{
          width: '100%',
          backgroundColor: isAuthenticated ? '#667eea' : '#9ca3af',
          color: 'white',
          padding: '0.75rem 1rem',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: isAuthenticated ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          opacity: isAuthenticated ? 1 : 0.7
        }}
        onMouseEnter={(e) => {
          if (isAuthenticated) {
            e.target.style.backgroundColor = '#5a67d8';
            e.target.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (isAuthenticated) {
            e.target.style.backgroundColor = '#667eea';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        {isAuthenticated ? '🛒 Add to Cart' : '🔐 Sign In to Add'}
      </button>
    </div>
  );
};

// Filter Modal Component for Clothes
const ClothesFilterModal = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const categories = ['traditional_women', 'traditional_men', 'modern_women', 'modern_men', 'innerwear', 'festival_ceremonial'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown'];
  const materials = ['Cotton', 'Silk', 'Polyester', 'Linen', 'Wool', 'Denim', 'Chiffon', 'Satin'];

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      categories: [],
      priceRange: { min: 0, max: 999999 },
      discount: 0,
      sizes: [],
      colors: [],
      materials: []
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#1f2937', margin: 0 }}>👗 Filter Clothes</h2>
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
            ✕
          </button>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Categories</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(category => (
              <label key={category} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={localFilters.categories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setLocalFilters(prev => ({
                        ...prev,
                        categories: [...prev.categories, category]
                      }));
                    } else {
                      setLocalFilters(prev => ({
                        ...prev,
                        categories: prev.categories.filter(c => c !== category)
                      }));
                    }
                  }}
                />
                <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{category.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Price Range</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Min"
              value={localFilters.priceRange.min}
              onChange={(e) => setLocalFilters(prev => ({
                ...prev,
                priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 }
              }))}
              style={{ width: '80px', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={localFilters.priceRange.max === 999999 ? '' : localFilters.priceRange.max}
              onChange={(e) => setLocalFilters(prev => ({
                ...prev,
                priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 999999 }
              }))}
              style={{ width: '80px', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* Sizes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Sizes</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {sizes.map(size => (
              <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={localFilters.sizes.includes(size)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setLocalFilters(prev => ({
                        ...prev,
                        sizes: [...prev.sizes, size]
                      }));
                    } else {
                      setLocalFilters(prev => ({
                        ...prev,
                        sizes: prev.sizes.filter(s => s !== size)
                      }));
                    }
                  }}
                />
                <span style={{ fontSize: '0.9rem' }}>{size}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Colors</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {colors.map(color => (
              <label key={color} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={localFilters.colors.includes(color)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setLocalFilters(prev => ({
                        ...prev,
                        colors: [...prev.colors, color]
                      }));
                    } else {
                      setLocalFilters(prev => ({
                        ...prev,
                        colors: prev.colors.filter(c => c !== color)
                      }));
                    }
                  }}
                />
                <span style={{ fontSize: '0.9rem' }}>{color}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Materials</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {materials.map(material => (
              <label key={material} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={localFilters.materials.includes(material)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setLocalFilters(prev => ({
                        ...prev,
                        materials: [...prev.materials, material]
                      }));
                    } else {
                      setLocalFilters(prev => ({
                        ...prev,
                        materials: prev.materials.filter(m => m !== material)
                      }));
                    }
                  }}
                />
                <span style={{ fontSize: '0.9rem' }}>{material}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Discount Filter */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Minimum Discount: {localFilters.discount}%</h3>
          <input
            type="range"
            min="0"
            max="70"
            value={localFilters.discount}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              discount: parseInt(e.target.value)
            }))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleReset}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Reset All
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
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

const ClothesPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: 999999 },
    discount: 0,
    sizes: [],
    colors: [],
    materials: []
  });

  const itemsPerPage = 40;

  // eslint-disable-next-line no-unused-vars
  // Format categories with display names
  // eslint-disable-next-line no-unused-vars
  const categories = [
    { key: 'traditional_women', name: 'Women\'s Traditional' },
    { key: 'traditional_men', name: 'Men\'s Traditional' },
    { key: 'modern_women', name: 'Modern Women' },
    { key: 'modern_men', name: 'Modern Men' },
    { key: 'innerwear', name: 'Innerwear' },
    { key: 'festival_ceremonial', name: 'Festival & Ceremonial' },
    { key: 'seasonal_utility', name: 'Seasonal & Utility' },
    { key: 'fabrics_styles_trends', name: 'Fabrics & Trends' },
    { key: 'unisex_gender_neutral', name: 'Unisex & Gender Neutral' },
    { key: 'bonus_fashion_fusion', name: 'Fashion Fusion' }
  ];

  // eslint-disable-next-line no-unused-vars
  // Simple function to get assigned image for a product
  // eslint-disable-next-line no-unused-vars
  const getProductImage = (productName, productType) => {
    // Find the image directly from fetchedImages based on keyword or name
    const imageData = fetchedImages.images || [];
    const matchedImage = imageData.find(img => 
      img.keyword === productName || 
      (img.keyword && img.keyword.toLowerCase() === productName.toLowerCase()) ||
      (img.name && img.name === productName) ||
      (img.name && img.name.toLowerCase() === productName.toLowerCase())
    );
    
    if (matchedImage) {
      return matchedImage;
    }
    
    return null;
  };

  const allClothingItems = useMemo(() => {
    // Use the catalog items directly from the JSON file
    const imageData = fetchedImages.images || [];
    
    // Return the items directly with minimal transformation
    return imageData.map((item, index) => ({
      ...item, // Include all existing properties
      id: item.id || index + 1,
      type: item.category || 'clothing' // Use category as type for filtering
    }));
  }, []);

  // eslint-disable-next-line no-unused-vars
  // Helper function for backward compatibility
  // eslint-disable-next-line no-unused-vars
  const getItemType = (keyword) => {
    return keyword.includes('sari') || keyword.includes('saree') ? 'traditional_women' :
           keyword.includes('sherwani') || keyword.includes('dhoti') ? 'traditional_men' :
           keyword.includes('dress') || keyword.includes('blouse') ? 'modern_women' :
           keyword.includes('shirt') || keyword.includes('blazer') ? 'modern_men' :
           keyword.includes('underwear') || keyword.includes('bra') ? 'innerwear' :
           keyword.includes('wedding') || keyword.includes('bridal') ? 'festival_ceremonial' :
           keyword.includes('winter') || keyword.includes('rain') ? 'seasonal_utility' :
           keyword.includes('silk') || keyword.includes('cotton') ? 'fabrics_styles_trends' :
           keyword.includes('ethnic') || keyword.includes('fusion') ? 'bonus_fashion_fusion' :
           'traditional_women';
  };

  const filteredProducts = useMemo(() => {
    let filtered = allClothingItems.filter(product => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.keyword && product.keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.some(cat => 
          product.category === cat || 
          product.type?.toLowerCase().includes(cat) ||
          product.keyword.toLowerCase().includes(cat)
        );

      // Price filter - use currentPrice from catalog
      const price = product.currentPrice || 0;
      const matchesPrice = price >= filters.priceRange.min && price <= filters.priceRange.max;

      // Discount filter - use discount from catalog
      const discount = product.discount || 0;
      const matchesDiscount = discount >= filters.discount;

      // Size filter - use sizes from catalog
      const matchesSize = filters.sizes.length === 0 || 
        filters.sizes.some(size => 
          product.sizes?.includes(size) || 
          (product.name && product.name.toLowerCase().includes(size.toLowerCase()))
        );

      // Color filter - use colors from catalog
      const matchesColor = filters.colors.length === 0 || 
        filters.colors.some(color => 
          product.colors?.includes(color) ||
          (product.name && product.name.toLowerCase().includes(color.toLowerCase())) || 
          (product.keyword && product.keyword.toLowerCase().includes(color.toLowerCase()))
        );

      // Material filter - use material from catalog
      const matchesMaterial = filters.materials.length === 0 || 
        filters.materials.some(material => 
          (product.material && product.material.toLowerCase().includes(material.toLowerCase())) ||
          (product.name && product.name.toLowerCase().includes(material.toLowerCase())) || 
          (product.keyword && product.keyword.toLowerCase().includes(material.toLowerCase()))
        );

      return matchesSearch && matchesCategory && matchesPrice && matchesDiscount && matchesSize && matchesColor && matchesMaterial;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      const priceA = a.currentPrice || 0;
      const priceB = b.currentPrice || 0;
      const discountA = a.discount || 0;
      const discountB = b.discount || 0;

      switch (sortBy) {
        case 'price_low':
          return priceA - priceB;
        case 'price_high':
          return priceB - priceA;
        case 'discount':
          return discountB - discountA;
        case 'name':
        default:
          const nameA = a.name || a.keyword || 'Unknown';
          const nameB = b.name || b.keyword || 'Unknown';
          return nameA.localeCompare(nameB);
      }
    });

    return filtered;
  }, [allClothingItems, searchTerm, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }
    const productName = product.name || product.keyword || 'Unknown Item';
    console.log('Adding to cart:', product);
    alert(`Added ${productName} to cart!`);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            Traditional Clothing Collection
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Discover our curated collection of 1000 traditional Indian clothing items
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <input
              type="text"
              placeholder="🔍 Search clothes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                border: '2px solid #e5e7eb',
                borderRadius: '25px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: '1.2rem'
            }}>
              🔍
            </span>
          </div>
          
          <button
            onClick={() => setShowFilters(true)}
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            🎛️ Filters
            {Object.values(filters).some(v => 
              Array.isArray(v) ? v.length > 0 : 
              typeof v === 'object' ? v.min > 0 || v.max < 999999 :
              v > 0
            ) && (
              <span style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem'
              }}>
                •
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '25px',
              fontSize: '1rem',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="name">Sort by Name</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>

        {/* Filter Modal */}
        {showFilters && (
          <ClothesFilterModal
            filters={filters}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
            }}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Active Filters Display */}
        {Object.values(filters).some(v => 
          Array.isArray(v) ? v.length > 0 : 
          typeof v === 'object' ? v.min > 0 || v.max < 999999 :
          v > 0
        ) && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 'bold' }}>Active Filters:</span>
              
              {filters.categories.map(category => (
                <span
                  key={category}
                  style={{
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {category.replace('_', ' ')}
                  <button
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        categories: prev.categories.filter(c => c !== category)
                      }));
                      setCurrentPage(1);
                    }}
                    style={{ background: 'none', border: 'none', color: '#4338ca', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {filters.sizes.map(size => (
                <span
                  key={size}
                  style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  Size: {size}
                  <button
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        sizes: prev.sizes.filter(s => s !== size)
                      }));
                      setCurrentPage(1);
                    }}
                    style={{ background: 'none', border: 'none', color: '#92400e', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {filters.colors.map(color => (
                <span
                  key={color}
                  style={{
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {color}
                  <button
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        colors: prev.colors.filter(c => c !== color)
                      }));
                      setCurrentPage(1);
                    }}
                    style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {filters.materials.map(material => (
                <span
                  key={material}
                  style={{
                    backgroundColor: '#fce7f3',
                    color: '#be185d',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {material}
                  <button
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        materials: prev.materials.filter(m => m !== material)
                      }));
                      setCurrentPage(1);
                    }}
                    style={{ background: 'none', border: 'none', color: '#be185d', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {(filters.priceRange.min > 0 || filters.priceRange.max < 999999) && (
                <span
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0277bd',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  ₹{filters.priceRange.min} - ₹{filters.priceRange.max === 999999 ? '∞' : filters.priceRange.max}
                  <button
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        priceRange: { min: 0, max: 999999 }
                      }));
                      setCurrentPage(1);
                    }}
                    style={{ background: 'none', border: 'none', color: '#0277bd', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.discount > 0 && (
                <span
                  style={{
                    backgroundColor: '#f3e8ff',
                    color: '#7c3aed',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  Min {filters.discount}% off
                  <button
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        discount: 0
                      }));
                      setCurrentPage(1);
                    }}
                    style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                onClick={() => {
                  setFilters({
                    categories: [],
                    priceRange: { min: 0, max: 999999 },
                    discount: 0,
                    sizes: [],
                    colors: [],
                    materials: []
                  });
                  setCurrentPage(1);
                }}
                style={{
                  backgroundColor: '#f87171',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div style={{ 
          marginBottom: '2rem',
          fontSize: '1.1rem',
          color: '#64748b',
          fontWeight: '500'
        }}>
          Showing {paginatedProducts.length} of {filteredProducts.length} clothing items
          {searchTerm && ` matching "${searchTerm}"`}
          {Object.values(filters).some(v => 
            Array.isArray(v) ? v.length > 0 : 
            typeof v === 'object' ? v.min > 0 || v.max < 999999 :
            v > 0
          ) && ' with active filters'}
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </div>

        {/* Products Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {paginatedProducts.map((product, index) => (
            <ClothesProductCard
              key={`${product.id || product.name || product.keyword || index}`}
              product={product}
              onAddToCart={handleAddToCart}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem'
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
                    backgroundColor: currentPage === pageNum ? '#667eea' : 'white',
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

        {/* No Results Message */}
        {filteredProducts.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No items found</h3>
            <p>Try adjusting your search terms or category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClothesPage;
