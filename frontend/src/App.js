import React, { useState, useMemo } from 'react';
import './index.css';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import AboutUs from './components/AboutUs';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';
import ClothesPage from './components/ClothesPage';
import GiftsPage from './components/GiftsPage';
import VerifyEmail from './components/VerifyEmail';
import clothingCatalog from './data/clothing-catalog.json';
import giftsCatalog from './data/gifts-catalog.json';

// Enhanced Product Card Component (fixed)
const ProductCard = ({ product, onAddToCart, isAuthenticated, onAuthRequired, onViewProduct }) => {
  const handleView = () => onViewProduct && onViewProduct(product);
  return (
    <div className="smartcart-card" style={{ height: 'fit-content', position: 'relative' }}>
      {product.discount > 0 && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444', color: 'white',
          padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 1
        }}>-{product.discount}%</div>
      )}
      <img
        src={(product.image || '').startsWith('http') ? `${(typeof window!== 'undefined' && (window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1') ? 'http://localhost:5000' : '')}/api/images/proxy?url=${encodeURIComponent(product.image)}` : product.image}
        alt={product.name}
        style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer' }}
        onClick={handleView}
        onKeyDown={(e) => { if (e.key === 'Enter') handleView(); }}
        tabIndex={0}
        onError={(e) => {
          const canvas = document.createElement('canvas');
          canvas.width = 400; canvas.height = 300; const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#667eea'; ctx.fillRect(0,0,400,300); ctx.fillStyle = '#fff'; ctx.font='20px Arial'; ctx.textAlign='center'; ctx.fillText(product.name,200,150);
          e.currentTarget.src = canvas.toDataURL();
        }}
      />
      <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleView}>{product.name}</h3>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#6b7280', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
          <span style={{ fontWeight: 600, color: '#4f46e5' }}>{product.brand || (product.type ? product.type.charAt(0).toUpperCase() + product.type.slice(1) : 'Product')}</span>
          {' • '}{product.category === 'clothes' ? (product.gender || 'Unisex') : (product.ageGroup || 'All Ages')}
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
          {product.category === 'clothes' ? (product.fabric || 'Cotton') : (product.material || 'Quality')} •
          <span style={{ color: '#059669', fontWeight: 600, marginLeft: '0.25rem' }}>⭐ {(parseFloat(product.rating) || 4.5).toFixed(1)}</span>
        </p>
      </div>
      {product.category === 'clothes' ? (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
            {(product.sizes || ['S','M','L']).slice(0,4).map(size => (
              <span key={size} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', backgroundColor: '#f3f4f6', borderRadius: '4px', color: '#374151' }}>{size}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(product.colors || ['Blue','Red','Green']).slice(0,3).map(color => (
              <div key={color} style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: (c => {
                const lc = c.toLowerCase();
                if (lc === 'multicolor') return '#6366f1';
                if (lc === 'check') return '#8b5cf6';
                if (lc === 'floral') return '#ec4899';
                return lc;
              })(color), border: '1px solid #e5e7eb' }}/>
            ))}
            {product.colors && product.colors.length > 3 && <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>+{product.colors.length - 3}</span>}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '1rem' }}>
          {(product.occasion || product.deliverySpeed) && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {product.occasion && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', backgroundColor: '#ddd6fe', color: '#5b21b6', borderRadius: 8, textTransform: 'capitalize' }}>🎉 {product.occasion}</span>}
              {product.deliverySpeed && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: 8, textTransform: 'capitalize' }}>🚚 {product.deliverySpeed}</span>}
            </div>
          )}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#059669' }}>₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span style={{ fontSize: '0.9rem', color: '#6b7280', textDecoration: 'line-through', marginLeft: '0.5rem' }}>₹{product.originalPrice}</span>
          )}
        </div>
        <span style={{ backgroundColor: product.category === 'clothes' ? '#ddd6fe' : '#fce7f3', color: product.category === 'clothes' ? '#5b21b6' : '#be185d', padding: '0.25rem 0.5rem', borderRadius: 9999, fontSize: '0.8rem' }}>
          ML: {(((product && typeof product.mlScore === 'number' ? product.mlScore : 0.9) * 100)).toFixed(0)}%
        </span>
      </div>
      <button className="smartcart-button" style={{ width: '100%' }} onClick={() => {
        if (isAuthenticated) onAddToCart(product); else onAuthRequired();
      }}>🛒 {isAuthenticated ? 'Add to Cart' : 'Sign In to Add'}</button>
    </div>
  );
};

