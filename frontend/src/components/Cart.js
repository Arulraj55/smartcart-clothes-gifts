import React from 'react';

const Cart = ({ cartItems = [], onUpdateQuantity, onRemoveItem, onCheckout, onClose }) => {
  return (
    <>
      {/* Overlay to close cart when clicking outside */}
      <div
        onClick={() => onClose && onClose()}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1999 }}
      />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '360px', background: '#fff', borderLeft: '1px solid #e5e7eb', boxShadow: '-2px 0 8px rgba(0,0,0,0.05)', padding: '1rem', zIndex: 2000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Your Cart</h2>
          <button onClick={() => onClose && onClose()} aria-label="Close cart" style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
      {cartItems.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Your cart is empty.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cartItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <img 
                src={(item.image || '').startsWith('http')
                  ? `${(typeof window!== 'undefined' && (window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1') ? 'http://localhost:5000' : '')}/api/images/proxy?url=${encodeURIComponent(item.image)}`
                  : item.image}
                alt={item.name} 
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} 
                onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/96x96/cccccc/000000?text=${encodeURIComponent(item.name||'Item')}`; }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>₹{item.price} × {item.quantity || 1}</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, Math.max((item.quantity||1)-1, 1))}>-</button>
                <button onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, (item.quantity||1)+1)}>+</button>
                <button onClick={() => onRemoveItem && onRemoveItem(item.id)} style={{ color: '#dc2626' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Total</strong>
        <span>₹{cartItems.reduce((s, it) => s + (it.price * (it.quantity||1)), 0)}</span>
        </div>
        <button onClick={() => onCheckout && onCheckout()} style={{ marginTop: '1rem', width: '100%', padding: '0.5rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Checkout</button>
      </div>
    </>
  );
};

export default Cart;
