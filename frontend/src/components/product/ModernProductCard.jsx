import React from 'react';
import '../../theme/tokens.css';

export default function ModernProductCard({
  product,
  onAdd,
  onView,
  isAuthenticated,
  onAuth,
  size = 'md',
  isFavorite = false,
  onToggleFavorite
}) {
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;
  const large = size === 'lg' || size === 'xl';
  const xl = size === 'xl';
  return (
    <div className={`sc-card group ${large ? (xl ? 'p-5' : 'p-4') : ''}`}
      style={large ? { minHeight: xl ? 480 : 420 } : undefined}
    >
      {discount && (
        <span className="sc-badge absolute top-2 right-2">-{discount}%</span>
      )}
      <div className={`relative mb-3 rounded-lg overflow-hidden bg-gray-100 ${xl ? 'aspect-[3/3.2]' : large ? 'aspect-[3/3.6]' : 'aspect-[3/4]'}`}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            if (onToggleFavorite) onToggleFavorite(product);
          }}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isFavorite}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 2,
            width: 36,
            height: 36,
            borderRadius: '999px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isFavorite ? 'rgba(244, 63, 94, 0.95)' : 'rgba(255,255,255,0.85)',
            color: isFavorite ? '#fff' : '#ef4444',
            cursor: 'pointer',
            boxShadow: '0 12px 28px -18px rgba(244,63,94,0.45)'
          }}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover ${xl ? 'group-hover:scale-115' : large ? 'group-hover:scale-110' : 'group-hover:scale-105'} transition-transform duration-500`}
          loading="lazy"
          onClick={() => onView && onView(product)}
          style={{ cursor:'pointer' }}
        />
      </div>
      <div className={large ? (xl ? 'space-y-3' : 'space-y-2') : 'space-y-1'}>
        <h3 className={`${xl ? 'text-lg' : large ? 'text-base' : 'text-sm'} font-semibold text-gray-900 line-clamp-1`} title={product.name}>{product.name}</h3>
        {/* Subtitle line: prefer explicit subtitle, then collection/brand + category fallback */}
        <p className={`${xl ? 'text-sm' : large ? 'text-[12px]' : 'text-[11px]'} text-gray-500 font-medium`} style={{ marginTop: 4 }} title={product.subtitle || ''}>
          {product.subtitle ? product.subtitle : `${product.collection || product.brand || 'Classic Collection'}•${product.category || "Traditional Women's Wear"}`}
        </p>
        <div className="flex items-center gap-2">
          <span className={xl ? 'text-xl font-bold text-gray-900' : large ? 'text-lg font-bold text-gray-900' : 'sc-price'}>₹{product.price}</span>
          {product.originalPrice > product.price && <span className={xl ? 'text-sm line-through text-gray-400' : large ? 'text-xs line-through text-gray-400' : 'sc-price-strike'}>₹{product.originalPrice}</span>}
        </div>
        <div className={`flex gap-1 ${xl ? 'mt-4' : large ? 'mt-3' : 'mt-2'}`}>
          {(product.colors || ['#111827','#dc2626','#2563eb']).slice(0,3).map(c => (
            <span key={c} className="sc-color-dot" style={{ background:c }} />
          ))}
        </div>
        <button
          onClick={() => isAuthenticated ? onAdd && onAdd(product) : onAuth && onAuth()}
          className={`w-full ${xl ? 'mt-6 py-3 text-sm' : large ? 'mt-5 py-2.5 text-sm' : 'mt-4'} sc-btn-primary text-sm flex items-center justify-center gap-1`}
        >
          {isAuthenticated ? 'Add to Cart' : 'Sign In to Add'}
        </button>
      </div>
    </div>
  );
}
