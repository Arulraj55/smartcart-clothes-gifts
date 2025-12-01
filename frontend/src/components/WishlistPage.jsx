import React from 'react';
import ModernProductCard from './product/ModernProductCard';
import '../theme/tokens.css';

const WishlistPage = ({
  products = [],
  onAddToCart,
  isAuthenticated,
  onAuthRequired,
  onViewProduct,
  onToggleWishlist,
  onBrowseClothes,
  onBrowseGifts,
  onBackHome
}) => {
  const hasItems = products.length > 0;

  return (
    <main style={{ width: '100%', overflow: 'hidden' }}>
      <section
        style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          marginLeft: '-50vw',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(99, 102, 241, 0.18))',
          padding: '6rem 0 4rem'
        }}
      >
        <div style={{ width: 'min(1180px, 92vw)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: 540 }}>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#ec4899', fontWeight: 700 }}>Your favourites</span>
              <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Wishlist curated just for you</h1>
              <p style={{ margin: 0, fontSize: '1.05rem', color: '#475569' }}>
                Save and revisit the looks you love. Add them to your cart whenever you&apos;re ready to checkout.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', flex: '1 1 320px', minWidth: 260 }}>
              <div style={{
                borderRadius: 28,
                padding: '1.4rem',
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 24px 60px -44px rgba(15,23,42,0.28)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#ec4899', fontWeight: 700 }}>Auto Sync</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Saved across every device</span>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Stay signed in to access favourites instantly wherever you shop.</span>
              </div>
              <div style={{
                borderRadius: 28,
                padding: '1.4rem',
                background: 'rgba(255,255,255,0.82)',
                border: '1px solid rgba(255,255,255,0.45)',
                boxShadow: '0 24px 60px -44px rgba(99,102,241,0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#6366f1', fontWeight: 700 }}>Smart matches</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Feeds your suggestions</span>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Every favourite sharpens personalised recommendations.</span>
              </div>
              <div style={{
                borderRadius: 28,
                padding: '1.4rem',
                background: 'rgba(255,255,255,0.82)',
                border: '1px solid rgba(255,255,255,0.45)',
                boxShadow: '0 24px 60px -44px rgba(59,130,246,0.32)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 700 }}>Quick actions</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Move to cart in one tap</span>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Tap the heart again or choose Add to Cart right from your wishlist.</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', color: '#6b7280', fontWeight: 600, fontSize: '0.9rem' }}>
            <span>{hasItems ? `${products.length} saved ${products.length === 1 ? 'item' : 'items'}` : 'No favourites yet'}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(148, 163, 184, 0.6)' }} aria-hidden="true" />
            <span>Wishlist updates instantly across the site</span>
          </div>
        </div>
      </section>

      <section style={{ width: 'min(1180px, 92vw)', margin: '3.5rem auto 5rem' }}>
        {hasItems ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
            {products.map((product) => (
              <ModernProductCard
                key={`wishlist-${product.id || product._id}`}
                product={product}
                onAdd={onAddToCart}
                isAuthenticated={isAuthenticated}
                onAuth={onAuthRequired}
                onView={onViewProduct}
                size="xl"
                isFavorite
                onToggleFavorite={onToggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '4rem 3rem',
              borderRadius: 36,
              border: '1px dashed rgba(148,163,184,0.45)',
              background: 'rgba(255,255,255,0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '3.25rem' }}>♡</div>
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#111827' }}>Save your first favourite</h2>
            <p style={{ margin: 0, maxWidth: 420, color: '#6b7280', fontSize: '1rem' }}>
              Tap the heart icon on any product to build your wishlist. We&apos;ll tailor recommendations as you explore.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={onBrowseClothes}
                style={{
                  borderRadius: 999,
                  border: 'none',
                  padding: '0.85rem 1.65rem',
                  background: 'linear-gradient(135deg, #ec4899, #f97316)',
                  color: '#fff',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                Explore Clothing
              </button>
              <button
                onClick={onBrowseGifts}
                style={{
                  borderRadius: 999,
                  border: 'none',
                  padding: '0.85rem 1.65rem',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                Explore Gifts
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default WishlistPage;
