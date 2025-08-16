import React, { useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
// import AboutUs from './components/AboutUs';
// import Checkout from './components/Checkout';
// import OrderHistory from './components/OrderHistory';
// import ClothesPage from './components/ClothesPage';
// import GiftsPage from './components/GiftsPage';
import { clothesData, giftsData } from './data/products';

// Enhanced Product Card Component
const ProductCard = ({ product, onAddToCart, isAuthenticated, onAuthRequired }) => (
  <div className="smartcart-card" style={{ height: 'fit-content', position: 'relative' }}>
    {/* Discount Badge */}
    {product.discount > 0 && (
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: '#ef4444',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        zIndex: 1
      }}>
        -{product.discount}%
      </div>
    )}
    
    <img 
      src={product.image} 
      alt={product.name}
      style={{ 
        width: '100%', 
        height: '220px', 
        objectFit: 'cover', 
        borderRadius: '8px',
        marginBottom: '1rem' 
      }}
    />
    
    <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
      {product.name}
    </h3>
    
    {/* Product Details */}
    <div style={{ marginBottom: '1rem' }}>
      <p style={{ color: '#6b7280', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
        <span style={{ fontWeight: '600', color: '#4f46e5' }}>
          {product.brand || (product.type ? product.type.charAt(0).toUpperCase() + product.type.slice(1) : 'Product')}
        </span> • {product.category === 'clothes' ? (product.gender || 'Unisex') : (product.ageGroup || 'All Ages')}
      </p>
      <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
        {product.category === 'clothes' ? (product.fabric || 'Cotton') : (product.material || 'Quality')} • 
        <span style={{ color: '#059669', fontWeight: '600', marginLeft: '0.25rem' }}>
          ⭐ {parseFloat(product.rating || 4.5).toFixed(1)}
        </span>
      </p>
    </div>
    
    {/* Category-specific details */}
    {product.category === 'clothes' ? (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
          {(product.sizes || ['S', 'M', 'L']).slice(0, 4).map(size => (
            <span key={size} style={{
              fontSize: '0.7rem',
              padding: '0.15rem 0.4rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px',
              color: '#374151'
            }}>
              {size}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(product.colors || ['Blue', 'Red', 'Green']).slice(0, 3).map(color => (
            <div key={color} style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: color.toLowerCase() === 'multicolor' ? 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)' : 
                              color.toLowerCase() === 'check' ? '#8b5cf6' :
                              color.toLowerCase() === 'floral' ? '#ec4899' :
                              color.toLowerCase(),
              border: '1px solid #e5e7eb'
            }} />
          ))}
          {product.colors && product.colors.length > 3 && (
            <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>+{product.colors.length - 3}</span>
          )}
        </div>
      </div>
    ) : (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.4rem',
            backgroundColor: '#ddd6fe',
            color: '#5b21b6',
            borderRadius: '8px',
            textTransform: 'capitalize'
          }}>
            🎉 {product.occasion}
          </span>
          <span style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.4rem',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            borderRadius: '8px',
            textTransform: 'capitalize'
          }}>
            🚚 {product.deliverySpeed}
          </span>
        </div>
      </div>
    )}
    
    {/* Pricing */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <div>
        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#059669' }}>
          ₹{product.price}
        </span>
        {product.originalPrice > product.price && (
          <span style={{ 
            fontSize: '0.9rem', 
            color: '#6b7280', 
            textDecoration: 'line-through',
            marginLeft: '0.5rem'
          }}>
            ₹{product.originalPrice}
          </span>
        )}
      </div>
      <span style={{ 
        backgroundColor: product.category === 'clothes' ? '#ddd6fe' : '#fce7f3', 
        color: product.category === 'clothes' ? '#5b21b6' : '#be185d', 
        padding: '0.25rem 0.5rem', 
        borderRadius: '9999px', 
        fontSize: '0.8rem' 
      }}>
        ML: {(parseFloat(product.mlScore || 0.85) * 100).toFixed(0)}%
      </span>
    </div>
    
    <button 
      className="smartcart-button" 
      style={{ width: '100%' }}
      onClick={() => {
        if (isAuthenticated) {
          onAddToCart(product);
        } else {
          onAuthRequired();
        }
      }}
    >
      🛒 {isAuthenticated ? 'Add to Cart' : 'Sign In to Add'}
    </button>
  </div>
);

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
      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
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
        
        <button
          onClick={() => onNavigate('about')}
          style={{
            background: 'none',
            border: '2px solid rgba(255,255,255,0.3)',
            color: currentPage === 'about' ? '#fff' : 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            fontWeight: currentPage === 'about' ? 'bold' : 'normal',
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
        
        {/* Additional navigation items for logged-in users */}
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

            <button
              onClick={() => onNavigate('wishlist')}
              style={{
                background: 'none',
                border: '2px solid rgba(255,255,255,0.3)',
                color: currentPage === 'wishlist' ? '#fff' : 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                fontWeight: currentPage === 'wishlist' ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                backgroundColor: currentPage === 'wishlist' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (currentPage !== 'wishlist') {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (currentPage !== 'wishlist') {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }
              }}
            >
              💖 Wishlist
            </button>

        {/* Additional navigation items for logged-in users */}
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

            <button
              onClick={() => onNavigate('wishlist')}
              style={{
                background: 'none',
                border: '2px solid rgba(255,255,255,0.3)',
                color: currentPage === 'wishlist' ? '#fff' : 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                fontWeight: currentPage === 'wishlist' ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                backgroundColor: currentPage === 'wishlist' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (currentPage !== 'wishlist') {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (currentPage !== 'wishlist') {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }
              }}
            >
              💖 Wishlist
            </button>

            <button
              onClick={() => onNavigate('deals')}
              style={{
                background: 'none',
                border: '2px solid rgba(255,255,255,0.3)',
                color: currentPage === 'deals' ? '#fff' : 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                fontWeight: currentPage === 'deals' ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                backgroundColor: currentPage === 'deals' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (currentPage !== 'deals') {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (currentPage !== 'deals') {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }
              }}
            >
              🔥 Deals
            </button>

            <button
              onClick={() => onNavigate('profile')}
              style={{
                background: 'none',
                border: '2px solid rgba(255,255,255,0.3)',
                color: currentPage === 'profile' ? '#fff' : 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                fontWeight: currentPage === 'profile' ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                backgroundColor: currentPage === 'profile' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (currentPage !== 'profile') {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (currentPage !== 'profile') {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }
              }}
            >
              👤 Profile
            </button>
          </>
        )}
          </>
        )}
      </nav>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '20px'
            }}>
              <img 
                src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
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

