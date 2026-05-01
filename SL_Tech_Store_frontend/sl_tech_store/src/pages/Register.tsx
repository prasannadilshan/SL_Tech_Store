import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.register(form);
      login(res.data.data);
      toast.success('Account created!');
      navigate('/');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Registration failed'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 40, animation: 'fadeIn 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-700)' }}>Create Account</h1>
          <p style={{ color: 'var(--gray-500)' }}>Join SL Tech Store</p>
        </div>
        <form onSubmit={handleSubmit}>
          {['name', 'email', 'password', 'phone'].map(field => (
            <div key={field} style={{ marginBottom: 16 }}>
              <input className="input" type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={(form as any)[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })} required={field !== 'phone'} />
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--gray-500)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
