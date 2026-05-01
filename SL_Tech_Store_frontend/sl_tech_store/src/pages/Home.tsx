import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi';
import { productService } from '../services/productService';
import { getImageUrl } from '../services/api';
import type { Product } from '../types';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productService.getFeatured(), productService.getLatest()])
      .then(([f, l]) => { setFeatured(f.data.data || []); setLatest(l.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">🔥 New Arrivals 2026</span>
          <h1>Find Your Perfect <span className="gradient-text">Laptop</span></h1>
          <p>Discover the latest laptops from top brands. Gaming, Business, Ultrabook — we have it all with the best prices in Sri Lanka.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">Browse Laptops <FiArrowRight /></Link>
            <Link to="/products?category=Gaming" className="btn btn-secondary btn-lg">Gaming Deals</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-glow" />
          <div className="hero-laptop-icon">💻</div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card"><FiTruck className="feature-icon" /><h3>Fast Delivery</h3><p>Express & store pickup</p></div>
            <div className="feature-card"><FiShield className="feature-icon" /><h3>Warranty</h3><p>Genuine products guaranteed</p></div>
            <div className="feature-card"><FiStar className="feature-icon" /><h3>Top Brands</h3><p>Dell, HP, Lenovo, ASUS & more</p></div>
            <div className="feature-card"><FiHeadphones className="feature-icon" /><h3>24/7 Support</h3><p>Live chat assistance</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">⭐ Featured Laptops</h2>
          {loading ? <div className="spinner" /> : (
            <div className="product-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          {!loading && featured.length === 0 && <p className="empty-state">No featured products yet.</p>}
        </div>
      </section>

      <section className="section" style={{ background: 'var(--gray-100)' }}>
        <div className="container">
          <h2 className="section-title">🆕 Latest Arrivals</h2>
          {loading ? <div className="spinner" /> : (
            <div className="product-grid">
              {latest.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          {!loading && latest.length === 0 && <p className="empty-state">No products yet.</p>}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const img = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url || '';
  return (
    <Link to={`/products/${product.id}`} className="card product-card fade-in">
      <div className="pc-image">{img ? <img src={getImageUrl(img)} alt={product.name} /> : <div className="pc-placeholder">💻</div>}</div>
      <div className="pc-body">
        <span className="pc-brand">{product.brand}</span>
        <h3 className="pc-name">{product.name}</h3>
        <div className="pc-rating"><FiStar /> {product.rating?.toFixed(1) || '0.0'} <span>({product.reviewCount || 0})</span></div>
        <div className="pc-price">
          {product.discount > 0 && <span className="pc-original">Rs. {product.price.toLocaleString()}</span>}
          <span className="pc-current">Rs. {(product.discount > 0 ? product.price - product.price * product.discount / 100 : product.price).toLocaleString()}</span>
          {product.discount > 0 && <span className="badge badge-danger">-{product.discount}%</span>}
        </div>
      </div>
    </Link>
  );
}
