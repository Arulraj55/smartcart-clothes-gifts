import React, { useState, useMemo } from 'react';
import './ProductDetail.css';

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

  // Allow optional gallery thumbs if multiple images present (fallback to single)
  const images = product.images && product.images.length ? product.images : [product.image];
  const [activeIndex, setActiveIndex] = useState(0);

  const proxied = (url) => (url||'').startsWith('http')
    ? `${(typeof window!== 'undefined' && (window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1') ? 'http://localhost:5000' : '')}/api/images/proxy?url=${encodeURIComponent(url)}`
    : url;

  return (
    <div className="product-detail-wrapper">
      <div className="product-detail-shell">
        <button className="pd-back" onClick={onClose}>← Back</button>
        <div className="pd-grid">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-thumbs">
              {images.map((img,i)=>(
                <div key={i} className={`pd-thumb ${i===activeIndex?'active':''}`} onClick={()=>setActiveIndex(i)}>
                  <img src={proxied(img)} alt={`${product.name} ${i+1}`} />
                </div>
              ))}
            </div>
            <div className="pd-main-img">
              <img src={proxied(images[activeIndex])} alt={product.name} />
              {pricing.discountPct>0 && <div className="pd-discount-badge">{pricing.discountPct}% OFF</div>}
            </div>
          </div>

          {/* Summary / Info */}
          <div className="pd-summary">
            <h1 className="pd-title">{product.name}</h1>
            <div className="pd-subline" style={{gap:'.6rem'}}>
              <div className="pd-rating">{(parseFloat(product.rating)||4.5).toFixed(1)} <span>★</span></div>
              <div className="pd-ratings-count">{product.reviews || Math.floor(Math.random()*200+20)} ratings</div>
              <div className="pd-special">Special Price</div>
            </div>
            <div className="pd-pricing">
              <div className="pd-price-now">₹{pricing.price}</div>
              {pricing.originalPrice && pricing.originalPrice>pricing.price && <div className="pd-price-original">₹{pricing.originalPrice}</div>}
              {pricing.discountPct>0 && <div className="pd-price-discount">{pricing.discountPct}% off</div>}
            </div>

            <div className="pd-offers">
              <h3>Available Offers</h3>
              <ul className="pd-offer-list">
                {offerBadges.map(o=> <li key={o} className="pd-offer-item"><span>🏷️</span>{o}</li>)}
              </ul>
            </div>

            {product.sizes?.length>0 && (
              <div className="pd-selector-block">
                <div className="pd-selector-label">Size</div>
                <div className="pd-size-grid">
                  {product.sizes.map(size => (
                    <button key={size} className={`pd-size-btn ${selectedSize===size?'active':''}`} onClick={()=>setSelectedSize(size)}>{size}</button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length>0 && (
              <div className="pd-selector-block">
                <div className="pd-selector-label">Color</div>
                <div className="pd-color-grid">
                  {product.colors.slice(0,8).map(color => (
                    <button key={color} className={`pd-color-btn ${selectedColor===color?'active':''}`} onClick={()=>setSelectedColor(color)}>{color}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="pd-delivery">
              <div className="pd-selector-label">Delivery</div>
              <div className="pd-pin-row">
                <input value={pincode} onChange={e=>setPincode(e.target.value.replace(/[^0-9]/g,''))} maxLength={6} placeholder="Enter pincode" />
                <button disabled={pincode.length!==6}>Check</button>
              </div>
              {pincode.length===6 && <div className="pd-pin-result">Delivery by {new Date(Date.now()+3*24*60*60*1000).toLocaleDateString()} (estimated)</div>}
            </div>

            <div className="pd-seller">
              <strong>Seller</strong>
              <div>SmartCart Retail (4.3 ★)</div>
              <small>10 day return policy • Cash on Delivery available</small>
            </div>

            <div className="pd-actions">
              <button className="pd-btn-add" onClick={handleAdd}>Add to Cart</button>
              <button className="pd-btn-buy" onClick={handleBuy}>Buy Now</button>
            </div>
          </div>
        </div>

        <div className="pd-extended">
          {product.description && (
            <div className="pd-block">
              <h3>Description</h3>
              <p className="pd-desc">{product.description}</p>
            </div>
          )}
          <div className="pd-block">
            <h3>Highlights</h3>
            <ul className="pd-highlights">
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
  );
};

export default ProductDetail;
