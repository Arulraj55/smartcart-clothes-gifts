import React, { useState } from 'react';

const FilterPanel = ({ type, filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (category, value) => {
    const newFilters = { ...localFilters };
    
    if (category === 'priceRange') {
      newFilters.priceRange = value;
    } else if (Array.isArray(newFilters[category])) {
      if (newFilters[category].includes(value)) {
        newFilters[category] = newFilters[category].filter(item => item !== value);
      } else {
        newFilters[category] = [...newFilters[category], value];
      }
    } else {
      newFilters[category] = value;
    }
    
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters = type === 'clothes' ? {
      gender: [],
      priceRange: { min: 0, max: 5000 },
      sizes: [],
      colors: [],
      brands: [],
      fabrics: [],
      discountRange: 0
    } : {
      occasion: [],
      ageGroup: [],
      priceRange: { min: 0, max: 3000 },
      materials: [],
      giftTypes: [],
      deliverySpeed: [],
      discountRange: 0
    };
    
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const FilterSection = ({ title, children }) => (
    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{ 
        color: '#1f2937', 
        marginBottom: '1rem', 
        fontSize: '1.1rem',
        fontWeight: 'bold',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0.5rem'
      }}>
        {title}
      </h4>
      {children}
    </div>
  );

  const CheckboxGroup = ({ options, category, selectedValues }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
      {options.map(option => (
        <label key={option} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '8px',
          backgroundColor: selectedValues.includes(option) ? '#ddd6fe' : '#f9fafb',
          border: `2px solid ${selectedValues.includes(option) ? '#8b5cf6' : '#e5e7eb'}`,
          transition: 'all 0.3s ease'
        }}>
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={() => handleFilterChange(category, option)}
            style={{ marginRight: '0.5rem' }}
          />
          <span style={{ 
            fontSize: '0.9rem', 
            color: selectedValues.includes(option) ? '#5b21b6' : '#374151',
            fontWeight: selectedValues.includes(option) ? 'bold' : 'normal'
          }}>
            {option}
          </span>
        </label>
      ))}
    </div>
  );

  const PriceRangeSlider = ({ min, max, value, onChange }) => (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ color: '#6b7280' }}>₹{value.min}</span>
        <span style={{ color: '#6b7280' }}>₹{value.max}</span>
      </div>
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value.min}
          onChange={(e) => onChange({ ...value, min: parseInt(e.target.value) })}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(to right, #8b5cf6, #e5e7eb)',
            outline: 'none',
            appearance: 'none'
          }}
        />
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value.max}
          onChange={(e) => onChange({ ...value, max: parseInt(e.target.value) })}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(to right, #e5e7eb, #8b5cf6)',
            outline: 'none',
            appearance: 'none'
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: '#1f2937', margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>
              🔍 Filter {type === 'clothes' ? 'Clothes' : 'Gifts'}
            </h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Find exactly what you're looking for
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {type === 'clothes' ? (
            <>
              <div>
                <FilterSection title="👫 Gender">
                  <CheckboxGroup 
                    options={['men', 'women', 'unisex']}
                    category="gender"
                    selectedValues={localFilters.gender || []}
                  />
                </FilterSection>

                <FilterSection title="📏 Size">
                  <CheckboxGroup 
                    options={['S', 'M', 'L', 'XL']}
                    category="sizes"
                    selectedValues={localFilters.sizes || []}
                  />
                </FilterSection>

                <FilterSection title="🎨 Color">
                  <CheckboxGroup 
                    options={['White', 'Black', 'Blue', 'Red', 'Green', 'Gray', 'Navy', 'Pink']}
                    category="colors"
                    selectedValues={localFilters.colors || []}
                  />
                </FilterSection>
              </div>

              <div>
                <FilterSection title="🏷️ Brand">
                  <CheckboxGroup 
                    options={['FashionHub', 'DenimCraft', 'StyleMax', 'ElegantWear', 'SportWear', 'FormalWear', 'BohoStyle']}
                    category="brands"
                    selectedValues={localFilters.brands || []}
                  />
                </FilterSection>

                <FilterSection title="🧵 Fabric">
                  <CheckboxGroup 
                    options={['Cotton', 'Denim', 'Silk', 'Chiffon', 'Polyester', 'Wool Blend', 'Rayon']}
                    category="fabrics"
                    selectedValues={localFilters.fabrics || []}
                  />
                </FilterSection>

                <FilterSection title="💰 Price Range">
                  <PriceRangeSlider 
                    min={0}
                    max={5000}
                    value={localFilters.priceRange || { min: 0, max: 5000 }}
                    onChange={(value) => handleFilterChange('priceRange', value)}
                  />
                </FilterSection>
              </div>
            </>
          ) : (
            <>
              <div>
                <FilterSection title="🎉 Occasion">
                  <CheckboxGroup 
                    options={['birthday', 'anniversary', 'festive']}
                    category="occasion"
                    selectedValues={localFilters.occasion || []}
                  />
                </FilterSection>

                <FilterSection title="👨‍👩‍👧‍👦 Age Group">
                  <CheckboxGroup 
                    options={['kids', 'adults']}
                    category="ageGroup"
                    selectedValues={localFilters.ageGroup || []}
                  />
                </FilterSection>

                <FilterSection title="🧱 Material">
                  <CheckboxGroup 
                    options={['ceramic', 'wooden', 'plastic', 'digital', 'wax', 'mixed']}
                    category="materials"
                    selectedValues={localFilters.materials || []}
                  />
                </FilterSection>
              </div>

              <div>
                <FilterSection title="🎁 Gift Type">
                  <CheckboxGroup 
                    options={['personalized', 'handmade', 'bulk']}
                    category="giftTypes"
                    selectedValues={localFilters.giftTypes || []}
                  />
                </FilterSection>

                <FilterSection title="🚚 Delivery Speed">
                  <CheckboxGroup 
                    options={['standard', 'express']}
                    category="deliverySpeed"
                    selectedValues={localFilters.deliverySpeed || []}
                  />
                </FilterSection>

                <FilterSection title="💰 Price Range">
                  <PriceRangeSlider 
                    min={0}
                    max={3000}
                    value={localFilters.priceRange || { min: 0, max: 3000 }}
                    onChange={(value) => handleFilterChange('priceRange', value)}
                  />
                </FilterSection>
              </div>
            </>
          )}
        </div>

        {/* Discount Filter for both */}
        <FilterSection title="🏷️ Minimum Discount">
          <div style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#6b7280' }}>0%</span>
              <span style={{ color: '#6b7280' }}>30%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              value={localFilters.discountRange || 0}
              onChange={(e) => handleFilterChange('discountRange', parseInt(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'linear-gradient(to right, #ef4444, #fca5a5)',
                outline: 'none',
                appearance: 'none'
              }}
            />
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                Minimum {localFilters.discountRange || 0}% off
              </span>
            </div>
          </div>
        </FilterSection>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '2rem',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1.5rem'
        }}>
          <button
            onClick={clearFilters}
            style={{
              flex: 1,
              padding: '1rem',
              background: '#f3f4f6',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
            }}
          >
            🧹 Clear All
          </button>
          <button
            onClick={applyFilters}
            style={{
              flex: 2,
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
            }}
          >
            ✨ Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
