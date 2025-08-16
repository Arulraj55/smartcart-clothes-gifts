import React, { useState, useEffect } from 'react';
import './OrderHistory.css';

const OrderHistory = ({ user, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // No local fallbacks; we fetch only from backend so refresh doesn't lose data

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:5000/api'
          : '/api';

        if (user && token) {
          // Fetch backend orders only
          const res = await fetch(`${API_BASE_URL}/orders/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const backendOrders = (data.orders || [])
              .filter(o => o.isPaid === true || o.paymentMethod === 'cod')
              .map(o => ({
              id: o._id,
              date: o.createdAt,
              status: o.orderStatus || (o.isDelivered ? 'delivered' : 'processing'),
              total: Math.round(o.totalPrice || 0),
              items: (o.orderItems || []).map(oi => ({
                name: oi.name,
                image: oi.image,
                price: oi.price,
                quantity: oi.quantity,
                size: oi.size,
                color: oi.color
              })),
              customer: user.name,
              email: user.email,
              address: {
                street: o.shippingAddress?.address || '',
                city: o.shippingAddress?.city || '',
                state: '',
                zip: o.shippingAddress?.postalCode || '',
                country: o.shippingAddress?.country || 'India'
              },
              paymentMethod: o.paymentMethod
            }));
            setOrders(backendOrders);
          } else {
            setOrders([]);
          }
        }
        // If no user or token, show empty
        if (!user || !token) setOrders([]);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // (Removed unused savePurchase helper; saving happens during checkout completion)

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'shipped': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'shipped': return '🚚';
      case 'processing': return '⏳';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch ((method || '').toLowerCase()) {
      case 'stripe':
        return 'Credit/Debit Card';
      case 'razorpay':
        return 'UPI/Wallets';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method || 'Payment';
    }
  };

  if (loading) {
    return (
      <div className="order-history-overlay">
        <div className="order-history-modal">
          <div className="order-history-header">
            <h2>📦 Order History</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <h3>Loading your orders...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-history-overlay">
        <div className="order-history-modal">
          <div className="order-history-header">
            <h2>📦 Order History</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="order-history-content">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
              <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>No Orders Yet</h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                You haven't made any purchases yet. Start shopping to see your orders here!
              </p>
              <button 
                className="smartcart-button"
                onClick={onClose}
                style={{ padding: '0.75rem 2rem' }}
              >
                Start Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-overlay">
      <div className="order-history-modal">
        <div className="order-history-header">
          <h2>📦 Order History for {user?.name}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="order-history-content">
          {selectedOrder ? (
            <div className="order-details">
              <button
                className="back-button"
                onClick={() => setSelectedOrder(null)}
              >
                ← Back to Orders
              </button>

              <div className="order-details-header">
                <h3>Order #{selectedOrder.id}</h3>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(selectedOrder.status),
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getStatusIcon(selectedOrder.status)} {selectedOrder.status.toUpperCase()}
                </span>
              </div>

              <div className="order-info-grid">
                <div className="info-section">
                  <h4>📅 Order Information</h4>
                  <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}</p>
                  <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                  <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
                  {/* Human-friendly label */}
                  <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                    {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                  </p>
                </div>

                <div className="info-section">
                  <h4>🚚 Delivery Address</h4>
                  <p>{selectedOrder.customer}</p>
                  <p>{selectedOrder.address.street}</p>
                  <p>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zip}</p>
                  <p>{selectedOrder.address.country}</p>
                </div>
              </div>

              <div className="order-items-detail">
                <h4>📦 Items Ordered ({selectedOrder.items.length})</h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="item-detail">
                    <img 
                      src={(item.image || '').startsWith('http') 
                        ? `${(typeof window!== 'undefined' && (window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1') ? 'http://localhost:5000' : '')}/api/images/proxy?url=${encodeURIComponent(item.image)}` 
                        : item.image} 
                      alt={item.name} 
                    />
                    <div className="item-info">
                      <h5>{item.name}</h5>
                      {item.size && <p><strong>Size:</strong> {item.size}</p>}
                      {item.color && <p><strong>Color:</strong> {item.color}</p>}
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      <p>₹{item.price} each</p>
                      <p><strong>₹{item.price * item.quantity}</strong></p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div className="summary-line">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
                <div className="summary-line">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="summary-line total">
                  <span><strong>Total:</strong></span>
                  <span><strong>₹{selectedOrder.total}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="orders-list">
              <div className="orders-summary">
                <p>You have {orders.length} order{orders.length !== 1 ? 's' : ''}</p>
              </div>

              {orders.map((order) => (
                <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order.id}</h3>
                      <p className="order-date">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="order-status">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {getStatusIcon(order.status)} {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {/* Short details only */}
                  <div className="order-items">
                    <div className="items-preview">
                      <div className="item-preview" style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{fontSize:'0.9rem', color:'#374151'}}>
                          {order.items.length} item{order.items.length!==1?'s':''}
                        </div>
                        <div style={{color:'#6b7280'}}>
                          • Total ₹{order.total}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <strong>Total: ₹{order.total}</strong>
                    </div>
                    <button className="view-details-btn">View Details →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
