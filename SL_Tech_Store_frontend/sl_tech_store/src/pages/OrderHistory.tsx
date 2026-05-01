import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { Order } from '../types';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { orderService.getUserOrders().then(r => setOrders(r.data.data?.content || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="spinner" />;

  const statusColor: Record<string, string> = { PENDING: 'badge-warning', CONFIRMED: 'badge-info', PROCESSING: 'badge-info', SHIPPED: 'badge-info', DELIVERED: 'badge-success', CANCELLED: 'badge-danger' };

  return (
    <div className="container section">
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>My Orders</h1>
      {orders.length === 0 ? <div className="empty-state"><h3>No orders yet</h3><Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Start Shopping</Link></div> :
        orders.map(o => (
          <Link to={`/orders/${o.id}`} key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Order #{o.id?.slice(-8)}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${statusColor[o.status] || 'badge-info'}`}>{o.status}</span>
              <div style={{ fontWeight: 800, marginTop: 4 }}>Rs. {o.totalAmount?.toLocaleString()}</div>
            </div>
          </Link>
        ))
      }
    </div>
  );
}
