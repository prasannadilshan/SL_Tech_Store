import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => { if (isAuthenticated) fetchCart(); }, []);

  if (!isAuthenticated) return <div className="empty-state" style={{ padding: 80 }}><h2>Please login to view cart</h2><Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Sign In</Link></div>;
  if (!cart || cart.items.length === 0) return <div className="empty-state" style={{ padding: 80 }}><FiShoppingBag size={64} /><h2>Your cart is empty</h2><Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Products</Link></div>;

  return (
    <div className="container section">
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Shopping Cart</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <div>
          {cart.items.map(item => (
            <div key={item.productId} className="card" style={{ display: 'flex', gap: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ width: 100, height: 100, borderRadius: 8, overflow: 'hidden', background: 'var(--gray-50)', flexShrink: 0 }}>
                {item.productImage ? <img src={item.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>💻</div>}
              </div>
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.productId}`} style={{ fontWeight: 700, fontSize: 15 }}>{item.productName}</Link>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-700)', margin: '8px 0' }}>Rs. {item.price.toLocaleString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--gray-200)', borderRadius: 8 }}>
                    <button className="btn btn-sm" onClick={() => updateItem(item.productId, item.quantity - 1)}><FiMinus /></button>
                    <span style={{ padding: '0 12px', fontWeight: 700 }}>{item.quantity}</span>
                    <button className="btn btn-sm" onClick={() => updateItem(item.productId, item.quantity + 1)}><FiPlus /></button>
                  </div>
                  <button className="btn btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeItem(item.productId)}><FiTrash2 /></button>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
          <h3 style={{ marginBottom: 16 }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--gray-600)' }}><span>Items ({cart.items.reduce((s, i) => s + i.quantity, 0)})</span><span>Rs. {cart.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}</span></div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}><span>Total</span><span>Rs. {cart.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}</span></div>
          <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
