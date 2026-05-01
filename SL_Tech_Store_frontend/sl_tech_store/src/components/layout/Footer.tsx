import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>💻 SL Tech Store</h3>
          <p>Your trusted destination for premium laptops in Sri Lanka.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/products">All Laptops</Link>
          <Link to="/products?category=Gaming">Gaming</Link>
          <Link to="/products?category=Business">Business</Link>
          <Link to="/products?category=Ultrabook">Ultrabook</Link>
        </div>
        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/profile">My Profile</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p><FiPhone /> +94 77 123 4567</p>
          <p><FiMail /> support@sltechstore.lk</p>
          <p><FiMapPin /> Colombo, Sri Lanka</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 SL Tech Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
