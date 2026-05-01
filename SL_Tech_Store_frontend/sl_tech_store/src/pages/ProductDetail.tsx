import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { productService } from '../services/productService';
import { getImageUrl } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import type { Product, Review } from '../types';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      productService.getProduct(id),
      api.get(`/reviews/product/${id}?page=0&size=20`)
    ]).then(([pRes, rRes]) => {
      setProduct(pRes.data.data);
      setReviews(rRes.data.data?.content || []);
    }).catch(() => toast.error('Failed to load product')).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (!product) return;
    await addToCart(product.id, qty);
    toast.success('Added to cart!');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated || !product) return;
    try { await userService.addToWishlist(product.id); toast.success('Added to wishlist'); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="spinner" />;
  if (!product) return <div className="empty-state">Product not found</div>;

  const price = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
  const imgs = product.images || [];

  return (
    <div className="container section">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--gray-50)', borderRadius: 16, padding: 20, marginBottom: 12 }}>
            {imgs.length > 0 ? <img src={getImageUrl(imgs[selectedImg]?.url)} alt={product.name} style={{ width: '100%', borderRadius: 12 }} />
              : <div style={{ fontSize: 120, textAlign: 'center', padding: 40 }}>💻</div>}
          </div>
          {imgs.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {imgs.map((img, i) => (
                <div key={i} onClick={() => setSelectedImg(i)} style={{ width: 70, height: 70, borderRadius: 8, overflow: 'hidden', border: i === selectedImg ? '2px solid var(--primary-500)' : '2px solid var(--gray-200)', cursor: 'pointer' }}>
                  <img src={getImageUrl(img.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <span className="pc-brand" style={{ fontSize: 14 }}>{product.brand}</span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '8px 0' }}>{product.name}</h1>
          <div className="pc-rating" style={{ fontSize: 16, marginBottom: 16 }}><FiStar /> {product.rating?.toFixed(1)} ({product.reviewCount} reviews)</div>
          <div style={{ marginBottom: 24 }}>
            {product.discount > 0 && <span className="pc-original" style={{ fontSize: 18 }}>Rs. {product.price.toLocaleString()}</span>}
            <div className="pc-current" style={{ fontSize: 32 }}>Rs. {price.toLocaleString()}</div>
            {product.discount > 0 && <span className="badge badge-danger">-{product.discount}% OFF</span>}
          </div>
          <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 24 }}>{product.description}</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--gray-200)', borderRadius: 8 }}>
              <button className="btn btn-sm" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <span style={{ padding: '0 16px', fontWeight: 700 }}>{qty}</span>
              <button className="btn btn-sm" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <span style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600, fontSize: 14 }}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0}><FiShoppingCart /> Add to Cart</button>
            <button className="btn btn-secondary btn-lg" onClick={handleWishlist}><FiHeart /></button>
          </div>
          {product.specs && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ marginBottom: 12 }}>Specifications</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries(product.specs).filter(([,v]) => v).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'capitalize', width: '35%' }}>{k}</td>
                      <td style={{ padding: '10px 0' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 48 }}>
        <h2 className="section-title">Customer Reviews</h2>
        {reviews.length === 0 ? <p className="empty-state">No reviews yet.</p> : reviews.map(r => (
          <div key={r.id} className="card" style={{ padding: 20, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>{r.userName}</strong>
              <div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
            </div>
            <p style={{ color: 'var(--gray-600)' }}>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
