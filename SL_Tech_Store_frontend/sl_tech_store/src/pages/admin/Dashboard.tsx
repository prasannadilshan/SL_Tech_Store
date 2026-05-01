import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiUsers, FiBox, FiMessageSquare, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';
import './Admin.css';

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      orderService.getAllOrders(0, 5)
    ]).then(([s, o]) => {
      setStats(s.data.data || {});
      setRecentOrders(o.data.data?.content || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const cards = [
    { label: 'Total Products', value: stats.totalProducts || 0, icon: <FiBox />, color: '#3b82f6', bg: '#eff6ff', link: '/admin/products' },
    { label: 'Total Orders', value: stats.totalOrders || 0, icon: <FiShoppingBag />, color: '#10b981', bg: '#d1fae5', link: '/admin/orders' },
    { label: 'Pending Orders', value: stats.pendingOrders || 0, icon: <FiClock />, color: '#f59e0b', bg: '#fef3c7', link: '/admin/orders' },
    { label: 'Total Users', value: stats.totalUsers || 0, icon: <FiUsers />, color: '#8b5cf6', bg: '#ede9fe', link: '/admin/users' },
  ];

  const statusColor: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#8b5cf6', SHIPPED: '#06b6d4', DELIVERED: '#10b981', CANCELLED: '#ef4444' };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header"><span className="logo-icon">💻</span><h3>Admin Panel</h3></div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link active"><FiTrendingUp /> Dashboard</Link>
          <Link to="/admin/products" className="sidebar-link"><FiBox /> Products</Link>
          <Link to="/admin/orders" className="sidebar-link"><FiShoppingBag /> Orders</Link>
          <Link to="/admin/users" className="sidebar-link"><FiUsers /> Users</Link>
          <Link to="/admin/chat" className="sidebar-link"><FiMessageSquare /> Chat</Link>
          <Link to="/" className="sidebar-link" style={{ marginTop: 'auto' }}><FiCheckCircle /> Back to Store</Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <p>Welcome back, Admin! Here's what's happening.</p>
        </div>

        <div className="stats-grid">
          {cards.map(c => (
            <Link to={c.link} key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
              <div>
                <div className="stat-value">{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="admin-section">
          <div className="section-header">
            <h2><FiPackage /> Recent Orders</h2>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td className="font-mono">#{o.id?.slice(-8)}</td>
                    <td>{o.userName}</td>
                    <td>{o.items.length} items</td>
                    <td className="font-bold">Rs. {o.totalAmount?.toLocaleString()}</td>
                    <td><span className="status-badge" style={{ background: statusColor[o.status] || '#64748b' }}>{o.status}</span></td>
                    <td className="text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && <tr><td colSpan={6} className="text-center text-muted">No orders yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
