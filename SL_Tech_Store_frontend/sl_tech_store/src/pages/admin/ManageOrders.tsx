import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiShoppingBag, FiUsers, FiMessageSquare, FiTrendingUp, FiTruck, FiCheckCircle, FiEye, FiX } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';
import toast from 'react-hot-toast';
import './Admin.css';

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const statusColors: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#8b5cf6', SHIPPED: '#06b6d4', DELIVERED: '#10b981', CANCELLED: '#ef4444' };

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState('');

  const load = () => { setLoading(true); orderService.getAllOrders(0, 100, filter || undefined).then(r => setOrders(r.data.data?.content || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try { await orderService.updateStatus(id, status); toast.success(`Order ${status.toLowerCase()}`); load(); } catch { toast.error('Failed'); }
  };

  const updateTracking = async (id: string) => {
    if (!tracking.trim()) return;
    try { await orderService.updateTracking(id, tracking); toast.success('Tracking updated'); setTracking(''); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header"><span className="logo-icon">💻</span><h3>Admin Panel</h3></div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link"><FiTrendingUp /> Dashboard</Link>
          <Link to="/admin/products" className="sidebar-link"><FiBox /> Products</Link>
          <Link to="/admin/orders" className="sidebar-link active"><FiShoppingBag /> Orders</Link>
          <Link to="/admin/users" className="sidebar-link"><FiUsers /> Users</Link>
          <Link to="/admin/chat" className="sidebar-link"><FiMessageSquare /> Chat</Link>
          <Link to="/" className="sidebar-link" style={{ marginTop: 'auto' }}><FiCheckCircle /> Back to Store</Link>
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <h1>Manage Orders</h1>
          <p>{orders.length} orders found</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button className={`btn ${!filter ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter('')}>All</button>
          {statuses.map(s => (
            <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : (
          <div className="admin-section">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Delivery</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="font-mono">#{o.id?.slice(-8)}</td>
                      <td><div style={{ fontWeight: 600 }}>{o.userName}</div><div className="text-muted" style={{ fontSize: 12 }}>{o.userEmail}</div></td>
                      <td>{o.items.length} items</td>
                      <td><span className="badge badge-info" style={{ fontSize: 11 }}>{o.deliveryOption?.replace('_', ' ')}</span></td>
                      <td className="font-bold">Rs. {o.totalAmount?.toLocaleString()}</td>
                      <td><span className="status-badge" style={{ background: o.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b', fontSize: 11 }}>{o.paymentStatus}</span></td>
                      <td>
                        <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '2px solid var(--gray-200)', fontWeight: 600, fontSize: 12, color: statusColors[o.status], cursor: 'pointer' }}>
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(o); setTracking(o.trackingNumber || ''); }}><FiEye /></button>
                          {o.status === 'SHIPPED' && <button className="btn btn-secondary btn-sm" title="Add tracking" onClick={() => { setSelectedOrder(o); setTracking(o.trackingNumber || ''); }}><FiTruck /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={8} className="text-center text-muted" style={{ padding: 40 }}>No orders found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>Order #{selectedOrder.id?.slice(-8)}</h2>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}><FiX /></button>
              </div>
              <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                <div><strong>Customer:</strong> {selectedOrder.userName} ({selectedOrder.userEmail})</div>
                <div><strong>Delivery:</strong> {selectedOrder.deliveryOption?.replace('_', ' ')}</div>
                <div><strong>Status:</strong> <span className="status-badge" style={{ background: statusColors[selectedOrder.status] }}>{selectedOrder.status}</span></div>
                <div><strong>Total:</strong> Rs. {selectedOrder.totalAmount?.toLocaleString()}</div>
                {selectedOrder.shippingAddress && (
                  <div><strong>Address:</strong> {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}</div>
                )}
                <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12 }}>
                  <strong>Items:</strong>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-50)' }}>
                      <span>{item.productName} x{item.quantity}</span>
                      <span className="font-bold">Rs. {item.subtotal?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12 }}>
                  <label style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}><FiTruck /> Tracking Number</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking number" />
                    <button className="btn btn-primary" onClick={() => updateTracking(selectedOrder.id)}>Save</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
