import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit2, FiBox, FiShoppingBag, FiUsers, FiMessageSquare, FiTrendingUp, FiUpload, FiX, FiCheckCircle, FiImage } from 'react-icons/fi';
import { productService } from '../../services/productService';
import { getImageUrl } from '../../services/api';
import type { Product } from '../../types';
import toast from 'react-hot-toast';
import './Admin.css';

const BRANDS = ['ASUS', 'HP', 'Dell', 'Lenovo', 'Apple', 'MSI', 'Acer', 'Gigabyte', 'Razer'];
const CATEGORIES = ['Gaming', 'Business', 'Ultrabook', 'Budget', 'Workstation', 'Student', 'Professional'];
const PROCESSORS = ['Intel Core i9', 'Intel Core i7', 'Intel Core i5', 'Intel Core i3', 'AMD Ryzen 9', 'AMD Ryzen 7', 'AMD Ryzen 5', 'Apple M3', 'Apple M2', 'Apple M1'];
const GPUS = ['NVIDIA GeForce RTX 4090', 'NVIDIA GeForce RTX 4080', 'NVIDIA GeForce RTX 4070', 'NVIDIA GeForce RTX 4060', 'NVIDIA GeForce RTX 4050', 'NVIDIA GeForce RTX 3050', 'AMD Radeon RX 7000', 'Intel Iris Xe', 'Apple M3 GPU'];
const RAM_OPTIONS = ['4GB', '8GB', '16GB', '32GB', '64GB'];
const STORAGE_OPTIONS = ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'];
const DDR_VERSIONS = ['DDR4', 'DDR5', 'LPDDR5', 'LPDDR5X', 'LPDDR4X'];
const BATTERY_OPTIONS = ['3-cell 41Wh', '4-cell 54Wh', '6-cell 70Wh', '80Wh', '90Wh', '99Wh'];
const WARRANTY_OPTIONS = ['1 Year Local', '2 Years Local', '3 Years Local', '1 Year International', 'No Warranty'];

