import { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types';
import toast from 'react-hot-toast';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { userService.getProfile().then(r => setUser(r.data.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="spinner" />;
  if (!user) return <div className="empty-state">Please login</div>;

  return (
    <div className="container section">
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>My Profile</h1>
      <div className="card" style={{ padding: 32, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'var(--primary-700)' }}>
            {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.name?.[0]?.toUpperCase()}
          </div>
          <div><h2>{user.name}</h2><p style={{ color: 'var(--gray-500)' }}>{user.email}</p></div>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div><strong>Phone:</strong> {user.phone || 'Not set'}</div>
          <div><strong>Role:</strong> <span className="badge badge-info">{user.role}</span></div>
          <div><strong>Addresses:</strong> {user.addresses?.length || 0}</div>
          <div><strong>Wishlist:</strong> {user.wishlist?.length || 0} items</div>
        </div>
      </div>
    </div>
  );
}
