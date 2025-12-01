import React, { useState, useMemo } from 'react';
import './index.css';
import './theme/tokens.css';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import AboutUs from './components/AboutUs';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';
import ClothesPage from './components/ClothesPage';
import GiftsPage from './components/GiftsPage';
import WishlistPage from './components/WishlistPage';
import clothingCatalog from './data/clothing-catalog.json';
import giftsCatalog from './data/gifts-catalog.json';
// New UI components
import Navbar from './components/layout/Navbar';
import HeroBanner from './components/home/HeroBanner';
// Removed CategoryStrip per updated homepage simplification
import ModernProductCard from './components/product/ModernProductCard';

// (Removed unused legacy ProductCard and Header components)

// Using imported Cart component from './components/Cart'

const PAGE_PATHS = {
  home: '/',
  clothes: '/clothes',
  gifts: '/gifts',
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
  if (pathname.startsWith(PAGE_PATHS.gifts)) return 'gifts';
  if (pathname.startsWith(PAGE_PATHS.wishlist)) return 'wishlist';
  if (pathname.startsWith(PAGE_PATHS.product)) return 'product';
  if (pathname.startsWith(PAGE_PATHS['my-orders'])) return 'my-orders';
  return 'home';
};

// Main App Component
const AppContent = () => {
  // Debug: verify components at runtime
  // eslint-disable-next-line no-console
  console.log('DEBUG render AppContent types:', {
    AboutUs: typeof AboutUs,
    ClothesPage: typeof ClothesPage,
    GiftsPage: typeof GiftsPage,
    Cart: typeof Cart,
    AuthModal: typeof AuthModal,
    Checkout: typeof Checkout,
    OrderHistory: typeof OrderHistory
  });
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentPage, setCurrentPageState] = useState(resolveInitialPage);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [activeClothingCategory, setActiveClothingCategory] = useState('All');
  const [activeGiftCategory, setActiveGiftCategory] = useState('All');
  const [suggestedSeed, setSuggestedSeed] = useState(Date.now());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(window.localStorage.getItem('smartcart:wishlist') || '[]');
      return Array.isArray(saved) ? saved.map((id) => String(id)) : [];
    } catch {
      return [];
    }
  });
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(window.localStorage.getItem('smartcart:recentlyViewed') || '[]');
      return Array.isArray(saved) ? saved.map((id) => String(id)) : [];
    } catch {
      return [];
    }
  });

  const { user, logout, isAuthenticated, loading } = useAuth();

  const navigate = React.useCallback(
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
    [setCurrentPageState]
  );

  const goToClothes = React.useCallback((category = 'All') => {
    setActiveClothingCategory(category);
    navigate('clothes', { state: { clothingCategory: category } });
  }, [navigate, setActiveClothingCategory]);

  const goToGifts = React.useCallback((category = 'All') => {
    setActiveGiftCategory(category);
    navigate('gifts', { state: { giftCategory: category } });
  }, [navigate, setActiveGiftCategory]);

  const handleViewProduct = React.useCallback((product) => {
    if (!product) return;
    const productId = product._id || product.id;
    if (productId) {
      const idString = String(productId);
      setRecentlyViewed(prev => {
        const without = prev.filter(id => id !== idString);
        return [idString, ...without].slice(0, 20);
      });
    }
    setSelectedProduct(product);
    navigate('product', { state: { product } });
  }, [navigate, setRecentlyViewed, setSelectedProduct]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const initialState = { page: currentPage };
    if (currentPage === 'clothes') initialState.clothingCategory = activeClothingCategory;
    if (currentPage === 'gifts') initialState.giftCategory = activeGiftCategory;
    if (currentPage === 'product' && selectedProduct) initialState.product = selectedProduct;
    window.history.replaceState(initialState, '', window.location.pathname);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handlePopState = (event) => {
      const state = event.state || {};
      const nextPage = state.page || resolveInitialPage();
      setCurrentPageState(nextPage);
      if (nextPage === 'clothes') {
        setActiveClothingCategory(state.clothingCategory || 'All');
      }
      if (nextPage === 'gifts') {
        setActiveGiftCategory(state.giftCategory || 'All');
      }
      if (nextPage === 'product') {
        if (state.product) {
          setSelectedProduct(state.product);
        } else {
          setSelectedProduct(null);
        }
      } else {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveClothingCategory, setActiveGiftCategory, setCurrentPageState, setSelectedProduct]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('smartcart:wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('smartcart:recentlyViewed', JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed]);

  // Category extraction
  // (Removed unused clothingCategories & giftCategories arrays)

  // One representative image per category (first product with image)
  const clothingCategoryCards = useMemo(() => {
    const map = new Map();
    clothingCatalog.forEach(p => {
      if (!map.has(p.category) && p.image && p.image.startsWith('http')) map.set(p.category, p);
    });
    return Array.from(map.entries()).map(([category, product]) => ({ category, product })).slice(0, 12);
  }, []);
  const giftCategoryCards = useMemo(() => {
    const map = new Map();
    giftsCatalog.forEach(p => {
      if (!map.has(p.category) && p.image && p.image.startsWith('http')) map.set(p.category, p);
    });
    return Array.from(map.entries()).map(([category, product]) => ({ category, product })).slice(0, 12);
  }, []);

  const catalogLookup = useMemo(() => {
    const map = new Map();
    const register = (key, product) => {
      if (key === undefined || key === null) return;
      const str = String(key);
      if (!map.has(str)) map.set(str, product);
    };
    [...clothingCatalog, ...giftsCatalog].forEach(product => {
      register(product.id, product);
      register(product._id, product);
    });
    return map;
  }, []);

  const getProductById = React.useCallback((id) => {
    if (id === undefined || id === null) return null;
    return catalogLookup.get(String(id)) || null;
  }, [catalogLookup]);

  const wishlistProducts = useMemo(() => wishlist
    .map(id => getProductById(id))
    .filter(Boolean), [wishlist, getProductById]);

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);
  const cartIdSet = useMemo(() => new Set(cartItems.map(item => String(item.id))), [cartItems]);

  const userPreferenceData = useMemo(() => {
    const categoryScores = new Map();
    const collectionScores = new Map();
    const bump = (product, weight) => {
      if (!product) return;
      if (product.category) {
        categoryScores.set(product.category, (categoryScores.get(product.category) || 0) + weight);
      }
      const collection = product.collection || product.brand;
      if (collection) {
        collectionScores.set(collection, (collectionScores.get(collection) || 0) + weight);
      }
    };

    wishlistProducts.forEach(product => bump(product, 4));
    cartItems.forEach(item => bump(getProductById(item.id), 6));
    recentlyViewed.forEach(id => bump(getProductById(id), 3));
    if (selectedProduct) bump(selectedProduct, 5);

    return { categoryScores, collectionScores };
  }, [wishlistProducts, cartItems, recentlyViewed, selectedProduct, getProductById]);

  const allDisplayableProducts = useMemo(() => (
    [...clothingCatalog, ...giftsCatalog].filter(p => p.image && p.image.startsWith('http'))
  ), []);

  const personalizedSuggestions = useMemo(() => {
    const { categoryScores, collectionScores } = userPreferenceData;
    const recencyBoost = new Map();
    recentlyViewed.forEach((id, index) => {
      const weight = Math.max(0, 1 - (index * 0.08));
      recencyBoost.set(id, weight * 4);
    });

    const scored = allDisplayableProducts.map(product => {
      const key = String(product._id || product.id);
      const numericSeed = typeof product.id === 'number'
        ? product.id
        : parseInt(key.replace(/[^0-9]/g, ''), 10) || 0;
      const randomJitter = ((Math.sin(suggestedSeed + numericSeed) + 1) / 2) * 0.4;
      const categoryBoost = categoryScores.get(product.category) || 0;
      const collectionKey = product.collection || product.brand;
      const collectionBoost = collectionKey ? (collectionScores.get(collectionKey) || 0) : 0;
      const wishlistBoost = wishlistSet.has(key) ? 6 : 0;
      const cartBoost = cartIdSet.has(key) ? 7 : 0;
      const recency = recencyBoost.get(key) || 0;
      const score = categoryBoost + collectionBoost + wishlistBoost + cartBoost + recency + randomJitter;
      return { product, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const positives = scored.filter(entry => entry.score > 0);
    const top = (positives.length >= 24 ? positives.slice(0, 24) : scored.slice(0, 24)).map(entry => entry.product);
    return top;
  }, [allDisplayableProducts, userPreferenceData, wishlistSet, cartIdSet, recentlyViewed, suggestedSeed]);

  // Static first row: 4 specific products (Palazzo Pants Variant, Anarkali Suit, Hand-painted tea set, Personalized mug)
  const staticFirstRow = useMemo(() => {
    const palazzo = clothingCatalog.find(p => p.id === 838 && p.name === 'Palazzo Pants Variant');
    const anarkali = clothingCatalog.find(p => p.id === 4 && p.name === 'Anarkali Suit');
    const teaSet = giftsCatalog.find(p => p.id === 119 && p.name === 'Hand-painted tea set');
    const mug = giftsCatalog.find(p => p.id === 1 && p.name === 'Personalized mug');
    return [palazzo, anarkali, teaSet, mug].filter(Boolean);
  }, []);

  // Suggested (random 8 clothes + 8 gifts for remaining 4 rows, interleaved 2-2 pattern)
  const suggestedClothes = useMemo(() => {
    const seed = suggestedSeed || 0;
    const valid = clothingCatalog.filter(p => p.image && p.image.startsWith('http') && p.id !== 838 && p.id !== 4);
    const scored = valid.map((product, index) => {
      const numeric = typeof product.id === 'number' ? product.id : index;
      const value = Math.sin(seed + numeric * 17.23) * 10000;
      return { product, score: value - Math.floor(value) };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.map(entry => entry.product).slice(0, 8);
  }, [suggestedSeed]);
  const suggestedGifts = useMemo(() => {
    const seed = suggestedSeed || 0;
    const valid = giftsCatalog.filter(p => p.image && p.image.startsWith('http') && p.id !== 119 && p.id !== 1);
    const scored = valid.map((product, index) => {
      const numeric = typeof product.id === 'number' ? product.id : index;
      const value = Math.sin(seed + numeric * 19.07) * 10000;
      return { product, score: value - Math.floor(value) };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.map(entry => entry.product).slice(0, 8);
  }, [suggestedSeed]);

  // Interleave: 2 clothes, 2 gifts, repeat (4 rows of 4 items = 16 total)
  const suggestionsToRender = useMemo(() => {
    const interleaved = [...staticFirstRow]; // Start with static row
    const clothesCount = suggestedClothes.length;
    const giftsCount = suggestedGifts.length;
    let ci = 0, gi = 0;
    while (interleaved.length < 20 && (ci < clothesCount || gi < giftsCount)) {
      // Add 2 clothes
      if (ci < clothesCount) interleaved.push(suggestedClothes[ci++]);
      if (ci < clothesCount) interleaved.push(suggestedClothes[ci++]);
      // Add 2 gifts
      if (gi < giftsCount) interleaved.push(suggestedGifts[gi++]);
      if (gi < giftsCount) interleaved.push(suggestedGifts[gi++]);
    }
    return interleaved;
  }, [staticFirstRow, suggestedClothes, suggestedGifts]);
  const previewSuggestions = suggestionsToRender;

  // Backend API base
  // Prefer explicit env (REACT_APP_API_BASE_URL, e.g. https://smartcart-clothes-gifts.onrender.com/api),
  // otherwise use localhost in dev, else relative '/api'
  const explicitBase = (process.env.REACT_APP_API_BASE_URL || '').trim();
  const API_BASE_URL = explicitBase
    ? explicitBase.replace(/\/$/, '')
    : ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? 'http://localhost:5000/api'
        : '/api');

  // Sync cart from backend on login/load
  React.useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) { setCartItems([]); return; }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('cart fetch failed');
        const data = await res.json();
        const items = (data.cart?.items || []).map(ci => {
          const pid = ci.product?._id || ci.product;
          const pidNum = parseInt(pid, 10);
          const fromCatalog = !isNaN(pidNum)
            ? (clothingCatalog.find(p => p.id === pidNum) || giftsCatalog.find(p => p.id === pidNum))
            : null;
          return {
            id: pid,
            name: ci.name || fromCatalog?.name || ci.product?.name || 'Product',
            image: ci.image || fromCatalog?.image || ci.product?.image || '',
            price: typeof ci.price === 'number' && ci.price > 0 ? ci.price : (fromCatalog?.price || ci.product?.price || 0),
            quantity: ci.quantity,
            size: ci.size,
            color: ci.color
          };
        });
        setCartItems(items);
      } catch {
        // keep current state if backend not reachable
      }
    };
    fetchCart();
  }, [isAuthenticated, API_BASE_URL]);

  const addToCart = async (product) => {
    if (!isAuthenticated) { setShowAuthModal(true); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: product._id || product.id,
          quantity: 1,
          size: 'M',
          color: 'Default',
          name: product.name,
          image: product.image || product.images?.[0] || '',
          price: product.price
        })
      });
      if (!res.ok) throw new Error('add failed');
      const data = await res.json();
      const items = (data.cart?.items || []).map(ci => {
        const pid = ci.product?._id || ci.product;
        const pidNum = parseInt(pid, 10);
        const fromCatalog = !isNaN(pidNum)
          ? (clothingCatalog.find(p => p.id === pidNum) || giftsCatalog.find(p => p.id === pidNum))
          : null;
        return {
          id: pid,
          name: ci.name || fromCatalog?.name || ci.product?.name || 'Product',
          image: ci.image || fromCatalog?.image || ci.product?.image || '',
          price: typeof ci.price === 'number' && ci.price > 0 ? ci.price : (fromCatalog?.price || ci.product?.price || 0),
          quantity: ci.quantity,
          size: ci.size,
          color: ci.color
        };
      });
      setCartItems(items);
      return true;
    } catch {
      // fallback update local for UX
      setCartItems(prev => {
        const existing = prev.find(i => i.id === (product._id || product.id));
        if (existing) return prev.map(i => i.id === (product._id || product.id) ? { ...i, quantity: (i.quantity||1)+1 } : i);
        return [...prev, { id: product._id || product.id, name: product.name, image: product.image, price: product.price, quantity: 1 }];
      });
      return false;
    }
  };

  const buyNow = async (product) => {
    const ok = await addToCart(product);
    setShowCheckout(true);
    return ok;
  };

  const toggleWishlist = React.useCallback((product) => {
    if (!product) return;
    const productId = product._id || product.id;
    if (!productId) return;
    const idString = String(productId);
    setWishlist(prev => (
      prev.includes(idString)
        ? prev.filter(id => id !== idString)
        : [...prev, idString]
    ));
  }, []);

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity <= 0) { removeFromCart(id); return; }
    try {
      const token = localStorage.getItem('token');
      // Need itemId; find matching backend item by product id
      const resCart = await fetch(`${API_BASE_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await resCart.json();
      const item = (data.cart?.items || []).find(ci => (ci.product?._id || ci.product) === id);
      const itemId = item?._id;
      if (!itemId) throw new Error('no itemId');
      const res = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (!res.ok) throw new Error('update failed');
      const upd = await res.json();
      const items = (upd.cart?.items || []).map(ci => {
        const pid = ci.product?._id || ci.product;
        const pidNum = parseInt(pid, 10);
        const fromCatalog = !isNaN(pidNum)
          ? (clothingCatalog.find(p => p.id === pidNum) || giftsCatalog.find(p => p.id === pidNum))
          : null;
        return {
          id: pid,
          name: ci.name || fromCatalog?.name || ci.product?.name || 'Product',
          image: ci.image || fromCatalog?.image || ci.product?.image || '',
          price: typeof ci.price === 'number' && ci.price > 0 ? ci.price : (fromCatalog?.price || ci.product?.price || 0),
          quantity: ci.quantity,
          size: ci.size,
          color: ci.color
        };
      });
      setCartItems(items);
    } catch {
      setCartItems(prev => prev.map(it => it.id === id ? { ...it, quantity: newQuantity } : it));
    }
  };

  const removeFromCart = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const resCart = await fetch(`${API_BASE_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await resCart.json();
      const item = (data.cart?.items || []).find(ci => (ci.product?._id || ci.product) === id);
      const itemId = item?._id;
      if (!itemId) throw new Error('no itemId');
      const res = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('remove failed');
      const upd = await res.json();
      const items = (upd.cart?.items || []).map(ci => {
        const pid = ci.product?._id || ci.product;
        const pidNum = parseInt(pid, 10);
        const fromCatalog = !isNaN(pidNum)
          ? (clothingCatalog.find(p => p.id === pidNum) || giftsCatalog.find(p => p.id === pidNum))
          : null;
        return {
          id: pid,
          name: ci.name || fromCatalog?.name || ci.product?.name || 'Product',
          image: ci.image || fromCatalog?.image || ci.product?.image || '',
          price: typeof ci.price === 'number' && ci.price > 0 ? ci.price : (fromCatalog?.price || ci.product?.price || 0),
          quantity: ci.quantity,
          size: ci.size,
          color: ci.color
        };
      });
      setCartItems(items);
    } catch {
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleOrderComplete = async () => {
    // After successful order (verified), clear backend cart and local state
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/cart/clear`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    } catch {}
    setCartItems([]);
    setShowCheckout(false);
    alert('🎉 Order placed successfully! You can track your order in "My Orders" section.');
  };

  const handleAuthRequired = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    setCartItems([]);
    setShowCart(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛍️</div>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading SmartCart...</div>
          <div style={{ 
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => {
          if (isAuthenticated) setShowCart(true); else { setAuthMode('login'); setShowAuthModal(true); }
        }}
        wishlistCount={wishlist.length}
        onWishlistClick={() => {
          setShowCart(false);
          setShowCheckout(false);
          navigate('wishlist');
        }}
        user={user}
        onAuthClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onLogout={handleLogout}
        onNavigate={navigate}
      />

      {currentPage === 'home' && (
        <>
          <HeroBanner
            isAuthenticated={isAuthenticated}
            onCTA={() => { setAuthMode('register'); setShowAuthModal(true); }}
          />
          {/* Removed billboard + category strip per request */}
          {/* Full-bleed homepage wrapper (edge-to-edge) */}
          <div style={{ width:'100vw', position:'relative', left:'50%', marginLeft:'-50vw', padding:'4rem 2rem', display:'flex', flexDirection:'column', gap:'7rem' }}>
            {/* Clothing Categories */}
            <section>
              <div className="sc-collection-heading" style={{ maxWidth:1400, margin:'0 auto 2.1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
                  <div style={{ flex: '1 1 auto', textAlign: 'center' }}>
                    <h2 style={{ margin:0 }}>Clothing Categories</h2>
                    <p style={{ margin:0 }}>Browse curated clothing groups</p>
                  </div>
                  <div style={{ flex: '0 0 auto' }}>
                    <button onClick={() => goToClothes('All')} style={{ background:'#ff3f6c', border:'none', color:'#fff', cursor:'pointer', fontWeight:600, padding:'.55rem 1.05rem', borderRadius:999, fontSize:'.8rem', letterSpacing:'.5px', boxShadow:'0 4px 12px -4px rgba(255,63,108,0.45)' }}>View All</button>
                  </div>
                </div>
              </div>
              <div style={{ maxWidth: '100%', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1.25rem', width:'100%', margin:'0 auto' }}>
                {clothingCategoryCards.map(({ category, product }) => (
                  <div key={category} className="group cursor-pointer" onClick={() => goToClothes(category)}>
                    <div className="relative rounded-xl overflow-hidden aspect-[5/6] bg-gray-100 shadow-sm">
                      <img src={product.image} alt={category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-white text-sm font-semibold drop-shadow">{category}</span>
                        <span className="sc-cat-chip">SHOP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {/* Gift Categories */}
            <section>
              <div className="sc-collection-heading" style={{ maxWidth:1400, margin:'0 auto 2.1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
                  <div style={{ flex: '1 1 auto', textAlign: 'center' }}>
                    <h2 style={{ margin:0 }}>Gift Categories</h2>
                    <p style={{ margin:0 }}>Find inspiration for every occasion</p>
                  </div>
                  <div style={{ flex: '0 0 auto' }}>
                    <button onClick={() => goToGifts('All')} style={{ background:'#6366f1', border:'none', color:'#fff', cursor:'pointer', fontWeight:600, padding:'.55rem 1.05rem', borderRadius:999, fontSize:'.8rem', letterSpacing:'.5px', boxShadow:'0 4px 12px -4px rgba(99,102,241,0.45)' }}>View All</button>
                  </div>
                </div>
              </div>
              <div style={{ maxWidth: '100%', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1.25rem', width:'100%', margin:'0 auto' }}>
                {giftCategoryCards.map(({ category, product }) => (
                  <div key={category} className="group cursor-pointer" onClick={() => goToGifts(category)}>
                    <div className="relative rounded-xl overflow-hidden aspect-[5/6] bg-gray-100 shadow-sm">
                      <img src={product.image} alt={category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-white text-sm font-semibold drop-shadow">{category}</span>
                        <span className="sc-cat-chip">BROWSE</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {wishlistProducts.length > 0 && (
              <section>
                <div className="sc-collection-heading" style={{ maxWidth:1400, margin:'0 auto 2.1rem' }}>
                  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:'2rem', flexWrap:'wrap' }}>
                    <div style={{ flex:'1 1 auto', minWidth:280 }}>
                      <h2 style={{ margin:0 }}>Your Wishlist</h2>
                      <p style={{ margin:0 }}>Quick access to the pieces you’ve favourited</p>
                    </div>
                    <div style={{ color:'#64748b', fontSize:'.85rem', fontWeight:600 }}>
                      {wishlistProducts.length} saved {wishlistProducts.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </div>
                <div style={{ maxWidth:'100%', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1.5rem', width:'100%', margin:'0 auto' }}>
                  {wishlistProducts.map(product => (
                    <ModernProductCard
                      key={`wl-${product.id || product._id}`}
                      product={product}
                      onAdd={addToCart}
                      isAuthenticated={isAuthenticated}
                      onAuth={handleAuthRequired}
                      onView={handleViewProduct}
                      size="xl"
                      isFavorite
                      onToggleFavorite={toggleWishlist}
                    />
                  ))}
                </div>
              </section>
            )}
            {/* Suggested For You */}
            <section>
              <div className="sc-collection-heading" style={{ maxWidth:1400, margin:'0 auto 2.1rem' }}>
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:'2rem', flexWrap:'wrap' }}>
                  <div style={{ flex:'1 1 auto', minWidth:300, display:'flex', flexDirection:'column', gap:'.45rem' }}>
                    <h2 style={{ margin:0 }}>Suggested For You</h2>
                    <p style={{ margin:0, color:'#64748b' }}>Blended from your cart, wishlist, and browsing activity</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                    <button onClick={() => { setSuggestedSeed(Date.now()); }} style={{ background:'#ff3f6c', border:'none', color:'#fff', cursor:'pointer', fontWeight:600, padding:'.65rem 1.15rem', borderRadius:999, fontSize:'.85rem', letterSpacing:'.5px', boxShadow:'0 4px 14px -4px rgba(255,63,108,0.45)' }}>↻ Refresh</button>
                  </div>
                </div>
              </div>
              {previewSuggestions.length === 0 ? (
                <div style={{
                  width:'100%',
                  padding:'3rem',
                  borderRadius:32,
                  border:'1px dashed rgba(148,163,184,0.45)',
                  textAlign:'center',
                  color:'#6b7280'
                }}>
                  Add items to your cart or wishlist to unlock tailored suggestions.
                </div>
              ) : (
                <div style={{ maxWidth:'100%', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1.5rem', width:'100%', margin:'0 auto' }}>
                  {previewSuggestions.map(product => (
                    <ModernProductCard
                      key={`s-${product.id || product._id}`}
                      product={product}
                      onAdd={addToCart}
                      isAuthenticated={isAuthenticated}
                      onAuth={handleAuthRequired}
                      onView={handleViewProduct}
                      size="xl"
                      isFavorite={wishlistSet.has(String(product._id || product.id))}
                      onToggleFavorite={toggleWishlist}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {/* Clothes Page Render with category pre-select */}
      {currentPage === 'clothes' && (
        <ClothesPage
          onAddToCart={addToCart}
          isAuthenticated={isAuthenticated}
          onAuthRequired={handleAuthRequired}
          onViewProduct={handleViewProduct}
          initialCategory={activeClothingCategory}
          wishlistIds={wishlist}
          onToggleWishlist={toggleWishlist}
        />
      )}

      {/* Gifts Page Render with category pre-select */}
      {currentPage === 'gifts' && (
        <GiftsPage
          onAddToCart={addToCart}
          isAuthenticated={isAuthenticated}
          onAuthRequired={handleAuthRequired}
          onViewProduct={handleViewProduct}
          initialCategory={activeGiftCategory}
          wishlistIds={wishlist}
          onToggleWishlist={toggleWishlist}
        />
      )}

      {currentPage === 'wishlist' && (
        <WishlistPage
          products={wishlistProducts}
          onAddToCart={addToCart}
          isAuthenticated={isAuthenticated}
          onAuthRequired={handleAuthRequired}
          onViewProduct={handleViewProduct}
          onToggleWishlist={toggleWishlist}
          onBrowseClothes={() => navigate('clothes')}
          onBrowseGifts={() => navigate('gifts')}
          onBackHome={() => navigate('home')}
        />
      )}

      {currentPage === 'product' && selectedProduct && (
        <React.Suspense fallback={<div style={{ padding: '2rem' }}>Loading product...</div>}>
          {/* Lazy import to avoid initial bundle bloat */}
          {React.createElement(require('./components/ProductDetail').default, {
            product: selectedProduct,
            onClose: () => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back();
              } else {
                setSelectedProduct(null);
                navigate('home', { replace: true });
              }
            },
            onAddToCart: addToCart,
            onBuyNow: buyNow,
            isAuthenticated,
            onAuthRequired: handleAuthRequired
          })}
        </React.Suspense>
      )}

      {/* My Orders Page (full-page variant) */}
      {currentPage === 'my-orders' && (
        isAuthenticated ? (
          <div style={{ width:'100%', padding:'2.5rem 1rem', display:'flex', justifyContent:'center' }}>
            <div style={{ width:'100%', maxWidth:1200 }}>
              <OrderHistory
                user={user}
                variant="page"
                onClose={() => navigate('home')}
              />
            </div>
          </div>
        ) : (
          <div style={{ padding:'5rem 1.5rem', maxWidth:900, margin:'0 auto', textAlign:'center' }}>
            <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🔐</div>
            <h2 style={{ margin:'0 0 1rem', fontSize:'2rem', fontWeight:800, letterSpacing:'-.5px' }}>Sign In to View Your Orders</h2>
            <p style={{ color:'#64748b', margin:'0 0 2.25rem', fontSize:'1.05rem', lineHeight:1.5 }}>Access your full purchase history, track delivery status, and manage recent orders.</p>
            <button
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              style={{
                background:'linear-gradient(135deg,#ff3f6c,#6366f1)',
                border:'none',
                color:'#fff',
                padding:'0.9rem 2.1rem',
                fontSize:'1rem',
                fontWeight:600,
                borderRadius:14,
                cursor:'pointer',
                boxShadow:'0 8px 24px -10px rgba(99,102,241,0.45)',
                letterSpacing:'.25px'
              }}
            >Sign In to Continue →</button>
          </div>
        )
      )}

  {/* Profile page removed */}

      {/* Cart Modal */}
      {showCart && isAuthenticated && Cart && (
        <Cart 
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
          onClose={() => setShowCart(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && AuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => navigate('home')}
          mode={authMode}
          onSwitchMode={setAuthMode}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && isAuthenticated && Checkout && (
        <Checkout
          cartItems={cartItems}
          user={user}
          onClose={() => setShowCheckout(false)}
          onOrderComplete={handleOrderComplete}
        />
      )}

  {/* Order History Modal (shown even if not authenticated) */}
  {showOrderHistory && OrderHistory && (
        <OrderHistory
          user={user}
          onClose={() => setShowOrderHistory(false)}
        />
      )}

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#374151', 
        color: 'white', 
        textAlign: 'center', 
        padding: '3rem 2rem',
        marginTop: '4rem'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>SmartCart: Clothes & Gifts</h3>
        <p style={{ marginBottom: '1rem' }}>Your AI-Powered Shopping Destination</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          © 2025 SmartCart. Built with MERN Stack + Machine Learning
        </p>
      </footer>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

function App() {
  // Runtime guard: if any critical component is undefined, render a helpful message
  const undefineds = [];
  if (!AuthProvider) undefineds.push('AuthProvider');
  if (!AppContent) undefineds.push('AppContent');
  if (undefineds.length) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Component load error</h3>
        <pre>{JSON.stringify(undefineds, null, 2)}</pre>
      </div>
    );
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
