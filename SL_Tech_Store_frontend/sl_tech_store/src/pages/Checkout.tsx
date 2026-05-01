import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart } = useCartStore();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<'EXPRESS' | 'STORE_PICKUP'>('EXPRESS');
  const [address, setAddress] = useState({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Sri Lanka', isDefault: true, id: '' });
  const [loading, setLoading] = useState(false);

  if (!cart || cart.items.length === 0) { navigate('/cart'); return null; }

  const deliveryFee = delivery === 'EXPRESS' ? 500 : 0;
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address,
        deliveryOption: delivery,
      };
      const res = await orderService.createOrder(data);
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data.data.id}`);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Order failed'); }
    setLoading(false);
  };

  return (
    <div className="container section">
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Checkout</h1>
      <form onSubmit={handleOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>Shipping Address</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['fullName','Full Name'],['phone','Phone'],['street','Street Address'],['city','City'],['state','State/Province'],['postalCode','Postal Code']].map(([k,l]) => (
                <input key={k} className="input" placeholder={l} value={(address as any)[k]} onChange={e => setAddress({...address, [k]: e.target.value})} required style={k === 'street' ? { gridColumn: '1/-1' } : {}} />
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Delivery Option</h3>
            {[{ value: 'EXPRESS' as const, label: 'Express Delivery', desc: '1-2 business days', fee: 500 }, { value: 'STORE_PICKUP' as const, label: 'Store Pickup', desc: 'Same day', fee: 0 }].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: `2px solid ${delivery === opt.value ? 'var(--primary-500)' : 'var(--gray-200)'}`, borderRadius: 12, marginBottom: 8, cursor: 'pointer', background: delivery === opt.value ? 'var(--primary-50)' : 'white' }}>
                <input type="radio" name="delivery" checked={delivery === opt.value} onChange={() => setDelivery(opt.value)} />
                <div style={{ flex: 1 }}><strong>{opt.label}</strong><div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{opt.desc}</div></div>
                <span style={{ fontWeight: 700 }}>{opt.fee > 0 ? `Rs. ${opt.fee}` : 'Free'}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
          <h3 style={{ marginBottom: 16 }}>Order Summary</h3>
          {cart.items.map(i => (
            <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span>{i.productName} x{i.quantity}</span><span>Rs. {(i.price * i.quantity).toLocaleString()}</span>
            </div>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Delivery</span><span>Rs. {deliveryFee.toLocaleString()}</span></div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 20 }}><span>Total</span><span>Rs. {(subtotal + deliveryFee).toLocaleString()}</span></div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
