import React, { useMemo, useState } from 'react';
import '../../theme/tokens.css';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

export default function ModernProductCard({
  product,
  onAdd,
  onAddToCart,
  onView,
  onViewProduct,
  isAuthenticated,
  onAuth,
  size = 'md',
  isFavorite = false,
  isWishlisted = false,
  onToggleFavorite,
  onToggleWishlist
}) {
  const originalImage = useMemo(() => product?.image || product?.images?.[0] || '', [product]);
  const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(originalImage));

  const handleCardClick = () => {
    const handleView = onViewProduct || onView;
    if (handleView) handleView(product);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    const handleCart = onAddToCart || onAdd;
    if (handleCart) {
      handleCart(product);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    const handleWish = onToggleWishlist || onToggleFavorite;
    if (handleWish) handleWish(product);
  };

  const favorited = isWishlisted || isFavorite;

  const displayPrice = product.discounted_price || product.price || 0;
  const originalPrice = product.price > displayPrice ? product.price : (product.originalPrice || null);
  const discountPct = product.discount_percentage || product.discount || (
    originalPrice && originalPrice > displayPrice
      ? `${Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%`
      : null
  );

  const ratingVal = parseFloat(product.rating || product.ratings || 4.2).toFixed(1);
  const ratingCount = product.rating_count || product.ratings_count || 150;
  const isSpecial = Boolean(product.is_special_price || product.special_price_badge);

  return (
    <div 
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Top Badges */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        {isSpecial ? (
          <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
            Special Price
          </span>
        ) : <span />}

        {discountPct && (
          <span className="bg-pink-600 text-white text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md shadow-sm ml-auto">
            {discountPct} OFF
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50">
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            favorited 
              ? 'bg-pink-600 text-white shadow-md scale-105' 
              : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-pink-600 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          {favorited ? '♥' : '♡'}
        </button>

        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={() => {
            if (originalImage && imgSrc !== originalImage) {
              setImgSrc(originalImage);
            }
          }}
        />
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Seller / Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-1">
            <span className="truncate max-w-[120px] text-pink-600 font-semibold">{product.seller || 'SmartCart'}</span>
            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
              {product.category || 'Apparel'}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-pink-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 my-1">
            <div className="flex items-center gap-0.5 bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              <span>{ratingVal}</span>
              <span>★</span>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">({ratingCount})</span>
            {product.color && (
              <span className="ml-auto text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[70px]">
                {product.color}
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-base font-black text-gray-900">₹{displayPrice}</span>
            {originalPrice && originalPrice > displayPrice && (
              <span className="text-xs line-through text-gray-400 font-semibold">₹{originalPrice}</span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            type="button"
            onClick={handleAddClick}
            className="w-full mt-3 py-2 bg-pink-600 hover:bg-pink-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span>Add to Cart</span>
            <span>🛒</span>
          </button>
        </div>
      </div>
    </div>
  );
}
