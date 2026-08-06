import React, { useState, useMemo } from 'react';
import './ProductDetail.css';
import { resolveImageUrl } from '../utils/resolveImageUrl';

const ProductDetail = ({ 
  product, 
  onClose, 
  onAddToCart, 
  onBuyNow, 
  isAuthenticated, 
  onAuthRequired 
}) => {
  const safeProduct = product || {};
  const isFootwear = safeProduct.type === 'footwear' || 
    ['sandals', 'sneakers', 'boots', 'flats', 'heels', 'loafers', 'slippers', 'clogs', 'shoes'].some(k => (safeProduct.category || '').toLowerCase().includes(k));

  const availableSizes = safeProduct.sizes && safeProduct.sizes.length > 0 
    ? safeProduct.sizes 
    : (isFootwear ? ["6", "7", "8", "9", "10", "11"] : ["XS", "S", "M", "L", "XL", "XXL"]);

  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(safeProduct.color || safeProduct.colors?.[0] || 'Default');
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const highlights = useMemo(() => {
    if (!product) return [];
    if (product.highlights && product.highlights.length >= 3) {
      return product.highlights;
    }
    if (isFootwear) {
      return [
        `Category: ${product.category || 'Footwear'}`,
        `Upper Material: Breathable Leather / Synthetic Mesh`,
        `Sole Material: High-Grip EVA Rubber Sole`,
        `Closure Type: Ergonomic Comfort Fit`,
        `Color: ${product.color || 'Standard'}`,
        `Sold by: ${product.seller || 'SmartCart Footwear'}`
      ];
    }
    return [
      `Category: ${product.category || 'Fashion Apparel'}`,
      `Material & Fabric: 100% Breathable Premium Cotton Blend`,
      `Fit Type: Tailored Regular Fit`,
      `Care Instructions: Gentle Machine Wash Cold`,
      `Color: ${product.color || 'Multicolor'}`,
      `Sold by: ${product.seller || 'SmartCart Retail'}`
    ];
  }, [product, isFootwear]);

  if (!product) return null;

  const displayPrice = product.discounted_price || product.price || 0;
  const originalPrice = product.price > displayPrice ? product.price : (product.originalPrice || Math.round(displayPrice * 1.5));
  const discountPct = product.discount_percentage || product.discount || `${Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%`;

  const ratingVal = parseFloat(product.rating || product.ratings || 4.3).toFixed(1);
  const ratingCount = product.rating_count || product.ratings_count || 180;
  const isSpecial = Boolean(product.is_special_price || product.special_price_badge);

  const handleAdd = () => {
    onAddToCart({ ...product, selectedSize, selectedColor });
  };

  const handleBuy = async () => {
    if (onBuyNow) {
      await onBuyNow({ ...product, selectedSize, selectedColor });
    } else if (onAddToCart) {
      onAddToCart({ ...product, selectedSize, selectedColor });
    }
  };

  const defaultOffers = [
    'Bank Offer: 10% Instant Discount on HDFC/SBI Credit Cards',
    'Special Promo: Extra 15% off on orders above ₹1,999',
    'SmartCart Pay: 5% Unlimited Cashback on Instant Checkout',
    'Partner Offer: Buy 2 Get Extra 10% Off automatically applied at cart'
  ];

  const images = product.images && product.images.length ? product.images : [product.image];
  const proxied = (url) => resolveImageUrl(url);

  return (
    <div className="product-detail-wrapper">
      <div className="product-detail-shell">
        <button className="pd-back" onClick={onClose}>← Back to Catalog</button>
        
        <div className="pd-grid">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <div key={i} className={`pd-thumb ${i === activeIndex ? 'active' : ''}`} onClick={() => setActiveIndex(i)}>
                  <img src={proxied(img)} alt={`${product.name} ${i + 1}`} />
                </div>
              ))}
            </div>
            <div className="pd-main-img relative">
              <img src={proxied(images[activeIndex])} alt={product.name} />
              {discountPct && <div className="pd-discount-badge">{discountPct} OFF</div>}
            </div>
          </div>

          {/* Product Info */}
          <div className="pd-summary">
            {/* Seller & Category */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              <span className="text-pink-600 font-extrabold">{product.seller || 'SmartCart Retail'}</span>
              <span>•</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{product.category}</span>
            </div>

            {/* Title */}
            <h1 className="pd-title">{product.name}</h1>

            {/* Rating & Special Price */}
            <div className="pd-subline" style={{ gap: '.6rem', flexWrap: 'wrap' }}>
              <div className="pd-rating">{ratingVal} <span>★</span></div>
              <div className="pd-ratings-count">{ratingCount} Ratings & Reviews</div>
              {isSpecial && <div className="pd-special">SPECIAL PRICE BADGE</div>}
            </div>

            {/* Pricing */}
            <div className="pd-pricing">
              <div className="pd-price-now">₹{displayPrice}</div>
              {originalPrice > displayPrice && (
                <div className="pd-price-original">₹{originalPrice}</div>
              )}
              {discountPct && <div className="pd-price-discount">{discountPct} off</div>}
            </div>

            {/* Color Tag */}
            {product.color && (
              <div className="my-2 text-xs font-semibold text-gray-700">
                Color: <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{product.color}</span>
              </div>
            )}

            {/* Available Offers */}
            <div className="pd-offers">
              <h3>Available Offers</h3>
              <ul className="pd-offer-list">
                {defaultOffers.map(o => (
                  <li key={o} className="pd-offer-item">
                    <span className="text-green-600 font-bold">🏷️</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Size Selector */}
            <div className="pd-selector-block">
              <div className="pd-selector-label">
                Select {isFootwear ? 'Shoe Size (UK/IND)' : 'Apparel Size'}
              </div>
              <div className="pd-size-grid">
                {availableSizes.map(size => (
                  <button 
                    key={size} 
                    className={`pd-size-btn ${selectedSize === size ? 'active' : ''}`} 
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Check */}
            <div className="pd-delivery">
              <div className="pd-selector-label">Delivery Options & Pincode</div>
              <div className="pd-pin-row">
                <input 
                  value={pincode} 
                  onChange={e => { setPincode(e.target.value.replace(/[^0-9]/g, '')); setPincodeChecked(false); }} 
                  maxLength={6} 
                  placeholder="Enter 6-digit pincode" 
                />
                <button 
                  disabled={pincode.length !== 6} 
                  onClick={() => setPincodeChecked(true)}
                >
                  Check
                </button>
              </div>
              {pincodeChecked && (
                <div className="pd-pin-result text-green-700 font-semibold mt-2 text-xs">
                  ✓ Delivery available by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()} (Free Shipping)
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="pd-seller">
              <strong>Seller Details</strong>
              <div>{product.seller || 'SmartCart Authorized Partner'} ({ratingVal} ★)</div>
            </div>

            {/* Actions */}
            <div className="pd-actions">
              <button className="pd-btn-add" onClick={handleAdd}>Add to Cart</button>
              <button className="pd-btn-buy" onClick={handleBuy}>Buy Now</button>
            </div>
          </div>
        </div>

        {/* Extended Info: Description, Highlights & Default Policy Line */}
        <div className="pd-extended">
          <div className="pd-block">
            <h3>Description</h3>
            <p className="pd-desc">{product.description || `${product.name} from ${product.seller || 'SmartCart'}. Designed for maximum comfort, durability and modern style.`}</p>
          </div>

          <div className="pd-block">
            <h3>Key Highlights & Specs</h3>
            <ul className="pd-highlights">
              {highlights.map((h, idx) => (
                <li key={idx}>{h}</li>
              ))}
            </ul>
          </div>

          {/* Last Line Default for all products */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50 py-3 rounded-xl">
            🛡️ 10-Day Easy Replacement Policy | Cash on Delivery Available | 100% Guaranteed Authentic Product
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
