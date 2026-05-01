import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiSearch, FiHeart } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${search}`);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">💻</span>
          <span className="logo-text">SL Tech Store</span>
        </Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search laptops..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </form>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}><FiUser /> Profile</Link>
              <button className="nav-logout" onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
        </div>

        <div className="nav-actions">
          {isAuthenticated && (
            <>
              <Link to="/profile" className="nav-icon-btn" title="Wishlist"><FiHeart /></Link>
              <Link to="/cart" className="nav-icon-btn cart-btn">
                <FiShoppingCart />
                {cart && cart.items.length > 0 && <span className="cart-badge">{cart.items.length}</span>}
              </Link>
            </>
          )}
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
