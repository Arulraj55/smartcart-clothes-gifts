import React from 'react';

const Cart = ({ cartItems = [], onUpdateQuantity, onRemoveItem, onCheckout, onClose }) => {
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const handleQuantityChange = (id, nextQty) => {
    if (nextQty <= 0) {
      onRemoveItem?.(id);
    } else {
      onUpdateQuantity?.(id, nextQty);
    }
  };

  return (
    <>
      <div
        onClick={() => onClose?.()}
        style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(17, 24, 39, 0.6)', 
          backdropFilter: 'blur(8px)', 
          zIndex: 1999
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          height: '100vh'
        }}
      >
        <div
          style={{
            flex: 1,
            width: '100%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
            position: 'relative',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: -80, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15), transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -50, width: 250, height: 250, background: 'radial-gradient(circle, rgba(129, 140, 248, 0.15), transparent 70%)', filter: 'blur(80px)' }} />

          <div
            style={{
              maxWidth: '900px',
              margin: '0 auto',
              padding: '2rem 1.5rem 2.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' }}>
              <div>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: '2.5rem', 
                  fontWeight: 900, 
                  background: 'linear-gradient(135deg, #0f172a, #374151)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent'
                }}>
                  Your Cart
                </h1>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  color: '#64748b', 
                  fontSize: '1rem'
                }}>
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your <strong style={{ fontWeight:700 }}>cart</strong>
                </p>
              </div>
              <button
                onClick={() => onClose?.()}
                style={{
                  background: 'linear-gradient(#ffffff,#f8fafc)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  boxShadow: '0 2px 6px -2px rgba(0,0,0,0.15)',
                  transition: 'all .18s ease'
                }}
                aria-label="Close cart"
                onMouseEnter={e=>{e.currentTarget.style.background='#ef4444';e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.transform='scale(1.08)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='linear-gradient(#ffffff,#f8fafc)';e.currentTarget.style.color='#64748b';e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.transform='scale(1)';}}
              >
                ×
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '60vh', 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: 32,
                border: '2px dashed rgba(226,232,240,0.6)',
                padding: '4rem 2rem'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}></div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '2rem', 
                  fontWeight: 800, 
                  color: '#0f172a',
                  marginBottom: '0.8rem'
                }}>
                  Your cart is empty
                </h2>
                <p style={{ 
                  margin: 0, 
                  maxWidth: 500, 
                  color: '#64748b', 
                  fontSize: '1.1rem',
                  marginBottom: '2rem'
                }}>
                  Discover amazing products and add them to your cart!
                </p>
                <button
                  onClick={() => onClose?.()}
                  style={{
                    padding: '1rem 2.5rem',
                    borderRadius: 25,
                    border: 'none',
                    background: 'linear-gradient(135deg, #ec4899, #6366f1)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {cartItems.map((item, idx) => (
                    <div
                      key={`${item.id || idx}-cart-item`}
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: 28,
                        border: '1px solid rgba(226,232,240,0.3)',
                        padding: '1.8rem',
                        boxShadow: '0 8px 32px -12px rgba(0,0,0,0.08), 0 2px 8px -4px rgba(0,0,0,0.04)',
                        display: 'flex',
                        gap: '1.5rem',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        height: '3px', 
                        background: `linear-gradient(90deg, 
                          hsl(${(idx * 60) % 360}, 70%, 60%), 
                          hsl(${((idx * 60) + 120) % 360}, 70%, 60%))`,
                        opacity: 0.8
                      }} />
                      
                      <div style={{ 
                        width: 140, 
                        height: 140, 
                        flexShrink: 0, 
                        borderRadius: 24, 
                        overflow: 'hidden', 
                        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                        boxShadow: '0 8px 24px -8px rgba(0,0,0,0.1)'
                      }}>
                        <img
                          src={(item.image || '').startsWith('http')
                            ? `${(typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : '')}/api/images/proxy?url=${encodeURIComponent(item.image)}`
                            : item.image}
                          alt={item.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                          onError={(e) => { 
                            e.currentTarget.src = `https://via.placeholder.com/140x140/e2e8f0/64748b?text=${encodeURIComponent(item.name?.charAt(0) || '?')}`; 
                          }}
                        />
                      </div>

                      <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.8rem'
                      }}>
                        <div style={{ 
                          fontWeight: 900, 
                          fontSize: '1.4rem', 
                          color: '#0f172a'
                        }}>
                          {item.name}
                        </div>
                        <div style={{ 
                          fontSize: '0.95rem', 
                          color: '#64748b', 
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.8rem'
                        }}>
                          <span style={{ 
                            background: 'linear-gradient(135deg, #ec4899, #6366f1)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 700
                          }}>
                            {item.collection || item.brand || 'Style Central'}
                          </span>
                          <span style={{ color: '#cbd5e1' }}></span>
                          <span>{item.category || 'Fashion'}</span>
                        </div>
                        <div style={{ 
                          fontSize: '1.6rem', 
                          color: '#059669', 
                          fontWeight: 900
                        }}>
                          {item.price.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '1.2rem'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.6rem', 
                          background: 'rgba(255,255,255,0.9)', 
                          borderRadius: 20, 
                          border: '1px solid rgba(226,232,240,0.4)', 
                          padding: '0.6rem 1rem',
                          boxShadow: '0 4px 12px -6px rgba(0,0,0,0.1)'
                        }}>
                          <button
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                            style={{ 
                              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '50%',
                              width: 36,
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800, 
                              fontSize: '1.1rem', 
                              cursor: 'pointer', 
                              color: '#475569'
                            }}
                          >-
                          </button>
                          <span style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: 800, 
                            minWidth: 32, 
                            textAlign: 'center',
                            color: '#0f172a'
                          }}>
                            {item.quantity || 1}
                          </span>
                          <button
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                            style={{ 
                              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '50%',
                              width: 36,
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800, 
                              fontSize: '1.1rem', 
                              cursor: 'pointer', 
                              color: '#475569'
                            }}
                          >+
                          </button>
                        </div>

                        <div style={{ 
                          fontSize: '1.8rem', 
                          fontWeight: 900, 
                          color: '#059669',
                          textAlign: 'center'
                        }}>
                          {(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                        </div>

                        <button
                          onClick={() => onRemoveItem?.(item.id)}
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.08)', 
                            color: '#dc2626', 
                            border: 'none', 
                            borderRadius: 16, 
                            padding: '0.6rem 1.2rem', 
                            fontSize: '0.8rem', 
                            fontWeight: 700, 
                            cursor: 'pointer'
                          }}
                        >
                           Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.98)',
                    borderRadius: 32,
                    border: '1px solid rgba(226,232,240,0.4)',
                    padding: '2.5rem',
                    boxShadow: '0 20px 48px -20px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: '4px', 
                    background: 'linear-gradient(90deg, #ec4899, #6366f1, #10b981)', 
                    opacity: 0.8 
                  }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.8rem', 
                      fontWeight: 900, 
                      color: '#0f172a',
                      textAlign: 'center'
                    }}>
                      Order Summary
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '1.1rem', 
                        color: '#64748b', 
                        fontWeight: 600 
                      }}>
                        <span>Subtotal</span>
                        <span style={{ fontWeight: 700 }}>{totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '1.1rem', 
                        color: '#64748b', 
                        fontWeight: 600 
                      }}>
                        <span>Shipping</span>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>Free</span>
                      </div>
                      <div style={{ 
                        height: '1px', 
                        background: 'linear-gradient(90deg, transparent, rgba(226,232,240,0.6), transparent)',
                        margin: '0.5rem 0'
                      }} />
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '1rem 0'
                      }}>
                        <span style={{ 
                          fontWeight: 900, 
                          color: '#0f172a', 
                          fontSize: '1.4rem' 
                        }}>
                          Total
                        </span>
                        <span style={{ 
                          fontWeight: 900, 
                          fontSize: '2rem', 
                          background: 'linear-gradient(135deg, #059669, #10b981)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                      <button
                        onClick={() => onCheckout?.()}
                        style={{
                          width: '100%',
                          border: 'none',
                          borderRadius: 20,
                          padding: '1.2rem 2rem',
                          background: 'linear-gradient(135deg, #ec4899, #6366f1)',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          cursor: 'pointer',
                          boxShadow: '0 12px 32px -12px rgba(99,102,241,0.4)'
                        }}
                      >
                         Proceed to Checkout
                      </button>
                      <button
                        onClick={() => onClose?.()}
                        style={{
                          width: '100%',
                          border: '1px solid rgba(226,232,240,0.6)',
                          borderRadius: 20,
                          padding: '1rem 2rem',
                          background: 'rgba(248,250,252,0.8)',
                          color: '#64748b',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: 'pointer'
                        }}
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;