// Cart Component
const Cart = ({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout, onClose }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#1f2937', margin: 0 }}>🛒 Your Cart</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>
        
        {cartItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            Your cart is empty
          </p>
        ) : (
          <>
            {cartItems.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                marginBottom: '1rem'
              }}>
                <img 
                  src={item.image} 
                  alt={item.name}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginRight: '1rem' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#1f2937', margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                  <p style={{ color: '#6b7280', margin: 0 }}>₹{item.price}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    style={{
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '4px',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer'
                    }}
                  >
                    −
                  </button>
                  <span style={{ padding: '0 0.5rem', fontWeight: 'bold' }}>{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    style={{
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '4px',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    style={{
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      marginLeft: '0.5rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total: ₹{total}</span>
              </div>
              <button 
                onClick={onCheckout}
                className="smartcart-button"
                style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
              >
                💳 Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Main App Component
const AppContent = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentPage, setCurrentPage] = useState('home');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  const { user, logout, isAuthenticated, loading } = useAuth();

  const addToCart = (product) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
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

  const handleOrderComplete = () => {
    setCartItems([]);
    setShowCheckout(false);
    alert('🎉 Order placed successfully! You can track your order in "My Orders" section.');
  };

  const handleAuthRequired = () => {
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
      {/* Navigation Header */}
      <header className="smartcart-gradient" style={{ 
        padding: '1.5rem', 
        color: 'white', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 
              style={{ margin: 0, cursor: 'pointer', fontSize: '1.8rem' }}
              onClick={() => setCurrentPage('home')}
            >
              🛒 SmartCart
            </h1>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <button
                onClick={() => setCurrentPage('home')}
                style={{
                  background: currentPage === 'home' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                🏠 Home
              </button>
              <button
                onClick={() => setCurrentPage('clothes')}
                style={{
                  background: currentPage === 'clothes' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                👔 Clothes
              </button>
              <button
                onClick={() => setCurrentPage('gifts')}
                style={{
                  background: currentPage === 'gifts' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                🎁 Gifts
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                style={{
                  background: currentPage === 'about' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ℹ️ About
              </button>
            </nav>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isAuthenticated && (
              <button
                onClick={() => setShowOrderHistory(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.5)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                📋 Orders
              </button>
            )}
            
            <button
              onClick={() => isAuthenticated ? setShowCart(true) : setShowAuthModal(true)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.5)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '1rem',
                position: 'relative'
              }}
            >
              🛒 Cart ({cartCount})
            </button>
            
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem' }}>👋 {user?.name}</span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  color: '#667eea',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                🔐 Sign In
              </button>
            )}
          </div>
        </div>
      </header>

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
              onClick={() => setShowAuthModal(true)}
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
                30 premium selections
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
              🔍 Browse All Clothes (1000)
            </button>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {clothesData.slice(0, 30).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                isAuthenticated={isAuthenticated}
                onAuthRequired={handleAuthRequired}
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
              🔍 Browse All Gifts (500)
            </button>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {giftsData.slice(0, 18).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                isAuthenticated={isAuthenticated}
                onAuthRequired={handleAuthRequired}
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

      {currentPage === 'about' && (
        <div>About Us Page Temporarily Disabled</div>
        /* <AboutUs 
          onNavigateHome={() => setCurrentPage('home')}
          onContactUs={() => {
            // You can implement contact functionality here
            alert('Contact feature coming soon! 📧');
          }}
        /> */
      )}

      {currentPage === 'clothes' && (
        <div>Clothes Page temporarily disabled</div>
        /* <ClothesPage 
          onAddToCart={addToCart}
          isAuthenticated={isAuthenticated}
          onAuthRequired={handleAuthRequired}
        /> */
      )}

      {currentPage === 'gifts' && (
        <div>Gifts Page temporarily disabled</div>
        /* <GiftsPage 
          onAddToCart={addToCart}
          isAuthenticated={isAuthenticated}
          onAuthRequired={handleAuthRequired}
        /> */
      )}

      {/* Cart Modal */}
      {showCart && isAuthenticated && (
        <div>Cart temporarily disabled</div>
        /* <Cart 
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
          onClose={() => setShowCart(false)}
        /> */
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSwitchMode={setAuthMode}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && isAuthenticated && (
        <div>Checkout temporarily disabled</div>
        /* <Checkout
          cartItems={cartItems}
          user={user}
          onClose={() => setShowCheckout(false)}
          onOrderComplete={handleOrderComplete}
        /> */
      )}

      {/* Order History Modal */}
      {showOrderHistory && isAuthenticated && (
        <div>Order History temporarily disabled</div>
        /* <OrderHistory
          user={user}
          onClose={() => setShowOrderHistory(false)}
        /> */
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
  return (
    <AuthProvider>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <header style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '2rem', 
          color: 'white', 
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>🛍️ SmartCart: Clothes & Gifts</h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem' }}>50 Unique Indian Clothing Items</p>
        </header>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {clothesData.slice(0, 50).map((product, index) => (
            <div key={index} style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              padding: '1rem',
              transition: 'transform 0.2s ease'
            }}>
              <img 
                src={product.image} 
                alt={product.name}
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover', 
                  borderRadius: '8px',
                  marginBottom: '1rem' 
                }}
              />
              <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>{product.name}</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                {product.gender} • {product.category}
              </p>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#059669' }}>
                ₹{product.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
