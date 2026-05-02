import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiShoppingBag, FiUsers, FiMessageSquare, FiTrendingUp, FiCheckCircle, FiShield, FiUser } from 'react-icons/fi';
import { userService } from '../../services/userService';
import { orderService } from '../../services/orderService';
import type { User, Order } from '../../types';
import toast from 'react-hot-toast';
import './Admin.css';

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedUserOrders, setSelectedUserOrders] = useState<{ user: User, orders: Order[] } | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const load = () => { setLoading(true); userService.getAllUsers().then(r => setUsers(r.data.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try { await userService.updateRole(userId, newRole); toast.success('Role updated'); load(); } catch { toast.error('Failed'); }
  };

  const viewOrders = async (user: User) => {
    setOrdersLoading(true);
    setSelectedUserOrders({ user, orders: [] });
    try {
      const res = await orderService.getUserOrdersForAdmin(user.id, 0, 100);
      setSelectedUserOrders({ user, orders: res.data.data?.content || [] });
    } catch {
      toast.error('Failed to load orders');
      setSelectedUserOrders(null);
    } finally {
      setOrdersLoading(false);
    }
  };

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header"><span className="logo-icon">💻</span><h3>Admin Panel</h3></div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link"><FiTrendingUp /> Dashboard</Link>
          <Link to="/admin/products" className="sidebar-link"><FiBox /> Products</Link>
          <Link to="/admin/orders" className="sidebar-link"><FiShoppingBag /> Orders</Link>
          <Link to="/admin/users" className="sidebar-link active"><FiUsers /> Users</Link>
          <Link to="/admin/chat" className="sidebar-link"><FiMessageSquare /> Chat</Link>
          <Link to="/" className="sidebar-link" style={{ marginTop: 'auto' }}><FiCheckCircle /> Back to Store</Link>
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <h1>Manage Users</h1>
          <p>{users.length} registered users</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <input className="input" style={{ maxWidth: 400 }} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <div className="spinner" /> : (
          <div className="admin-section">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: u.role === 'ADMIN' ? 'var(--primary-100)' : 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: u.role === 'ADMIN' ? 'var(--primary-700)' : 'var(--gray-600)' }}>
                            {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td className="text-muted">{u.phone || '-'}</td>
                      <td>
                        <span className="status-badge" style={{ background: u.role === 'ADMIN' ? '#ef4444' : '#3b82f6' }}>
                          {u.role === 'ADMIN' ? <><FiShield style={{ marginRight: 4 }} /> ADMIN</> : <><FiUser style={{ marginRight: 4 }} /> USER</>}
                        </span>
                      </td>
                      <td className="text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => viewOrders(u)}>View Orders</button>
                        <button className={`btn btn-sm ${u.role === 'ADMIN' ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggleRole(u.id, u.role)}>
                          {u.role === 'ADMIN' ? 'Revoke' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedUserOrders && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: 32, width: '100%', maxWidth: 600, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>Orders for {selectedUserOrders.user.name}</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setSelectedUserOrders(null)}>Close</button>
            </div>
            {ordersLoading ? <div className="spinner" /> : (
              selectedUserOrders.orders.length === 0 ? <p className="empty-state">No orders found.</p> : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {selectedUserOrders.orders.map(o => (
                    <div key={o.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 8, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <strong>Order #{o.id?.slice(-8)}</strong>
                        <span className={`badge ${o.status === 'DELIVERED' ? 'badge-success' : 'badge-info'}`}>{o.status}</span>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--gray-600)' }}>
                        {new Date(o.createdAt).toLocaleDateString()} • Rs. {o.totalAmount.toLocaleString()} • {o.items.length} items
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