const emptyForm = { name: '', brand: '', model: '', description: '', price: 0, discount: 0, stock: 0, category: 'Gaming', featured: false, active: true, specs: { processor: '', ram: '', ddrVersion: '', storage: '', gpu: '', display: '', battery: '', os: '', weight: '', color: '', ports: '', wireless: '', keyboard: '', webcam: '', warranty: '' } };

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => { setLoading(true); productService.getProducts({ page, size: 10 }).then(r => { setProducts(r.data.data?.content || []); setTotalPages(r.data.data?.totalPages || 0); }).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, [page]);

  const openAdd = () => { setForm({ ...emptyForm }); setEditId(null); setImageFiles([]); setImagePreviews([]); setShowForm(true); };
  const openEdit = (p: Product) => { setForm({ name: p.name, brand: p.brand, model: p.model, description: p.description, price: p.price, discount: p.discount, stock: p.stock, category: p.category, featured: p.featured, active: p.active, specs: p.specs || emptyForm.specs }); setEditId(p.id); setImageFiles([]); setImagePreviews([]); setShowForm(true); };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePreview = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let productId = editId;
      if (editId) {
        await productService.updateProduct(editId, form);
        toast.success('Product updated!');
      } else {
        const res = await productService.createProduct(form);
        productId = res.data.data.id;
        toast.success('Product created!');
      }

      // Upload images to Google Drive
      if (imageFiles.length > 0 && productId) {
        toast.loading('Uploading images to Google Drive...', { id: 'img-upload' });
        for (let i = 0; i < imageFiles.length; i++) {
          await productService.uploadImage(productId, imageFiles[i], i === 0);
        }
        toast.success(`${imageFiles.length} image(s) uploaded!`, { id: 'img-upload' });
      }

      setShowForm(false);
      setImageFiles([]);
      setImagePreviews([]);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => { if (confirm('Delete?')) { await productService.deleteProduct(id); toast.success('Deleted'); load(); } };

  const handleImageUpload = async (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { await productService.uploadImage(productId, file, true); toast.success('Image uploaded!'); load(); } catch { toast.error('Upload failed'); }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header"><span className="logo-icon">💻</span><h3>Admin Panel</h3></div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link"><FiTrendingUp /> Dashboard</Link>
          <Link to="/admin/products" className="sidebar-link active"><FiBox /> Products</Link>
          <Link to="/admin/orders" className="sidebar-link"><FiShoppingBag /> Orders</Link>
          <Link to="/admin/users" className="sidebar-link"><FiUsers /> Users</Link>
          <Link to="/admin/chat" className="sidebar-link"><FiMessageSquare /> Chat</Link>
          <Link to="/" className="sidebar-link" style={{ marginTop: 'auto' }}><FiCheckCircle /> Back to Store</Link>
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1>Manage Products</h1><p>{products.length} products total</p></div>
          <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Product</button>
        </div>

        {loading ? <div className="spinner" /> : (
          <div className="admin-section">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Image</th><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', background: 'var(--gray-100)', position: 'relative' }}>
                          {p.images?.[0] ? <img src={getImageUrl(p.images[0].url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>💻</span>}
                        </div>
                      </td>
                      <td><div style={{ fontWeight: 700 }}>{p.name}</div><div className="text-muted" style={{ fontSize: 12 }}>{p.model}</div></td>
                      <td>{p.brand}</td>
                      <td><span className="badge badge-info">{p.category}</span></td>
                      <td className="font-bold">Rs. {p.price?.toLocaleString()}{p.discount > 0 && <span className="text-muted" style={{ fontSize: 11 }}> (-{p.discount}%)</span>}</td>
                      <td><span className={`badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>{p.stock}</span></td>
                      <td>⭐ {p.rating?.toFixed(1) || '0.0'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><FiEdit2 /></button>
                          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}><FiUpload /><input type="file" accept="image/*" hidden onChange={e => handleImageUpload(p.id, e)} /></label>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan={8} className="text-center text-muted" style={{ padding: 40 }}>No products yet. Click "Add Product" to get started.</td></tr>}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
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
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>{editId ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--gray-400)' }}><FiX /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group"><label>Product Name *</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div className="form-group"><label>Brand *</label>
                    <input className="input" list="brand-list" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} required />
                    <datalist id="brand-list">{BRANDS.map(b => <option key={b} value={b} />)}</datalist>
                  </div>
                </div>
                <div className="form-row-3">
                  <div className="form-group"><label>Model</label><input className="input" value={form.model} onChange={e => setForm({...form, model: e.target.value})} /></div>
                  <div className="form-group"><label>Category *</label>
                    <input className="input" list="category-list" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
                    <datalist id="category-list">{CATEGORIES.map(c => <option key={c} value={c} />)}</datalist>
                  </div>
                  <div className="form-group"><label>Price (Rs.) *</label><input className="input" type="number" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} required /></div>
                </div>
                <div className="form-row-3">
                  <div className="form-group"><label>Discount %</label><input className="input" type="number" value={form.discount} onChange={e => setForm({...form, discount: +e.target.value})} /></div>
                  <div className="form-group"><label>Stock *</label><input className="input" type="number" value={form.stock} onChange={e => setForm({...form, stock: +e.target.value})} required /></div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'end', gap: 16, paddingBottom: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} /> Featured</label>
                  </div>
                </div>
                <div className="form-group"><label>Description</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>

                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '20px 0 12px', color: 'var(--primary-700)' }}><FiImage style={{ marginRight: 6 }} /> Product Images</h3>
                <div style={{ border: '2px dashed var(--gray-300)', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: 'var(--gray-50)', transition: 'all 0.2s', marginBottom: 16 }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary-400)'; e.currentTarget.style.background = 'var(--primary-50)'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'var(--gray-50)'; }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'var(--gray-50)'; const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')); setImageFiles(prev => [...prev, ...files]); files.forEach(file => { const reader = new FileReader(); reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string]); reader.readAsDataURL(file); }); }}>
                  <FiUpload size={32} style={{ color: 'var(--primary-400)', marginBottom: 8 }} />
                  <p style={{ fontWeight: 600, color: 'var(--gray-600)' }}>Click to upload or drag & drop</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>PNG, JPG, WEBP up to 10MB. Images stored on Google Drive.</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileSelect} />
                </div>

                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', width: 90, height: 90, borderRadius: 10, overflow: 'hidden', border: i === 0 ? '3px solid var(--primary-500)' : '2px solid var(--gray-200)' }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removePreview(i)} style={{ position: 'absolute', top: 2, right: 2, width: 22, height: 22, borderRadius: '50%', background: 'var(--danger)', color: 'white', border: 'none', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX /></button>
                        {i === 0 && <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--primary-600)', color: 'white', fontSize: 9, textAlign: 'center', padding: '2px 0', fontWeight: 700 }}>PRIMARY</span>}
                      </div>
                    ))}
                  </div>
                )}

                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '20px 0 12px', color: 'var(--primary-700)' }}>Specifications</h3>
                <div className="form-row">
                  <div className="form-group"><label>Processor</label><input className="input" list="cpu-list" value={form.specs.processor} onChange={e => setForm({...form, specs: {...form.specs, processor: e.target.value}})} /><datalist id="cpu-list">{PROCESSORS.map(x => <option key={x} value={x} />)}</datalist></div>
                  <div className="form-group"><label>GPU</label><input className="input" list="gpu-list" value={form.specs.gpu} onChange={e => setForm({...form, specs: {...form.specs, gpu: e.target.value}})} /><datalist id="gpu-list">{GPUS.map(x => <option key={x} value={x} />)}</datalist></div>
                </div>
                <div className="form-row-3">
                  <div className="form-group"><label>RAM</label><input className="input" list="ram-list" value={form.specs.ram} onChange={e => setForm({...form, specs: {...form.specs, ram: e.target.value}})} /><datalist id="ram-list">{RAM_OPTIONS.map(x => <option key={x} value={x} />)}</datalist></div>
                  <div className="form-group"><label>DDR Version</label><input className="input" list="ddr-list" value={form.specs.ddrVersion} onChange={e => setForm({...form, specs: {...form.specs, ddrVersion: e.target.value}})} /><datalist id="ddr-list">{DDR_VERSIONS.map(x => <option key={x} value={x} />)}</datalist></div>
                  <div className="form-group"><label>Storage</label><input className="input" list="storage-list" value={form.specs.storage} onChange={e => setForm({...form, specs: {...form.specs, storage: e.target.value}})} /><datalist id="storage-list">{STORAGE_OPTIONS.map(x => <option key={x} value={x} />)}</datalist></div>
                </div>
                <div className="form-row-3">
                  <div className="form-group"><label>Display</label><input className="input" value={form.specs.display} onChange={e => setForm({...form, specs: {...form.specs, display: e.target.value}})} /></div>
                  <div className="form-group"><label>Battery</label><input className="input" list="battery-list" value={form.specs.battery} onChange={e => setForm({...form, specs: {...form.specs, battery: e.target.value}})} /><datalist id="battery-list">{BATTERY_OPTIONS.map(x => <option key={x} value={x} />)}</datalist></div>
                  <div className="form-group"><label>Warranty</label><input className="input" list="warranty-list" value={form.specs.warranty} onChange={e => setForm({...form, specs: {...form.specs, warranty: e.target.value}})} /><datalist id="warranty-list">{WARRANTY_OPTIONS.map(x => <option key={x} value={x} />)}</datalist></div>
                </div>
                <div className="form-row-3">
                  {['os','weight','color'].map(k => (
                    <div className="form-group" key={k}><label style={{ textTransform: 'capitalize' }}>{k}</label><input className="input" value={form.specs?.[k] || ''} onChange={e => setForm({...form, specs: {...form.specs, [k]: e.target.value}})} /></div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
