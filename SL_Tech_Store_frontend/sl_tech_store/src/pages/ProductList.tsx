import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiStar, FiFilter, FiSearch } from 'react-icons/fi';
import { productService } from '../services/productService';
import { getImageUrl } from '../services/api';
import type { Product } from '../types';

const CATEGORIES = ['Gaming', 'Business', 'Ultrabook', 'Student', 'Professional'];
const BRANDS = ['Dell', 'HP', 'Lenovo', 'ASUS', 'Apple', 'MSI', 'Acer'];

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Local filter states
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'desc');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, size: 12 };
    
    // Read from URL to maintain state across reloads/sharing
    const urlSearch = searchParams.get('search');
    const urlBrand = searchParams.get('brand');
    const urlCategory = searchParams.get('category');
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    const urlSortBy = searchParams.get('sortBy');
    const urlSortDir = searchParams.get('sortDir');

    if (urlSearch) params.search = urlSearch;
    if (urlBrand) params.brand = urlBrand;
    if (urlCategory) params.category = urlCategory;
    if (urlMinPrice) params.minPrice = urlMinPrice;
    if (urlMaxPrice) params.maxPrice = urlMaxPrice;
    if (urlSortBy) params.sortBy = urlSortBy;
    if (urlSortDir) params.sortDir = urlSortDir;

    productService.getProducts(params)
      .then(res => { 
        setProducts(res.data.data?.content || []); 
        setTotalPages(res.data.data?.totalPages || 0); 
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortDir) params.set('sortDir', sortDir);
    
    setPage(0); // Reset to first page
    setSearchParams(params);
    setShowFilters(false); // Close mobile filters if open
  };

  const clearFilters = () => {
    setCategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSortBy('createdAt');
    setSortDir('desc');
    setPage(0);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FiSearch /> Browse Laptops
            </h1>
            <button 
              className="btn btn-outline d-md-none" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          
          {/* Sidebar Filters */}
          <div className={`filter-sidebar card ${showFilters ? 'show' : ''}`} style={{ padding: 24, width: 300, flexShrink: 0, position: 'sticky', top: 100 }}>
            <h3 style={{ marginTop: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiFilter /> Filters
            </h3>

            <div className="form-group">
              <label>Search</label>
              <input className="input" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Brand</label>
              <select className="input" value={brand} onChange={e => setBrand(e.target.value)}>
                <option value="">All Brands</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Price Range (Rs.)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input type="number" className="input" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <span>-</span>
                <input type="number" className="input" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Sort By</label>
              <select className="input" value={`${sortBy}-${sortDir}`} onChange={e => {
                const [by, dir] = e.target.value.split('-');
                setSortBy(by);
                setSortDir(dir);
              }}>
                <option value="createdAt-desc">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Top Rated</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={applyFilters}>Apply</button>
              <button className="btn btn-outline" onClick={clearFilters}>Clear</button>
            </div>
          </div>

          {/* Product Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? <div className="spinner" style={{ minHeight: 400 }} /> : (
              <>
                <div style={{ marginBottom: 20, color: 'var(--gray-600)', fontSize: 14 }}>
                  Showing {products.length} products
                </div>
                
                <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {products.map(p => {
                    const img = p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url || '';
                    return (
                      <Link to={`/products/${p.id}`} key={p.id} className="card product-card fade-in">
                        <div className="pc-image">{img ? <img src={getImageUrl(img)} alt={p.name} /> : <div className="pc-placeholder">💻</div>}</div>
                        <div className="pc-body">
                          <span className="pc-brand">{p.brand}</span>
                          <h3 className="pc-name" style={{ fontSize: 16 }}>{p.name}</h3>
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
                
                {products.length === 0 && (
                  <div className="empty-state" style={{ minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ margin: 0, marginBottom: 8 }}>No products found</h3>
                    <p style={{ margin: 0, color: 'var(--gray-500)' }}>Try adjusting your filters to find what you're looking for.</p>
                    <button className="btn btn-outline" style={{ marginTop: 16, width: 'fit-content', marginInline: 'auto' }} onClick={clearFilters}>Clear Filters</button>
                  </div>
                )}
                
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40, marginBottom: 20 }}>
                    <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</button>
                    {Array.from({ length: totalPages }, (_, i) => {
                      if (i === 0 || i === totalPages - 1 || Math.abs(page - i) <= 1) {
                        return <button key={i} className={`btn ${i === page ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setPage(i)}>{i + 1}</button>;
                      } else if (i === 1 && page > 2) {
                        return <span key={i} style={{ color: 'var(--gray-500)' }}>...</span>;
                      } else if (i === totalPages - 2 && page < totalPages - 3) {
                        return <span key={i} style={{ color: 'var(--gray-500)' }}>...</span>;
                      }
                      return null;
                    })}
                    <button className="btn btn-outline btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>Next</button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
      
      {/* Add a tiny bit of CSS for the mobile sidebar behavior right in the style tag for now, or just rely on inline styles. */}
      <style>{`
        @media (max-width: 768px) {
          .d-md-none { display: inline-flex !important; }
          .filter-sidebar {
            display: none;
          }
          .filter-sidebar.show {
            display: block;
            position: fixed !important;
            top: 0 !important;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            width: 100% !important;
            height: 100vh;
            border-radius: 0;
            overflow-y: auto;
          }
        }
        @media (min-width: 769px) {
          .d-md-none { display: none !important; }
        }
      `}</style>
    </div>
  );
}
