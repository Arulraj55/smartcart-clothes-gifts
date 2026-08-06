import React, { useState, useMemo } from 'react';
import './ProductDetail.css';
import { resolveImageUrl } from '../utils/resolveImageUrl';
import { stripHtml } from '../utils/stripHtml';

const ProductDetail = ({ 
  product, 
  onClose, 
  onAddToCart, 
  onBuyNow, 
  isWishlisted = false,
  onToggleWishlist 
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
  const cleanDescription = stripHtml(product.description || `${product.name} by ${product.seller || 'SmartCart'}. Designed for maximum comfort, durability and modern style.`);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto border border-gray-100">
        
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
              Product Details Pop-Up
            </span>
            <span className="text-xs font-semibold text-gray-500 hidden sm:inline-block">
              {product.seller || 'SmartCart'} • {product.category}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(product)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isWishlisted ? 'bg-pink-600 text-white shadow-md' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                }`}
              >
                <span>{isWishlisted ? '♥ Saved in Wishlist' : '♡ Add to Favorites'}</span>
              </button>
            )}
            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-lg transition-all"
              aria-label="Close Pop-Up"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                <img 
                  src={proxied(images[activeIndex])} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-top"
                />
                {discountPct && (
                  <div className="absolute top-3 left-3 bg-pink-600 text-white font-black text-xs px-3 py-1 rounded-lg shadow-md">
                    {discountPct} OFF
                  </div>
                )}
                {isSpecial && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white font-black text-xs px-3 py-1 rounded-lg shadow-md">
                    ★ SPECIAL PRICE BADGE
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveIndex(i)}
                      className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        i === activeIndex ? 'border-pink-600 ring-2 ring-pink-300' : 'border-gray-200 opacity-70'
                      }`}
                    >
                      <img src={proxied(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-5">
              
              {/* Seller & Title */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <span className="text-pink-600 font-extrabold">{product.seller || 'SmartCart Retail'}</span>
                  <span>•</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{product.category}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-green-700 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                  <span>{ratingVal}</span>
                  <span>★</span>
                </div>
                <span className="text-xs font-bold text-gray-500">
                  {ratingCount} Ratings & Verified Reviews
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-3xl font-black text-gray-900">₹{displayPrice}</span>
                {originalPrice > displayPrice && (
                  <span className="text-base line-through text-gray-400 font-semibold">₹{originalPrice}</span>
                )}
                {discountPct && (
                  <span className="text-xs font-black text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full">
                    {discountPct} Off
                  </span>
                )}
              </div>

              {/* COLOR SECTION - Prominently Displayed */}
              <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-700">Available Color</span>
                  <span className="text-xs font-extrabold text-gray-900 bg-white px-3 py-1 rounded-full border border-pink-200 shadow-sm">
                    🎨 {product.color || selectedColor}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  {[(product.color || 'Default'), 'Black', 'Blue', 'Red'].slice(0, 4).map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedColor === col
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Offers */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Available Offers</h3>
                <ul className="grid grid-cols-1 gap-2">
                  {defaultOffers.map((o, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-green-50/60 border border-green-100 p-2.5 rounded-xl">
                      <span className="text-green-600 font-bold">🏷️</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Size Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Select {isFootwear ? 'Shoe Size (UK/IND)' : 'Apparel Size'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-11 rounded-xl text-xs font-black transition-all border ${
                        selectedSize === size 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Check */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Delivery Options & Pincode
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={pincode} 
                    onChange={e => { setPincode(e.target.value.replace(/[^0-9]/g, '')); setPincodeChecked(false); }} 
                    maxLength={6} 
                    placeholder="Enter 6-digit pincode"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button 
                    disabled={pincode.length !== 6} 
                    onClick={() => setPincodeChecked(true)}
                    className="px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-pink-700 transition-colors"
                  >
                    Check
                  </button>
                </div>
                {pincodeChecked && (
                  <div className="text-green-700 font-bold text-xs mt-1">
                    ✓ Delivery available by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()} (Free Shipping)
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                  onClick={handleAdd}
                  className="py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>Add to Cart</span>
                  <span>🛒</span>
                </button>
                <button 
                  onClick={handleBuy}
                  className="py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>Buy Now</span>
                  <span>⚡</span>
                </button>
              </div>

            </div>
          </div>

          {/* Description (Stripped HTML) & Highlights */}
          <div className="space-y-6 pt-6 border-t border-gray-100">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {cleanDescription}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">Product Highlights & Specs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white p-3 rounded-xl border border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Default Bottom Line */}
            <div className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 py-3.5 px-4 rounded-2xl border border-gray-200">
              🛡️ 10-Day Easy Replacement Policy | Cash on Delivery Available | 100% Guaranteed Authentic Product
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
