import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiShoppingBag, FiUsers, FiMessageSquare, FiTrendingUp, FiCheckCircle, FiShield, FiUser } from 'react-icons/fi';
import { userService } from '../../services/userService';
import type { User } from '../../types';
import toast from 'react-hot-toast';
import './Admin.css';

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => { setLoading(true); userService.getAllUsers().then(r => setUsers(r.data.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try { await userService.updateRole(userId, newRole); toast.success('Role updated'); load(); } catch { toast.error('Failed'); }
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
                      <td>
                        <button className={`btn btn-sm ${u.role === 'ADMIN' ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggleRole(u.id, u.role)}>
                          {u.role === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
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
    </div>
  );
}
