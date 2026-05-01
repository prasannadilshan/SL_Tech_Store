import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiStar, FiFilter } from 'react-icons/fi';
import { productService } from '../services/productService';
import { getImageUrl } from '../services/api';
import type { Product } from '../types';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, size: 12 };
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    if (search) params.search = search;
    if (brand) params.brand = brand;
    if (category) params.category = category;
    productService.getProducts(params)
      .then(res => { setProducts(res.data.data?.content || []); setTotalPages(res.data.data?.totalPages || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, searchParams]);

  return (
    <div>
      <div className="page-header"><div className="container"><h1><FiFilter /> Laptops</h1></div></div>
      <div className="container section">
        {loading ? <div className="spinner" /> : (
          <>
            <div className="product-grid">
              {products.map(p => {
                const img = p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url || '';
                return (
                  <Link to={`/products/${p.id}`} key={p.id} className="card product-card fade-in">
                    <div className="pc-image">{img ? <img src={getImageUrl(img)} alt={p.name} /> : <div className="pc-placeholder">💻</div>}</div>
                    <div className="pc-body">
                      <span className="pc-brand">{p.brand}</span>
                      <h3 className="pc-name">{p.name}</h3>
                      <div className="pc-rating"><FiStar /> {p.rating?.toFixed(1) || '0.0'}</div>
                      <div className="pc-price">
                        {p.discount > 0 && <span className="pc-original">Rs. {p.price.toLocaleString()}</span>}
                        <span className="pc-current">Rs. {(p.discount > 0 ? p.price*(1-p.discount/100) : p.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {products.length === 0 && <p className="empty-state">No products found.</p>}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={`btn ${i === page ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setPage(i)}>{i + 1}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
