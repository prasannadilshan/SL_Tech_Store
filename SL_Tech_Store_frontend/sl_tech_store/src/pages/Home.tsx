import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi';
import { productService } from '../services/productService';
import { getImageUrl } from '../services/api';
import type { Product } from '../types';
import './Home.css';

import heroImg1 from '../assets/hero-laptop-1.png';
import heroImg2 from '../assets/hero-laptop-2.png';
import heroImg3 from '../assets/hero-laptop-3.png';
import heroImg4 from '../assets/hero-laptop-4.png';

const HERO_IMAGES = [heroImg1, heroImg2, heroImg3, heroImg4];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    Promise.all([productService.getFeatured(), productService.getLatest()])
      .then(([f, l]) => { setFeatured(f.data.data || []); setLatest(l.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home">
      {/* ═══ HERO WITH DYNAMIC BACKGROUND ═══ */}
      <section className="hero">
        {/* Background image slideshow */}
        <div className="hero-bg-slideshow">
          {HERO_IMAGES.map((img, i) => (
            <div
              key={i}
              className={`hero-bg-slide ${i === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          <div className="hero-bg-overlay" />
        </div>

        {/* Liquid glass floating orbs */}
        <div className="liquid-orb liquid-orb-1" />
        <div className="liquid-orb liquid-orb-2" />
        <div className="liquid-orb liquid-orb-3" />

        {/* Hero content with glass card */}
        <div className="hero-inner container">
          <div className="hero-content glass-card">
            <span className="hero-badge glass-pill">🔥 New Arrivals 2026</span>
            <h1>Find Your Perfect <span className="gradient-text">Laptop</span></h1>
            <p>Discover the latest laptops from top brands. Gaming, Business, Ultrabook — we have it all with the best prices in Sri Lanka.</p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg glass-btn">Browse Laptops <FiArrowRight /></Link>
              <Link to="/products?category=Gaming" className="btn btn-secondary btn-lg glass-btn-outline">Gaming Deals</Link>
            </div>
          </div>

          {/* Featured laptop preview with glass frame */}
          <div className="hero-visual">
            <div className="hero-laptop-frame glass-frame">
              <img
                src={HERO_IMAGES[currentSlide]}
                alt="Featured Laptop"
                className="hero-laptop-img"
              />
            </div>
            {/* Slide indicators */}
            <div className="slide-indicators">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  className={`slide-dot ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES WITH GLASS CARDS ═══ */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card glass-feature">
              <FiTruck className="feature-icon" />
              <h3>Fast Delivery</h3>
              <p>Express & store pickup</p>
            </div>
            <div className="feature-card glass-feature">
              <FiShield className="feature-icon" />
              <h3>Warranty</h3>
              <p>Genuine products guaranteed</p>
            </div>
            <div className="feature-card glass-feature">
              <FiStar className="feature-icon" />
              <h3>Top Brands</h3>
              <p>Dell, HP, Lenovo, ASUS & more</p>
            </div>
            <div className="feature-card glass-feature">
              <FiHeadphones className="feature-icon" />
              <h3>24/7 Support</h3>
              <p>Live chat assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
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

      {/* ═══ LATEST ARRIVALS ═══ */}
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
