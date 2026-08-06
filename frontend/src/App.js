import React, { useState, useMemo, useCallback } from 'react';
import './index.css';
import './theme/tokens.css';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';
import ClothesPage from './components/ClothesPage';
import FootwearPage from './components/FootwearPage';
import WishlistPage from './components/WishlistPage';
import ProductDetail from './components/ProductDetail';
import clothingCatalog from './data/clothing-catalog.json';
import footwearCatalog from './data/footwear-catalog.json';

// UI components
import Navbar from './components/layout/Navbar';
import HeroBanner from './components/home/HeroBanner';
import CategoryGrid from './components/home/CategoryGrid';
import ModernProductCard from './components/product/ModernProductCard';
import { getPersonalizedMLSuggestions } from './utils/mlRecommendationEngine';

const PAGE_PATHS = {
  home: '/',
  clothes: '/clothes',
  footwear: '/footwear',
  wishlist: '/wishlist',
  'verify-email': '/verify-email',
  product: '/product',
  'my-orders': '/my-orders'
};

const resolveInitialPage = () => {
  if (typeof window === 'undefined') return 'home';
  const { pathname } = window.location;
  if (pathname.startsWith(PAGE_PATHS['verify-email'])) return 'verify-email';
  if (pathname.startsWith(PAGE_PATHS.clothes)) return 'clothes';
  if (pathname.startsWith(PAGE_PATHS.footwear)) return 'footwear';
  if (pathname.startsWith(PAGE_PATHS.wishlist)) return 'wishlist';
  if (pathname.startsWith(PAGE_PATHS.product)) return 'product';
  if (pathname.startsWith(PAGE_PATHS['my-orders'])) return 'my-orders';
  return 'home';
};

