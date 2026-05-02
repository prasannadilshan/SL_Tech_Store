import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { Order } from '../types';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [reviewModal, setReviewModal] = useState<{ productId: string, productName: string } | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => { if (id) orderService.getOrder(id).then(r => setOrder(r.data.data)).catch(() => {}).finally(() => setLoading(false)); }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal) return;
    try {
      await api.post('/reviews', { productId: reviewModal.productId, ...reviewForm });
      toast.success('Review submitted successfully!');
      setReviewModal(null);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="spinner" />;
  if (!order) return <div className="empty-state">Order not found</div>;

  return (
    <div className="container section">
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Order #{order.id?.slice(-8)}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>Items</h3>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <div>
                  <strong>{item.productName}</strong>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</div>
                  {order.status === 'DELIVERED' && (
                    <button className="btn btn-sm btn-outline" style={{ marginTop: 8, fontSize: 12, padding: '4px 8px' }} onClick={() => setReviewModal({ productId: item.productId, productName: item.productName })}>Write Review</button>
                  )}
                </div>
                <span style={{ fontWeight: 700 }}>Rs. {item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
          {order.shippingAddress && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 12 }}>Shipping Address</h3>
              <p>{order.shippingAddress.fullName}<br />{order.shippingAddress.street}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            </div>
          )}
        </div>
        <div className="card" style={{ padding: 24, height: 'fit-content' }}>
          <h3 style={{ marginBottom: 16 }}>Summary</h3>
          <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Status</span><span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-info'}`}>{order.status}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Payment</span><span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>{order.paymentStatus}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery</span><span>{order.deliveryOption?.replace('_', ' ')}</span></div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>Rs. {order.subtotal?.toLocaleString()}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery Fee</span><span>Rs. {order.deliveryFee?.toLocaleString()}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, marginTop: 8 }}><span>Total</span><span>Rs. {order.totalAmount?.toLocaleString()}</span></div>
          </div>
          {order.trackingNumber && <div style={{ marginTop: 16, padding: 12, background: 'var(--primary-50)', borderRadius: 8 }}><strong>Tracking:</strong> {order.trackingNumber}</div>}
        </div>
      </div>

      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: 32, width: '100%', maxWidth: 400 }}>
            <h2 style={{ marginTop: 0 }}>Review {reviewModal.productName}</h2>
            <form onSubmit={handleSubmitReview} style={{ display: 'grid', gap: 16 }}>
              <div className="form-group">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: 8, fontSize: 32, cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} onClick={() => setReviewForm({...reviewForm, rating: star})} style={{ color: star <= reviewForm.rating ? '#eab308' : '#e2e8f0' }}>★</span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input required className="input" placeholder="Sum up your experience" value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea required className="input" rows={4} placeholder="What did you like or dislike?" value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Review</button>
                <button type="button" className="btn btn-outline" onClick={() => setReviewModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
