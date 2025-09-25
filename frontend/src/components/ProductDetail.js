import React, { useState, useMemo } from 'react';

// Product Detail Page / Panel
// Props: product, onClose, onAddToCart(product), onBuyNow(product), isAuthenticated, onAuthRequired
const ProductDetail = ({ product, onClose, onAddToCart, onBuyNow, isAuthenticated, onAuthRequired }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Default');
  const [pincode, setPincode] = useState('');

  const pricing = useMemo(() => {
    const price = product.price || 0;
    // Derive original price if not explicitly provided
    let originalPrice = product.originalPrice;
    let discountPct = product.discount;
    if (!originalPrice && discountPct) {
      originalPrice = Math.round(price / (1 - discountPct / 100));
    } else if (originalPrice && !discountPct) {
      discountPct = Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return { price, originalPrice, discountPct };
  }, [product]);

  const handleAdd = () => {
    if (!isAuthenticated) { onAuthRequired(); return; }
    onAddToCart({ ...product, selectedSize, selectedColor });
  };

  const handleBuy = async () => {
    if (!isAuthenticated) { onAuthRequired(); return; }
    const added = await onBuyNow({ ...product, selectedSize, selectedColor });
    if (!added) {
      // Fallback attempt
      onAddToCart({ ...product, selectedSize, selectedColor });
    }
  };

  const offerBadges = [
    'Extra 20% off (Auto Applied)',
    '5% Cashback on SmartCart Pay',
    'No Cost EMI from ₹499/mo',
    'Free Delivery for Members'
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#4f46e5', marginBottom: '1rem' }}>← Back</button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {/* Left: Image */}
          <div style={{ flex: '1 1 340px', minWidth: '300px' }}>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <img
                src={(product.image || '').startsWith('http')
                  ? `${(typeof window!== 'undefined' && (window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1') ? 'http://localhost:5000' : '')}/api/images/proxy?url=${encodeURIComponent(product.image)}`
                  : product.image}
                alt={product.name}
                style={{ width: '100%', objectFit: 'cover', aspectRatio: '3/4', background: '#f3f4f6' }}
              />
              {pricing.discountPct > 0 && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#dc2626', color: 'white', padding: '0.4rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {pricing.discountPct}% OFF
                </div>
              )}
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleAdd} style={{ flex: 1, background: '#2563eb', color: 'white', border: 'none', padding: '0.9rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Add to Cart</button>
              <button onClick={handleBuy} style={{ flex: 1, background: 'linear-gradient(90deg,#f59e0b,#d97706)', color: 'white', border: 'none', padding: '0.9rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Buy Now</button>
            </div>
          </div>

          {/* Right: Info */}
          <div style={{ flex: '1 1 480px', minWidth: '320px' }}>
            <h1 style={{ fontSize: '1.75rem', lineHeight: 1.2, margin: '0 0 0.75rem', color: '#111827' }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ background: '#16a34a', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{(parseFloat(product.rating) || 4.5).toFixed(1)} ★</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{product.reviews || Math.floor(Math.random()*200+20)} ratings</div>
              <div style={{ fontSize: '0.85rem', color: '#9333ea', fontWeight: 500 }}>Special price</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 600, color: '#059669' }}>₹{pricing.price}</span>
              {pricing.originalPrice && pricing.originalPrice > pricing.price && (
                <span style={{ textDecoration: 'line-through', color: '#6b7280', fontSize: '0.95rem' }}>₹{pricing.originalPrice}</span>
              )}
              {pricing.discountPct > 0 && (
                <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>{pricing.discountPct}% off</span>
              )}
            </div>

            {/* Offers */}
            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#111827' }}>Available offers</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {offerBadges.map(o => (
                  <li key={o} style={{ fontSize: '0.8rem', color: '#374151', display: 'flex', gap: '0.5rem' }}>
                    <span>🏷️</span>{o}
                  </li>
                ))}
              </ul>
            </div>

            {/* Size Selector (clothes) */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Size</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', border: selectedSize === size ? '2px solid #2563eb' : '1px solid #d1d5db', background: selectedSize === size ? '#eff6ff' : 'white', cursor: 'pointer', fontWeight: 600 }}>{size}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Color</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.colors.slice(0, 8).map(color => (
                    <button key={color} onClick={() => setSelectedColor(color)} style={{ padding: '0.45rem 0.75rem', fontSize: '0.65rem', borderRadius: '20px', border: selectedColor === color ? '2px solid #2563eb' : '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize' }}>{color}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery checker */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Delivery</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={pincode} onChange={e=>setPincode(e.target.value.replace(/[^0-9]/g,''))} maxLength={6} placeholder="Enter pincode" style={{ flex: 1, padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem' }} />
                <button disabled={pincode.length!==6} style={{ padding: '0.55rem 0.9rem', background: pincode.length===6 ? '#10b981' : '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: pincode.length===6 ? 'pointer':'not-allowed' }}>Check</button>
              </div>
              {pincode.length===6 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#059669' }}>Delivery by {new Date(Date.now()+3*24*60*60*1000).toLocaleDateString()} (estimated)</div>
              )}
            </div>

            {/* Seller */}
            <div style={{ marginBottom: '1.25rem', fontSize: '0.8rem', color: '#374151' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Seller</div>
              <div>SmartCart Retail (4.3 ★)</div>
              <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>10 day return policy • Cash on Delivery available</div>
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Description</div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#4b5563', margin: 0 }}>{product.description}</p>
              </div>
            )}

            {/* Highlights (derive from available fields) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Highlights</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'disc inside', fontSize: '0.75rem', color: '#4b5563', display: 'grid', gap: '0.3rem' }}>
                {product.fabric && <li>Fabric: {product.fabric}</li>}
                {product.material && <li>Material: {product.material}</li>}
                {product.gender && <li>For: {product.gender}</li>}
                {product.occasion && <li>Occasion: {product.occasion}</li>}
                {product.ageGroup && <li>Age Group: {product.ageGroup}</li>}
                <li>Fast & secure delivery</li>
                <li>Quality checked</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