const AppContent = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentPage, setCurrentPageState] = useState(resolveInitialPage);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeClothingCategory, setActiveClothingCategory] = useState('All');
  const [activeFootwearCategory, setActiveFootwearCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // User Experience State for ML Recommendation Engine
  const [userExperience, setUserExperience] = useState(() => {
    if (typeof window === 'undefined') return { clickedProducts: [], boughtProducts: [], clickedCategories: {}, clickedColors: {} };
    try {
      const saved = JSON.parse(window.localStorage.getItem('smartcart:userExperience') || '{}');
      return {
        clickedProducts: saved.clickedProducts || [],
        boughtProducts: saved.boughtProducts || [],
        clickedCategories: saved.clickedCategories || {},
        clickedColors: saved.clickedColors || {}
      };
    } catch {
      return { clickedProducts: [], boughtProducts: [], clickedCategories: {}, clickedColors: {} };
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(window.localStorage.getItem('smartcart:wishlist') || '[]');
      return Array.isArray(saved) ? saved.map((id) => String(id)) : [];
    } catch {
      return [];
    }
  });

  const { user, logout, isAuthenticated, loading } = useAuth();

  const navigate = useCallback(
    (page, { replace = false, state = {}, skipHistory = false } = {}) => {
      setCurrentPageState(page);
      if (skipHistory || typeof window === 'undefined') return;
      const targetPath = PAGE_PATHS[page] || PAGE_PATHS.home;
      const historyState = { page, ...state };
      if (replace) {
        window.history.replaceState(historyState, '', targetPath);
      } else {
        window.history.pushState(historyState, '', targetPath);
      }
    },
    []
  );

  // Record user interaction for ML Recommendation Engine
  const recordUserInteraction = useCallback((product, actionType = 'click') => {
    if (!product) return;
    setUserExperience((prev) => {
      const clickedProducts = [product, ...prev.clickedProducts.filter(p => String(p.id || p._id) !== String(product.id || product._id))].slice(0, 40);
      const boughtProducts = actionType === 'buy' 
        ? [product, ...prev.boughtProducts.filter(p => String(p.id || p._id) !== String(product.id || product._id))].slice(0, 40)
        : prev.boughtProducts;

      const categoryWeight = actionType === 'buy' ? 4 : 1;
      const colorWeight = actionType === 'buy' ? 3 : 1;

      const cat = product.category || 'Apparel';
      const col = product.color || 'Default';

      const clickedCategories = {
        ...prev.clickedCategories,
        [cat]: (prev.clickedCategories[cat] || 0) + categoryWeight
      };

      const clickedColors = {
        ...prev.clickedColors,
        [col]: (prev.clickedColors[col] || 0) + colorWeight
      };

      const nextExp = { clickedProducts, boughtProducts, clickedCategories, clickedColors };
      try {
        window.localStorage.setItem('smartcart:userExperience', JSON.stringify(nextExp));
      } catch {}
      return nextExp;
    });
  }, []);

  const handleViewProduct = useCallback((product) => {
    recordUserInteraction(product, 'click');
    setSelectedProduct(product);
  }, [recordUserInteraction]);

  const handleSelectCategory = useCallback((type, category) => {
    if (type === 'clothes') {
      setActiveClothingCategory(category);
      navigate('clothes');
    } else {
      setActiveFootwearCategory(category);
      navigate('footwear');
    }
  }, [navigate]);

  const wishlistSet = useMemo(() => new Set(wishlist.map(id => String(id))), [wishlist]);
  const wishlistProducts = useMemo(() => {
    const all = [...clothingCatalog, ...footwearCatalog];
    return all.filter(p => wishlistSet.has(String(p.id || p._id)));
  }, [wishlistSet]);

  // Trending Now Collection (Top Rated 4 Clothes + 4 Footwear)
  const trendingNowProducts = useMemo(() => {
    const topClothes = [...clothingCatalog].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    const topFootwear = [...footwearCatalog].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    return [...topClothes, ...topFootwear];
  }, []);

  // ML Personalised Suggestions ("Suggested For You")
  const suggestedProducts = useMemo(() => {
    return getPersonalizedMLSuggestions(userExperience, 20);
  }, [userExperience]);

  const addToCart = async (product) => {
    recordUserInteraction(product, 'buy');
    setCartItems(prev => {
      const pid = String(product.id || product._id);
      const existing = prev.find(i => String(i.id) === pid);
      if (existing) {
        return prev.map(i => String(i.id) === pid ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: pid,
        name: product.name,
        image: product.image || product.images?.[0] || '',
        price: product.discounted_price || product.price || 0,
        quantity: 1,
        size: product.sizes?.[0] || 'M',
        color: product.color || 'Default'
      }];
    });
    return true;
  };

  const buyNow = async (product) => {
    await addToCart(product);
    setShowCheckout(true);
    return true;
  };

  const toggleWishlist = useCallback((product) => {
    if (!product) return;
    const pid = String(product.id || product._id);
    setWishlist(prev => {
      const next = prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid];
      try {
        window.localStorage.setItem('smartcart:wishlist', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => String(item.id) !== String(id)));
      return;
    }
    setCartItems(prev => prev.map(item => String(item.id) === String(id) ? { ...item, quantity: newQuantity } : item));
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => String(item.id) !== String(id)));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setCartItems([]);
    setShowCart(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-500 to-purple-600 text-white">
        <div className="text-center">
          <div className="text-5xl mb-4">🛍️</div>
          <div className="text-xl font-bold">Loading SmartCart Clothes & Footwear...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setShowCart(true)}
        wishlistCount={wishlist.length}
        onWishlistClick={() => navigate('wishlist')}
        user={user}
        onAuthClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onLogout={handleLogout}
        onNavigate={navigate}
        currentPage={currentPage}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <div>
            <HeroBanner
              isAuthenticated={isAuthenticated}
              onCTA={() => navigate('clothes')}
            />

            {/* 🔥 Trending Now Section (Strictly 4 per row) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    🔥 HOT PRODUCTS
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                    Trending Now
                  </h2>
                </div>
                <button
                  onClick={() => navigate('clothes')}
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 px-4 py-2 rounded-full border border-pink-100 shadow-sm"
                >
                  Explore All →
                </button>
              </div>

              {/* Grid 4 columns per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {trendingNowProducts.map((product) => (
                  <ModernProductCard
                    key={`tr-${product.id || product._id}`}
                    product={product}
                    onAddToCart={addToCart}
                    onViewProduct={handleViewProduct}
                    isWishlisted={wishlistSet.has(String(product.id || product._id))}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            </section>

            {/* Category Grid Section (18 Fashion + 14 Footwear Categories, strictly 4 per row) */}
            <CategoryGrid onSelectCategory={handleSelectCategory} />

            {/* Wishlist Quick Preview (4 per row) */}
            {wishlistProducts.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Your Saved Wishlist Favorites (♥)</h2>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">Quick access to items you love</p>
                  </div>
                  <button
                    onClick={() => navigate('wishlist')}
                    className="text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 px-4 py-2 rounded-full"
                  >
                    View Favorites Page ({wishlistProducts.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                  {wishlistProducts.slice(0, 4).map(product => (
                    <ModernProductCard
                      key={`wl-${product.id || product._id}`}
                      product={product}
                      onAddToCart={addToCart}
                      onViewProduct={handleViewProduct}
                      isWishlisted
                      onToggleWishlist={toggleWishlist}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* "Suggested For You" Section (ML Powered Engine, strictly 4 per row) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                        ⚡ Enhanced ML Recommendation Engine
                      </span>
                      {userExperience.clickedProducts.length > 0 && (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          Personalized based on your browsing & purchases
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                      Suggested For You
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-2 sm:mt-0 max-w-sm">
                    {userExperience.clickedProducts.length > 0 
                      ? 'Dynamically ranked based on your clicked & purchased categories, colors and price points.'
                      : 'Initial top-rated collection (50% Clothes + 50% Footwear). Click or buy items to personalize your feed!'}
                  </p>
                </div>

                {/* Grid strictly 4 columns per row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                  {suggestedProducts.map((product) => (
                    <ModernProductCard
                      key={`sug-${product.id || product._id}`}
                      product={product}
                      onAddToCart={addToCart}
                      onViewProduct={handleViewProduct}
                      isWishlisted={wishlistSet.has(String(product.id || product._id))}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {currentPage === 'clothes' && (
          <ClothesPage
            initialCategory={activeClothingCategory}
            onAddToCart={addToCart}
            onViewProduct={handleViewProduct}
            wishlistIds={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        )}

        {currentPage === 'footwear' && (
          <FootwearPage
            initialCategory={activeFootwearCategory}
            onAddToCart={addToCart}
            onViewProduct={handleViewProduct}
            wishlistIds={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        )}

        {currentPage === 'wishlist' && (
          <WishlistPage
            wishlistItems={wishlistProducts}
            onRemoveWishlist={toggleWishlist}
            onAddToCart={addToCart}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentPage === 'my-orders' && (
          <OrderHistory onNavigate={navigate} />
        )}
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <Cart
          items={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          items={cartItems}
          onClose={() => setShowCheckout(false)}
          onComplete={() => {
            setCartItems([]);
            setShowCheckout(false);
            alert('🎉 Order placed successfully!');
            navigate('my-orders');
          }}
        />
      )}

      {/* Product Detail POP-UP Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          onBuyNow={buyNow}
          isWishlisted={wishlistSet.has(String(selectedProduct.id || selectedProduct._id))}
          onToggleWishlist={toggleWishlist}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-black text-pink-500">SMARTCART</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Your premier destination for Clothes & Footwear. 18 fashion apparel categories and 14 footwear categories with ML personalized recommendations.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">Shop Clothes</h4>
            <ul className="text-xs text-gray-400 space-y-1.5">
              <li><button onClick={() => handleSelectCategory('clothes', 'Sarees')}>Sarees & Lehengas</button></li>
              <li><button onClick={() => handleSelectCategory('clothes', 'Jeans')}>Jeans & Trousers</button></li>
              <li><button onClick={() => handleSelectCategory('clothes', 'T-Shirts')}>T-Shirts & Tops</button></li>
              <li><button onClick={() => handleSelectCategory('clothes', 'Jackets & Coats')}>Jackets & Sweaters</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">Shop Footwear</h4>
            <ul className="text-xs text-gray-400 space-y-1.5">
              <li><button onClick={() => handleSelectCategory('footwear', 'Sneakers')}>Sneakers & Athletic</button></li>
              <li><button onClick={() => handleSelectCategory('footwear', 'Sandals')}>Sandals & Slides</button></li>
              <li><button onClick={() => handleSelectCategory('footwear', 'Loafers')}>Loafers & Boots</button></li>
              <li><button onClick={() => handleSelectCategory('footwear', 'Heels')}>Heels & Flats</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">Customer Service</h4>
            <ul className="text-xs text-gray-400 space-y-1.5">
              <li>10-Day Replacement Policy</li>
              <li>Cash on Delivery Available</li>
              <li>Track Orders Online</li>
              <li>100% Authentic Guarantee</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} SmartCart Clothes & Footwear Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
