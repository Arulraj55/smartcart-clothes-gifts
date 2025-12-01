import React from 'react';
import '../../theme/tokens.css';

// Removed category navigation per updated design (keep only brand + auth/cart)

export default function Navbar({
  onNavigate,
  onAuthClick,
  onCartClick,
  onWishlistClick,
  cartCount,
  wishlistCount,
  user,
  onLogout
}) {
  const highlightPills = ['Free Express Delivery', 'Personal Styling', 'Gift Wrap Ready'];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-24 flex items-center gap-6 py-3">
        <div className="text-2xl font-black tracking-tight text-pink-600 cursor-pointer" onClick={() => onNavigate('home')}>
          SMART<span className="text-gray-900">CART</span>
        </div>
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gray-500">
            {highlightPills.map((pill) => (
              <span key={pill} className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 shadow-sm flex items-center gap-2">
                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-pink-400" aria-hidden="true" />
                {pill}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-3 rounded-full bg-gradient-to-r from-pink-50 via-white to-blue-50 border border-white px-4 py-2 shadow-sm">
                <div className="flex flex-col leading-tight text-xs">
                  <span className="font-semibold text-gray-900">Hi, {user.name.split(' ')[0]}</span>
                  <span className="uppercase tracking-[0.28em] text-[10px] text-pink-500">Welcome back</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-pink-400" aria-hidden="true" />
              </div>
              <button
                onClick={onWishlistClick}
                className="relative flex items-center gap-2 rounded-full bg-pink-500/10 hover:bg-pink-500/20 transition-colors px-4 py-2 text-sm font-semibold text-pink-600"
                aria-label="Open wishlist"
              >
                <span>Wishlist</span>
                <span aria-hidden="true">♥</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold px-1.5 rounded-full shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onNavigate && onNavigate('my-orders')}
                className="flex items-center gap-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-colors px-4 py-2 text-sm font-semibold text-blue-600"
                aria-label="View my orders"
              >
                <span>My Orders</span>
                <span aria-hidden="true">🧾</span>
              </button>
              <button
                onClick={onCartClick}
                className="relative flex items-center gap-2 rounded-full bg-pink-500/10 hover:bg-pink-500/20 transition-colors px-4 py-2 text-sm font-semibold text-pink-600"
                aria-label="Open cart"
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold px-1.5 rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onWishlistClick}
                className="relative flex items-center gap-2 rounded-full bg-pink-500/10 hover:bg-pink-500/20 transition-colors px-4 py-2 text-sm font-semibold text-pink-600"
                aria-label="Open wishlist"
              >
                <span>Wishlist</span>
                <span aria-hidden="true">♡</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold px-1.5 rounded-full shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onNavigate && onNavigate('my-orders')}
                className="flex items-center gap-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-colors px-4 py-2 text-sm font-semibold text-blue-600"
                aria-label="View my orders"
              >
                <span>My Orders</span>
                <span aria-hidden="true">🧾</span>
              </button>
              <button onClick={onAuthClick} className="sc-btn-primary text-sm">Sign In</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
