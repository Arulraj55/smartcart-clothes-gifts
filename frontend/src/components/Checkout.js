import React, { useState } from 'react';
import './Checkout.css';

const Checkout = ({ cartItems, onClose, onOrderComplete, user }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [orderDetails, setOrderDetails] = useState({
    shippingAddress: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    paymentMethod: 'stripe',
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

  const handleInputChange = (section, field, value) => {
    // Support updating top-level fields like paymentMethod when section is empty/null
    if (!section) {
      setOrderDetails(prev => ({ ...prev, [field]: value }));
      return;
    }
    setOrderDetails(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateShipping = () => {
    const s = orderDetails.shippingAddress;
    const newErrors = {};
    if (!s.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!/^\d{10}$/.test((s.phone || '').replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit phone number';
    if (!s.address?.trim()) newErrors.address = 'Address is required';
    if (!s.city?.trim()) newErrors.city = 'City is required';
    if (!s.state?.trim()) newErrors.state = 'State is required';
    if (!/^\d{5,6}$/.test((s.pincode || '').replace(/\D/g, ''))) newErrors.pincode = 'Enter a valid 5-6 digit pincode';
    setErrors(prev => ({ ...prev, shipping: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Pure check (no state updates) for render-time disabling
  const isShippingValid = () => {
    const s = orderDetails.shippingAddress;
    return !!(
      s.fullName?.trim() &&
      /^\d{10}$/.test((s.phone || '').replace(/\D/g, '')) &&
      s.address?.trim() &&
      s.city?.trim() &&
      s.state?.trim() &&
      /^\d{5,6}$/.test((s.pincode || '').replace(/\D/g, ''))
    );
  };

  const validatePayment = () => {
    // Allow Razorpay and COD without card details
    if (orderDetails.paymentMethod !== 'stripe') return true;
    const c = orderDetails.cardDetails;
    const payErrors = {};
    if (!c.cardholderName?.trim()) payErrors.cardholderName = 'Cardholder name is required';
    if (!/^\d{16}$/.test((c.cardNumber || '').replace(/\s+/g, ''))) payErrors.cardNumber = 'Enter a 16-digit card number';
    if (!/^\d{2}\/\d{2}$/.test(c.expiryDate || '')) payErrors.expiryDate = 'Use MM/YY format';
    if (!/^\d{3}$/.test(c.cvv || '')) payErrors.cvv = 'Enter 3-digit CVV';
    setErrors(prev => ({ ...prev, payment: payErrors }));
    return Object.keys(payErrors).length === 0;
  };

  const isPaymentValid = () => {
    if (orderDetails.paymentMethod !== 'stripe') return true; // Razorpay and COD don't need card fields here
    const c = orderDetails.cardDetails;
    return !!(
      c.cardholderName?.trim() &&
      /^\d{16}$/.test((c.cardNumber || '').replace(/\s+/g, '')) &&
      /^\d{2}\/\d{2}$/.test(c.expiryDate || '') &&
      /^\d{3}$/.test(c.cvv || '')
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateShipping()) return;
    }
    if (step === 2) {
      if (!validatePayment()) return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const loadScript = (src) => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    // Handle Razorpay real flow via backend
    if (orderDetails.paymentMethod === 'razorpay') {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:5000/api'
          : '/api';

  // 1) Create order in backend (only if we intend to pay)
        const orderPayload = {
          items: cartItems.map(it => ({
            product: it._id || it.id, // best effort
            name: it.name,
            image: it.image,
            price: it.price,
            quantity: it.quantity || 1,
            size: it.size || 'M',
            color: it.color || 'Default'
          })),
          shippingAddress: orderDetails.shippingAddress,
          paymentMethod: 'razorpay'
        };
  const createOrderRes = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(orderPayload)
        });
        if (!createOrderRes.ok) throw new Error(`Create order failed: ${createOrderRes.status}`);
        const { order: backendOrder } = await createOrderRes.json();

        // 2) Create Razorpay order at backend
        const amount = total; // INR
        const rpRes = await fetch(`${API_BASE_URL}/payment/create-razorpay-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ amount, currency: 'INR', orderId: backendOrder._id })
        });
        if (!rpRes.ok) throw new Error(`Razorpay order create failed: ${rpRes.status}`);
        const rpData = await rpRes.json();
        const { order: rpOrder } = rpData;

        // 3) Load Razorpay and open checkout
  const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!ok) throw new Error('Failed to load Razorpay SDK');

        // 4) Get key from backend config
        const cfgRes = await fetch(`${API_BASE_URL}/payment/config`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        const cfg = await cfgRes.json();
        const key = cfg?.config?.razorpayKeyId || process.env.REACT_APP_RAZORPAY_KEY || '';
        if (!key) throw new Error('Razorpay key missing');

        // Detect if we might be inside a WebView (very basic heuristics)
        const ua = navigator.userAgent || '';
        const isWebView = /wv|webview|Crosswalk|; wv\)/i.test(ua) || (window.ReactNativeWebView != null);

        const rzpOptions = {
          key,
          amount: rpOrder.amount,
          currency: rpOrder.currency,
          name: 'SmartCart',
          description: 'Order Payment',
          order_id: rpOrder.id,
          method: { upi: true, wallet: true, card: true, netbanking: true },
          prefill: {
            name: orderDetails.shippingAddress.fullName,
      contact: orderDetails.shippingAddress.phone,
      email: user?.email || ''
          },
          theme: { color: '#667eea' },
          handler: async function (response) {
            try {
              const verifyRes = await fetch(`${API_BASE_URL}/payment/verify-razorpay-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: backendOrder._id
                })
              });
              if (!verifyRes.ok) throw new Error('Payment verification failed');
              // Clear backend cart after successful payment
              try {
                await fetch(`${API_BASE_URL}/cart/clear`, {
                  method: 'DELETE',
                  headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                });
              } catch {}
              setOrderConfirmed(true);
              setTimeout(() => {
                onOrderComplete && onOrderComplete();
                onClose && onClose();
              }, 1500);
            } catch (e) {
              alert('Payment verification failed');
            }
          },
        };

        if (isWebView) {
          // Use redirect/callback flow for WebView compatibility
          rzpOptions.redirect = true;
          rzpOptions.callback_url = `${API_BASE_URL}/payment/razorpay/callback?orderId=${encodeURIComponent(backendOrder._id)}`;
        } else {
          rzpOptions.modal = {
            ondismiss: function () {
              // User closed the payment modal without paying
            }
          };
        }

        const rzp = new window.Razorpay(rzpOptions);
        rzp.open();
      } catch (err) {
        console.error(err);
        alert(err.message || 'Payment initialization failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    // COD or Stripe simulation (create backend order for history)
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : '/api';

      const method = orderDetails.paymentMethod === 'cod' ? 'cod' : 'stripe';
      const orderPayload = {
        items: cartItems.map(it => ({
          product: it._id || it.id,
          name: it.name,
          image: it.image,
          price: it.price,
          quantity: it.quantity || 1,
          size: it.size || 'M',
          color: it.color || 'Default'
        })),
        shippingAddress: orderDetails.shippingAddress,
        paymentMethod: method
      };
      // Best-effort create; ignore failure
      await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderPayload)
      }).catch(() => {});

      // Clear backend cart after placing COD/Stripe order
      try {
        await fetch(`${API_BASE_URL}/cart/clear`, {
          method: 'DELETE',
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
      } catch {}

      setOrderConfirmed(true);
      setTimeout(() => {
        onOrderComplete && onOrderComplete();
        onClose && onClose();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="checkout-steps">
      <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
        <div className="step-number">1</div>
        <div className="step-label">Shipping Details</div>
      </div>
      <div className={`step-line ${step > 1 ? 'completed' : ''}`}></div>
      <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
        <div className="step-number">2</div>
        <div className="step-label">Payment</div>
      </div>
      <div className={`step-line ${step > 2 ? 'completed' : ''}`}></div>
      <div className={`step ${step >= 3 ? 'active' : ''}`}>
        <div className="step-number">3</div>
        <div className="step-label">Confirmation</div>
      </div>
    </div>
  );

  const renderShippingForm = () => (
    <div className="checkout-section">
      <h3>🚚 Shipping Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={orderDetails.shippingAddress.fullName}
            onChange={(e) => handleInputChange('shippingAddress', 'fullName', e.target.value)}
            placeholder="Enter your full name"
          />
          {errors.shipping?.fullName && <div className="error-text">{errors.shipping.fullName}</div>}
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={orderDetails.shippingAddress.phone}
            onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
            placeholder="Enter your phone number"
          />
          {errors.shipping?.phone && <div className="error-text">{errors.shipping.phone}</div>}
        </div>
        <div className="form-group full-width">
          <label>Address</label>
          <input
            type="text"
            value={orderDetails.shippingAddress.address}
            onChange={(e) => handleInputChange('shippingAddress', 'address', e.target.value)}
            placeholder="Enter your complete address"
          />
          {errors.shipping?.address && <div className="error-text">{errors.shipping.address}</div>}
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            value={orderDetails.shippingAddress.city}
            onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
            placeholder="Enter your city"
          />
          {errors.shipping?.city && <div className="error-text">{errors.shipping.city}</div>}
        </div>
        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            value={orderDetails.shippingAddress.state}
            onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
            placeholder="Enter your state"
          />
          {errors.shipping?.state && <div className="error-text">{errors.shipping.state}</div>}
        </div>
        <div className="form-group">
          <label>Pincode</label>
          <input
            type="text"
            value={orderDetails.shippingAddress.pincode}
            onChange={(e) => handleInputChange('shippingAddress', 'pincode', e.target.value)}
            placeholder="Enter pincode"
          />
          {errors.shipping?.pincode && <div className="error-text">{errors.shipping.pincode}</div>}
        </div>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="checkout-section">
      <h3>💳 Payment Information</h3>
      
      <div className="payment-methods">
        <div className="payment-method">
          <input
            type="radio"
            id="stripe"
            name="paymentMethod"
            value="stripe"
            checked={orderDetails.paymentMethod === 'stripe'}
            onChange={(e) => handleInputChange('', 'paymentMethod', e.target.value)}
          />
          <label htmlFor="stripe">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=40&fit=crop" alt="Card" />
            Credit/Debit Card
          </label>
        </div>
        
        <div className="payment-method">
          <input
            type="radio"
            id="razorpay"
            name="paymentMethod"
            value="razorpay"
            checked={orderDetails.paymentMethod === 'razorpay'}
            onChange={(e) => handleInputChange('', 'paymentMethod', e.target.value)}
          />
          <label htmlFor="razorpay">
            <img src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=40&h=40&fit=crop" alt="UPI/Wallets" />
            UPI/Wallets
          </label>
        </div>

        <div className="payment-method">
          <input
            type="radio"
            id="cod"
            name="paymentMethod"
            value="cod"
            checked={orderDetails.paymentMethod === 'cod'}
            onChange={(e) => handleInputChange('', 'paymentMethod', e.target.value)}
          />
          <label htmlFor="cod">
            <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=40&h=40&fit=crop" alt="Cash on Delivery" />
            Cash on Delivery
          </label>
        </div>
      </div>

      {orderDetails.paymentMethod === 'stripe' && (
        <div className="card-details">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Cardholder Name</label>
              <input
                type="text"
                value={orderDetails.cardDetails.cardholderName}
                onChange={(e) => handleInputChange('cardDetails', 'cardholderName', e.target.value)}
                placeholder="Name on card"
              />
              {errors.payment?.cardholderName && <div className="error-text">{errors.payment.cardholderName}</div>}
            </div>
            <div className="form-group full-width">
              <label>Card Number</label>
              <input
                type="text"
                value={orderDetails.cardDetails.cardNumber}
                onChange={(e) => handleInputChange('cardDetails', 'cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              {errors.payment?.cardNumber && <div className="error-text">{errors.payment.cardNumber}</div>}
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                value={orderDetails.cardDetails.expiryDate}
                onChange={(e) => handleInputChange('cardDetails', 'expiryDate', e.target.value)}
                placeholder="MM/YY"
                maxLength="5"
              />
              {errors.payment?.expiryDate && <div className="error-text">{errors.payment.expiryDate}</div>}
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                value={orderDetails.cardDetails.cvv}
                onChange={(e) => handleInputChange('cardDetails', 'cvv', e.target.value)}
                placeholder="123"
                maxLength="3"
              />
              {errors.payment?.cvv && <div className="error-text">{errors.payment.cvv}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrderSummary = () => (
    <div className="order-summary">
      <h3>📋 Order Summary</h3>
      <div className="order-items">
        {cartItems.map(item => (
          <div key={item.id} className="order-item">
            <img 
              src={(item.image || '').startsWith('http') 
                ? `${(typeof window!== 'undefined' && (window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1') ? 'http://localhost:5000' : '')}/api/images/proxy?url=${encodeURIComponent(item.image)}` 
                : item.image} 
              alt={item.name} 
            />
            <div className="item-details">
              <h4>{item.name}</h4>
              <p>Size: {item.size || 'M'} | Color: {item.color || 'Default'}</p>
              <p>Qty: {item.quantity} × ₹{item.price}</p>
            </div>
            <div className="item-total">₹{item.price * item.quantity}</div>
          </div>
        ))}
      </div>
      
      <div className="order-totals">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="total-row">
          <span>Shipping:</span>
          <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
        </div>
        <div className="total-row">
          <span>Tax (18% GST):</span>
          <span>₹{tax}</span>
        </div>
        <div className="total-row final-total">
          <span>Total:</span>
          <span>₹{total}</span>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="checkout-section">
      {!orderConfirmed ? (
        <>
          <h3>✅ Review Your Order</h3>
          <div className="confirmation-details">
            <div className="detail-section">
              <h4>Shipping Address</h4>
              <p>
                {orderDetails.shippingAddress.fullName}<br/>
                {orderDetails.shippingAddress.address}<br/>
                {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.pincode}<br/>
                Phone: {orderDetails.shippingAddress.phone}
              </p>
            </div>
            
            <div className="detail-section">
              <h4>Payment Method</h4>
              <p>
                {orderDetails.paymentMethod === 'stripe'
                  ? 'Credit/Debit Card'
                  : orderDetails.paymentMethod === 'razorpay'
                  ? 'UPI/Wallets'
                  : 'Cash on Delivery'}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="order-success">
          <div className="success-animation">
            <div className="checkmark">✓</div>
          </div>
          <h3>🎉 Order Placed Successfully!</h3>
          <p>Thank you for your purchase. Your order is being processed.</p>
          <p><strong>Order ID:</strong> #ORD{Date.now()}</p>
          <div className="success-image">
            <img 
              src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&h=200&fit=crop" 
              alt="Order Success" 
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        <div className="checkout-header">
          <h2>🛒 Checkout</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {renderStepIndicator()}

        <div className="checkout-content">
          <div className="checkout-main">
            {step === 1 && renderShippingForm()}
            {step === 2 && renderPaymentForm()}
            {step === 3 && renderConfirmation()}
          </div>

          <div className="checkout-sidebar">
            {renderOrderSummary()}
          </div>
        </div>

        {!orderConfirmed && (
          <div className="checkout-actions">
            <button className="btn-secondary" onClick={handlePreviousStep} disabled={step === 1}>
              ← Previous
            </button>
            {step < 3 ? (
              <button
                className="btn-primary"
                onClick={handleNextStep}
                disabled={(step === 1 && !isShippingValid()) || (step === 2 && !isPaymentValid())}
              >
                Next →
              </button>
            ) : (
              <button
                className="btn-primary place-order"
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Processing...
                  </>
                ) : (
                  '🛍️ Place Order'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