// Header Component
const Header = ({ cartCount, onCartClick, user, onAuthClick, onLogout, currentPage, onNavigate, onShowOrderHistory }) => (
  <header className="smartcart-gradient" style={{ padding: '1.5rem', color: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', cursor: 'pointer' }} onClick={() => onNavigate('home')}>
          🛍️ SmartCart: Clothes & Gifts
        </h1>
        <p style={{ fontSize: '1rem', margin: 0, opacity: 0.9 }}>
          AI-Powered Shopping Experience
        </p>
      </div>
      
      {/* Navigation Menu */}
  <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {/* Always-visible items */}
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: 'none',
            border: '2px solid rgba(255,255,255,0.3)',
            color: currentPage === 'home' ? '#fff' : 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            fontWeight: currentPage === 'home' ? 'bold' : 'normal',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            backgroundColor: currentPage === 'home' ? 'rgba(255,255,255,0.2)' : 'transparent',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            if (currentPage !== 'home') {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
            }
          }}
          onMouseOut={(e) => {
            if (currentPage !== 'home') {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }
          }}
        >
          🏠 Home
        </button>

        <button
          onClick={() => onNavigate('clothes')}
          style={{
            background: 'none',
            border: '2px solid rgba(255,255,255,0.3)',
            color: currentPage === 'clothes' ? '#fff' : 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            fontWeight: currentPage === 'clothes' ? 'bold' : 'normal',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            backgroundColor: currentPage === 'clothes' ? 'rgba(255,255,255,0.2)' : 'transparent',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            if (currentPage !== 'clothes') {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
            }
          }}
          onMouseOut={(e) => {
            if (currentPage !== 'clothes') {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }
          }}
        >
          👕 Clothes
        </button>

        <button
          onClick={() => onNavigate('gifts')}
          style={{
            background: 'none',
            border: '2px solid rgba(255,255,255,0.3)',
            color: currentPage === 'gifts' ? '#fff' : 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            fontWeight: currentPage === 'gifts' ? 'bold' : 'normal',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            backgroundColor: currentPage === 'gifts' ? 'rgba(255,255,255,0.2)' : 'transparent',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            if (currentPage !== 'gifts') {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
            }
          }}
          onMouseOut={(e) => {
            if (currentPage !== 'gifts') {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }
          }}
        >
          🎁 Gifts
        </button>

  {/* About removed */}

        {/* Show About Us only before signup (not authenticated) */}
        {!user && (
          <button
            onClick={() => onNavigate('about')}
            style={{
              background: 'none',
              border: '2px solid rgba(255,255,255,0.3)',
              color: currentPage === 'about' ? '#fff' : 'rgba(255,255,255,0.9)',
              fontSize: '1.1rem',
              cursor: 'pointer',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              backgroundColor: currentPage === 'about' ? 'rgba(255,255,255,0.2)' : 'transparent',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (currentPage !== 'about') {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (currentPage !== 'about') {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }
            }}
          >
            ℹ️ About Us
          </button>
        )}

        {/* Logged-in only items */}
        {user && (
          <>
            <button
              onClick={() => onShowOrderHistory && onShowOrderHistory()}
              style={{
                background: 'none',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                fontWeight: 'normal',
                cursor: 'pointer',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              📋 My Orders
            </button>

            {/* Wishlist removed */}

            {/* Deals removed */}
          </>
        )}
      </nav>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            {/* Greeting restored after signup */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '20px'
            }}>
              <img 
                src={user.avatar ? (user.avatar.startsWith('http') ? `${(typeof window!== 'undefined' && (window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1') ? 'http://localhost:5000' : '')}/api/images/proxy?url=${encodeURIComponent(user.avatar)}` : user.avatar) : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Im0yMCAxNXYtMWMwLTIuMjA5LTEuNzkxLTQtNC00aC04Yy0yLjIwOSAwLTQgMS43OTEtNCAwdjEiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI4IiByPSI0IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4='}
                alt={user.name}
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <span style={{ fontSize: '0.9rem' }}>Hi, {user.name.split(' ')[0]}!</span>
            </div>
            
            <button 
              onClick={onCartClick}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '2px solid white',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#667eea';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.target.style.color = 'white';
              }}
            >
              🛒 Cart ({cartCount})
            </button>

            <button 
              onClick={onLogout}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid rgba(255,255,255,0.5)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button 
            onClick={onAuthClick}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#667eea';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.target.style.color = 'white';
            }}
          >
            🔑 Sign In / Sign Up
          </button>
        )}
      </div>
    </div>
  </header>
);

