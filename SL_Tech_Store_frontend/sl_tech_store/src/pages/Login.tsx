import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      login(res.data.data);
      toast.success('Welcome back!');
      navigate(res.data.data.role === 'ADMIN' ? '/admin' : '/');
    } catch { toast.error('Invalid credentials'); }
    setLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await authService.googleLogin(response.access_token);
        login(res.data.data);
        toast.success('Welcome!');
        navigate('/');
      } catch (error) {
        console.error('Backend Google login failed:', error);
        toast.error('Google login failed at backend');
      }
    },
    onError: (error) => {
      console.error('Google Login Error:', error);
      toast.error('Google login popup failed or was blocked');
    },
  });

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 40, animation: 'fadeIn 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-700)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--gray-500)' }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: 14, top: 14, color: 'var(--gray-400)' }} />
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: 40 }} />
          </div>
          <div style={{ marginBottom: 24, position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: 14, top: 14, color: 'var(--gray-400)' }} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: 40 }} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--gray-400)', fontSize: 13 }}>or continue with</div>
        <button type="button" onClick={() => googleLogin()} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
          <FcGoogle size={20} /> Sign in with Google
        </button>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--gray-500)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
