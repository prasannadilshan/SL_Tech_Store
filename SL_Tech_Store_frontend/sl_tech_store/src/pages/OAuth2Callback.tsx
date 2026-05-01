import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const role = searchParams.get('role') as 'USER' | 'ADMIN';
    if (token) {
      login({ token, refreshToken: '', id: '', name: name || '', email: '', role: role || 'USER' });
      navigate('/');
    } else {
      navigate('/login');
    }
  }, []);

  return <div className="spinner" />;
}
