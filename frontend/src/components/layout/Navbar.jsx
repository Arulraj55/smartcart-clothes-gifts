import React from 'react';
import '../../theme/tokens.css';

export default function Navbar({
  onNavigate,
  onAuthClick,
  onCartClick,
  onWishlistClick,
  cartCount,
  wishlistCount,
  user,
  onLogout,
  currentPage = 'home'
}) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-24 flex items-center justify-between gap-6 py-3.5">
        
        {/* Brand Logo & Main Nav Links */}
        <div className="flex items-center gap-8">
          <div 
            className="text-2xl font-black tracking-tight text-pink-600 cursor-pointer flex items-center gap-1"
            onClick={() => onNavigate && onNavigate('home')}
          >
            SMART<span className="text-gray-900">CART</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full ml-1 border border-pink-100 hidden sm:inline-block">
              Clothes & Footwear
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                currentPage === 'home' 
                  ? 'bg-pink-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate && onNavigate('clothes')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                currentPage === 'clothes' 
                  ? 'bg-pink-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              Clothes (18 Categories)
            </button>
            <button
              onClick={() => onNavigate && onNavigate('footwear')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                currentPage === 'footwear' 
                  ? 'bg-pink-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              Footwear (14 Categories)
            </button>
          </nav>
        </div>

        {/* User / Wishlist / Cart Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onWishlistClick}
            className="relative flex items-center gap-1.5 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors px-3.5 py-1.5 text-xs font-bold text-pink-600"
            aria-label="Open wishlist"
          >
            <span>Wishlist</span>
            <span>♥</span>
            {wishlistCount > 0 && (
              <span className="bg-pink-600 text-white text-[10px] font-bold px-1.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate && onNavigate('my-orders')}
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors px-3.5 py-1.5 text-xs font-bold text-blue-600"
            aria-label="View my orders"
          >
            <span>Orders</span>
            <span>🧾</span>
          </button>

          <button
            onClick={onCartClick}
            className="relative flex items-center gap-1.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-colors px-4 py-1.5 text-xs font-bold shadow-sm"
            aria-label="Open cart"
          >
            <span>Cart</span>
            <span>🛒</span>
            {cartCount > 0 && (
              <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 rounded-full ml-1">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 border-l pl-3 border-gray-200">
              <span className="text-xs font-semibold text-gray-700 hidden lg:inline-block">
                Hi, {user.name ? user.name.split(' ')[0] : 'User'}
              </span>
              <button
                onClick={onLogout}
                className="rounded-full border border-gray-300 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={onAuthClick} 
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-sm transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around bg-gray-50 border-t border-gray-200 py-2 px-4 text-xs font-bold text-gray-700">
        <button onClick={() => onNavigate && onNavigate('home')} className={currentPage === 'home' ? 'text-pink-600' : ''}>Home</button>
        <button onClick={() => onNavigate && onNavigate('clothes')} className={currentPage === 'clothes' ? 'text-pink-600' : ''}>Clothes (18)</button>
        <button onClick={() => onNavigate && onNavigate('footwear')} className={currentPage === 'footwear' ? 'text-pink-600' : ''}>Footwear (14)</button>
      </div>
    </header>
  );
}