// Using imported Cart component from './components/Cart'

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
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/verify-email') return 'verify-email';
    return 'home';
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { user, logout, isAuthenticated, loading } = useAuth();

  // Only show homepage clothes with available images
  const homepageClothes = useMemo(() => {
    // Only include products with a valid image URL (not empty, not placeholder)
    return (Array.isArray(clothingCatalog) ? clothingCatalog : [])
      .filter(p => p.image && typeof p.image === 'string' && !p.image.includes('placeholder') && !p.image.includes('noimage') && !p.image.includes('default'))
      .slice(0, 36);
  }, []);

  // Backend API base
  const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000/api'
    : '/api';

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
      <Header 
        cartCount={cartCount} 
        onCartClick={() => {
          if (isAuthenticated) {
            setShowCart(true);
          } else {
            setAuthMode('login');
            setShowAuthModal(true);
          }
        }} 
        user={user}
        onAuthClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onShowOrderHistory={() => setShowOrderHistory(true)}
      />

      {currentPage === 'home' && (
        <>
          {/* Hero Section */}
          <section style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            {isAuthenticated 
              ? `Welcome back, ${user?.name?.split(' ')[0]}! 🎉` 
              : 'Welcome to Smart Shopping Experience'}
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            {isAuthenticated 
              ? 'Discover personalized recommendations powered by AI'
              : 'Sign in to unlock AI-powered recommendations and personalized shopping'}
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '2px solid white',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '30px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#667eea';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.target.style.color = 'white';
              }}
            >
              🚀 Get Started - Sign Up Now
            </button>
          )}
        </div>
      </section>

      <main style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Clothes Section */}
        <section style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', color: '#374151', margin: '0 0 0.5rem 0' }}>
                👕 {isAuthenticated ? 'Your Recommended Clothes' : 'Featured Clothes'}
              </h2>
              <p style={{ color: '#6b7280', margin: 0 }}>
                36 premium selections
              </p>
            </div>
            
            <button
              onClick={() => setCurrentPage('clothes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
              }}
            >
              🔍 Browse All Clothes ({clothingCatalog.length})
            </button>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {homepageClothes.map(product => (
              <ProductCard 
                key={product.id} 
                product={{ ...product, category: 'clothes' }} 
                onAddToCart={addToCart}
                isAuthenticated={isAuthenticated}
                onAuthRequired={handleAuthRequired}
                onViewProduct={(p) => { setSelectedProduct(p); setCurrentPage('product'); }}
              />
            ))}
          </div>
        </section>

        {/* Gifts Section */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', color: '#374151', margin: '0 0 0.5rem 0' }}>
                🎁 {isAuthenticated ? 'Your Recommended Gifts' : 'Featured Gifts'}
              </h2>
              <p style={{ color: '#6b7280', margin: 0 }}>
                18 thoughtful selections
              </p>
            </div>
            
            <button
              onClick={() => setCurrentPage('gifts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px 0 rgba(240, 147, 251, 0.4)'
              }}
            >
              🔍 Browse All Gifts ({giftsCatalog.length})
            </button>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {giftsCatalog
              .filter(p => p.image && typeof p.image === 'string' && !p.image.includes('placeholder') && !p.image.includes('noimage') && !p.image.includes('default'))
              .slice(0, 18)
              .map(product => (
                <ProductCard 
                  key={product.id} 
                  product={{ ...product, category: 'gifts' }} 
                  onAddToCart={addToCart}
                  isAuthenticated={isAuthenticated}
                  onAuthRequired={handleAuthRequired}
                  onViewProduct={(p) => { setSelectedProduct(p); setCurrentPage('product'); }}
                />
              ))}
          </div>
        </section>

        {/* Features Section */}
        <section style={{ marginTop: '5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '3rem', color: '#374151' }}>
            ✨ Why Choose SmartCart?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="smartcart-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>AI Recommendations</h3>
              <p style={{ color: '#6b7280' }}>Smart ML algorithms learn your preferences</p>
            </div>
            <div className="smartcart-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Secure Authentication</h3>
              <p style={{ color: '#6b7280' }}>Your personal data is safe and secure</p>
            </div>
            <div className="smartcart-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
              <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Secure Payments</h3>
              <p style={{ color: '#6b7280' }}>Multiple payment options with top security</p>
            </div>
            <div className="smartcart-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚚</div>
              <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Fast Delivery</h3>
              <p style={{ color: '#6b7280' }}>Quick and reliable shipping worldwide</p>
            </div>
            
            {/* Additional features shown only for authenticated users */}
            {isAuthenticated && (
              <>
                <div className="smartcart-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                  <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Order Tracking</h3>
                  <p style={{ color: '#6b7280' }}>Real-time updates on your order status</p>
                </div>
                <div className="smartcart-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
                  <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Wishlist & Favorites</h3>
                  <p style={{ color: '#6b7280' }}>Save items for later and get price alerts</p>
                </div>
                <div className="smartcart-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                  <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Personalized Deals</h3>
                  <p style={{ color: '#6b7280' }}>Exclusive offers based on your preferences</p>
                </div>
                <div className="smartcart-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                  <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Priority Support</h3>
                  <p style={{ color: '#6b7280' }}>24/7 dedicated customer service for members</p>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

        </>
      )}

      {currentPage === 'about' && AboutUs && (
        <AboutUs 
          onNavigateHome={() => setCurrentPage('home')}
          onContactUs={() => {
            alert('Contact feature coming soon! 📧');
          }}
        />
      )}

      {currentPage === 'verify-email' && (
        <VerifyEmail onDone={() => setCurrentPage('home')} />
      )}

      {currentPage === 'clothes' && ClothesPage && (
        <ClothesPage 
          onAddToCart={addToCart}
          isAuthenticated={isAuthenticated}
          onAuthRequired={handleAuthRequired}
          onViewProduct={(p) => { setSelectedProduct(p); setCurrentPage('product'); }}
        />
      )}

      {currentPage === 'gifts' && GiftsPage && (
        <GiftsPage 
          onAddToCart={addToCart}
          isAuthenticated={isAuthenticated}
          onAuthRequired={handleAuthRequired}
          onViewProduct={(p) => { setSelectedProduct(p); setCurrentPage('product'); }}
        />
      )}

      {currentPage === 'product' && selectedProduct && (
        <React.Suspense fallback={<div style={{ padding: '2rem' }}>Loading product...</div>}>
          {/* Lazy import to avoid initial bundle bloat */}
          {React.createElement(require('./components/ProductDetail').default, {
            product: selectedProduct,
            onClose: () => { setSelectedProduct(null); setCurrentPage('home'); },
            onAddToCart: addToCart,
            onBuyNow: buyNow,
            isAuthenticated,
            onAuthRequired: handleAuthRequired
          })}
        </React.Suspense>
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
