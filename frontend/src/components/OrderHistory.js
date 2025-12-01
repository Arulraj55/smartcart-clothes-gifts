import React, { useState, useEffect } from 'react';
import './OrderHistory.css';

const OrderHistory = ({ user, onClose, variant = 'modal' }) => {
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
  const displayStatus = (status) => (status === 'processing' ? 'pending' : status);

  const Wrapper = ({ children }) => {
    if (variant === 'page') {
      return <div style={{ background:'#f8fafc', borderRadius:32, padding:'2.25rem 1.75rem', boxShadow:'0 4px 18px -6px rgba(0,0,0,0.08)', border:'1px solid #e2e8f0' }}>{children}</div>;
    }
    return (
      <div className="order-history-overlay">
        <div className="order-history-modal">{children}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <Wrapper>
        <div className="order-history-header">
          <h2>{variant === 'page' ? '📦 My Orders' : '📦 Order History'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h3>Loading your orders...</h3>
        </div>
      </Wrapper>
    );
  }

  if (orders.length === 0) {
    return (
      <Wrapper>
        <div className="order-history-header">
          <h2>{variant === 'page' ? '📦 My Orders' : '📦 Order History'}</h2>
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
      </Wrapper>
    );
  }

  // Helper formatters
  const fmtCurrency = (n) => `₹${(n||0).toLocaleString('en-IN')}`;
  const statusTheme = (s) => {
    switch (s) {
      case 'delivered': return { bg: 'linear-gradient(135deg,#10b981,#059669)', text:'#fff' };
      case 'shipped': return { bg: 'linear-gradient(135deg,#3b82f6,#2563eb)', text:'#fff' };
      case 'processing': return { bg: 'linear-gradient(135deg,#f59e0b,#f97316)', text:'#fff' };
      case 'cancelled': return { bg: 'linear-gradient(135deg,#ef4444,#dc2626)', text:'#fff' };
      default: return { bg: 'linear-gradient(135deg,#64748b,#475569)', text:'#fff' };
    }
  };

  if (variant === 'page') {
    return (
      <Wrapper>
        {!selectedOrder && (
          <div className="orders-page-header">
            <div className="orders-page-headline">
              <h2>📦 My Orders</h2>
              <p className="orders-sub">You have {orders.length} order{orders.length !== 1 ? 's' : ''}</p>
            </div>
              <div className="orders-page-meta">
              <div className="orders-chip">{orders.filter(o=>o.status==='processing').length} Pending</div>
              <div className="orders-chip">{orders.filter(o=>o.status==='delivered').length} Delivered</div>
              <div className="orders-chip warning">{orders.filter(o=>o.status==='cancelled').length} Cancelled</div>
            </div>
          </div>
        )}

        <div className="orders-page-body">
          {selectedOrder ? (
            <div className="order-detail-layout">
              <div className="detail-top-bar">
                <button className="back-pill" onClick={()=>setSelectedOrder(null)}>← All Orders</button>
                <div className="detail-id">Order <span>#{selectedOrder.id}</span></div>
                {(() => { const t=statusTheme(selectedOrder.status); return (
                  <div className="detail-status" style={{ background:t.bg, color:t.text }}>
                    {getStatusIcon(selectedOrder.status)} {displayStatus(selectedOrder.status).toUpperCase()}
                  </div>); })()}
              </div>
              {selectedOrder.status !== 'cancelled' && (
                <div className="delivery-estimate-banner">
                  🚚 Your order will be delivered in <strong>{selectedOrder.deliveryDays || Math.floor(3 + (selectedOrder.id.charCodeAt(0) % 4))} days</strong>.
                </div>
              )}
              <div className="detail-grid">
                <div className="detail-col">
                  <div className="info-card">
                    <h4>📅 Order Information</h4>
                    <ul>
                      <li><label>Date</label><span>{new Date(selectedOrder.date).toLocaleDateString()}</span></li>
                      <li><label>Order ID</label><code>{selectedOrder.id}</code></li>
                      <li><label>Payment</label><span>{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span></li>
                    </ul>
                  </div>
                  <div className="info-card">
                    <h4>🚚 Delivery Address</h4>
                    <address>
                      <div>{selectedOrder.customer}</div>
                      {selectedOrder.address.street && <div>{selectedOrder.address.street}</div>}
                      <div>{selectedOrder.address.city}{selectedOrder.address.state && ','} {selectedOrder.address.state} {selectedOrder.address.zip}</div>
                      <div>{selectedOrder.address.country}</div>
                    </address>
                  </div>
                  <div className="items-card">
                    <h4>📦 Items ({selectedOrder.items.length})</h4>
                    <div className="items-list-grid">
                      {selectedOrder.items.map((item,i)=>{
                        const proxied = (item.image||'').startsWith('http')
                          ? `${(typeof window!== 'undefined' && (window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1') ? 'http://localhost:5000' : '')}/api/images/proxy?url=${encodeURIComponent(item.image)}`
                          : item.image;
                        return (
                          <div className="itm" key={i}>
                            <div className="thumb-wrap"><img src={proxied} alt={item.name} /></div>
                            <div className="meta">
                              <h5>{item.name}</h5>
                              <div className="attrs">
                                {item.size && <span className="attr">Size: {item.size}</span>}
                                {item.color && <span className="attr">Color: {item.color}</span>}
                                <span className="attr">Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="price-block">
                              <div className="each">{fmtCurrency(item.price)}</div>
                              <div className="total">{fmtCurrency(item.price * item.quantity)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="detail-col side">
                  <div className="summary-card">
                    <h4>💳 Summary</h4>
                    <div className="summary-rows">
                      <div className="row"><span>Subtotal</span><span>{fmtCurrency(selectedOrder.total)}</span></div>
                      <div className="row"><span>Shipping</span><span className="free">Free</span></div>
                      <div className="row total"><span>Total</span><span>{fmtCurrency(selectedOrder.total)}</span></div>
                    </div>
                    {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                      <button className="cancel-btn-modern" onClick={async ()=>{
                        if(!window.confirm('Cancel this order?')) return;
                        try {
                          const token = localStorage.getItem('token');
                          const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000/api' : '/api';
                          const res = await fetch(`${API_BASE_URL}/orders/cancel/${selectedOrder.id}`, { method:'PUT', headers:{ 'Authorization':`Bearer ${token}` }});
                          if(res.ok){ alert('Order cancelled.'); setSelectedOrder({ ...selectedOrder, status:'cancelled'}); } else { alert('Unable to cancel now.'); }
                        } catch { alert('Error cancelling order.'); }
                      }}>❌ Cancel Order</button>
                    )}
                  </div>
                  <div className="mini-note">
                    <strong>Status Guide:</strong>
                    <p>Processing → Shipped → Delivered. Cancel if needed before shipment confirmation.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="orders-grid-modern">
              {orders.map(order => {
                const deliveryDays = order.status !== 'cancelled' ? (order.deliveryDays || Math.floor(3 + (order.id.charCodeAt(0) % 4))) : null;
                const th = statusTheme(order.status);
                return (
                  <div key={order.id} className="order-card-modern" onClick={()=>setSelectedOrder(order)}>
                    <div className="oc-head">
                      <div className="id">#{order.id}</div>
                      <div className="badge" style={{ background:th.bg, color:th.text }}>{getStatusIcon(order.status)} {displayStatus(order.status).toUpperCase()}</div>
                    </div>
                    <div className="oc-date">{new Date(order.date).toLocaleDateString()}</div>
                    <div className="oc-meta">
                      <span>{order.items.length} item{order.items.length!==1?'s':''}</span>
                      <span className="dot" />
                      <span>{fmtCurrency(order.total)}</span>
                    </div>
                    {deliveryDays && (
                      <div className="oc-delivery">🚚 Delivered in <strong>{deliveryDays} days</strong></div>
                    )}
                    <div className="oc-footer">
                      <div className="total">Total: {fmtCurrency(order.total)}</div>
                      <button className="view-btn">Details →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Wrapper>
    );
  }

  // Default (modal) variant (existing structure preserved)
  return (
    <Wrapper>
      <div className="order-history-header">
        <h2>{'📦 Order History for ' + (user?.name || '')}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="order-history-content">
        {/* Fallback to prior selectedOrder structure for modal - keep minimal */}
        {selectedOrder ? (
          <div>
            <button className="back-button" onClick={()=>setSelectedOrder(null)}>← Back</button>
            <h3>Order #{selectedOrder.id}</h3>
            <p>{selectedOrder.items.length} items • {fmtCurrency(selectedOrder.total)}</p>
          </div>
        ) : (
          <div className="orders-list">
            <div className="orders-summary"><p>You have {orders.length} order{orders.length!==1?'s':''}</p></div>
            {orders.map(o=> (
              <div key={o.id} className="order-card" onClick={()=>setSelectedOrder(o)}>
                <div className="order-header">
                  <div className="order-info"><h3>Order #{o.id}</h3><p className="order-date">{new Date(o.date).toLocaleDateString()}</p></div>
                  <div className="order-status">{getStatusIcon(o.status)} {displayStatus(o.status)}</div>
                </div>
                <div className="order-footer"><div className="order-total">{fmtCurrency(o.total)}</div><button className="view-details-btn">View →</button></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default OrderHistory;
