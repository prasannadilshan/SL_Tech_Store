import { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import type { User, Address, SavedPaymentMethod } from '../types';
import toast from 'react-hot-toast';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'addresses' | 'payments'>('details');

  // Details state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Address state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: '', isDefault: false
  });

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    type: 'COD', details: '', isDefault: false
  });

  const loadProfile = () => {
    setLoading(true);
    userService.getProfile()
      .then(r => {
        setUser(r.data.data);
        setEditName(r.data.data.name);
        setEditPhone(r.data.data.phone || '');
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProfile(); }, []);

  const handleUpdateDetails = async () => {
    try {
      await userService.updateProfile(editName, editPhone);
      toast.success('Profile updated');
      setIsEditingDetails(false);
      loadProfile();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await userService.updateAddress(editingAddress.id, addressForm);
        toast.success('Address updated');
      } else {
        await userService.addAddress(addressForm);
        toast.success('Address added');
      }
      setShowAddressModal(false);
      loadProfile();
    } catch {
      toast.error('Failed to save address');
    }
  };

  const handleRemoveAddress = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await userService.removeAddress(id);
      toast.success('Address removed');
      loadProfile();
    } catch {
      toast.error('Failed to remove address');
    }
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.addPaymentMethod(paymentForm);
      toast.success('Payment method added');
      setShowPaymentModal(false);
      loadProfile();
    } catch {
      toast.error('Failed to add payment method');
    }
  };

  const handleRemovePaymentMethod = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await userService.removePaymentMethod(id);
      toast.success('Payment method removed');
      loadProfile();
    } catch {
      toast.error('Failed to remove payment method');
    }
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({ ...addr });
    setShowAddressModal(true);
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: '', isDefault: false });
    setShowAddressModal(true);
  };

  if (loading) return <div className="spinner" />;
  if (!user) return <div className="empty-state">Please login</div>;

  return (
    <div className="container section">
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>My Profile</h1>
      
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div className="card" style={{ padding: 24, minWidth: 250, height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'var(--primary-700)', marginBottom: 12 }}>
              {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.name?.[0]?.toUpperCase()}
            </div>
            <h3 style={{ margin: 0 }}>{user.name}</h3>
            <p style={{ color: 'var(--gray-500)', margin: 0, fontSize: 14 }}>{user.email}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button 
              className={`btn ${activeTab === 'details' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('details')}
              style={{ justifyContent: 'flex-start' }}
            >
              Profile Details
            </button>
            <button 
              className={`btn ${activeTab === 'addresses' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('addresses')}
              style={{ justifyContent: 'flex-start' }}
            >
              Addresses ({user.addresses?.length || 0})
            </button>
            <button 
              className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('payments')}
              style={{ justifyContent: 'flex-start' }}
            >
              Payment Methods ({(user.paymentMethods || []).length})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="card" style={{ padding: 32, flex: 1 }}>
          {activeTab === 'details' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>Profile Details</h2>
                {!isEditingDetails && (
                  <button className="btn btn-outline" onClick={() => setIsEditingDetails(true)}>Edit</button>
                )}
              </div>
              
              {isEditingDetails ? (
                <div style={{ display: 'grid', gap: 16, maxWidth: 400 }}>
                  <div className="form-group">
                    <label>Name</label>
                    <input className="input" value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input className="input" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" onClick={handleUpdateDetails}>Save Changes</button>
                    <button className="btn btn-outline" onClick={() => {
                      setIsEditingDetails(false);
                      setEditName(user.name);
                      setEditPhone(user.phone || '');
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>Full Name</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{user.name}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>Email Address</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{user.email}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>Phone Number</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{user.phone || 'Not provided'}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>My Addresses</h2>
                <button className="btn btn-primary" onClick={openAddAddress}>+ Add New Address</button>
              </div>

              {(!user.addresses || user.addresses.length === 0) ? (
                <div className="empty-state" style={{ padding: 40 }}>No addresses saved yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {user.addresses.map((addr: Address) => (
                    <div key={addr.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {addr.fullName}
                          {addr.isDefault && <span className="badge badge-primary">Default</span>}
                        </div>
                        <div style={{ color: 'var(--gray-600)', fontSize: 14, marginTop: 4 }}>
                          {addr.street}, {addr.city}, {addr.state} {addr.postalCode}<br />
                          {addr.country}<br />
                          Phone: {addr.phone}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 14 }} onClick={() => openEditAddress(addr)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 14 }} onClick={() => handleRemoveAddress(addr.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>Payment Methods</h2>
                <button className="btn btn-primary" onClick={() => {
                  setPaymentForm({ type: 'COD', details: '', isDefault: false });
                  setShowPaymentModal(true);
                }}>+ Add Payment Method</button>
              </div>

              {(!user.paymentMethods || user.paymentMethods.length === 0) ? (
                <div className="empty-state" style={{ padding: 40 }}>No payment methods saved.</div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {user.paymentMethods.map((method: SavedPaymentMethod) => (
                    <div key={method.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {method.type}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {method.type === 'COD' ? 'Cash on Delivery' : 'Credit/Debit Card (Stripe)'}
                            {method.isDefault && <span className="badge badge-primary">Default</span>}
                          </div>
                          <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>{method.details || 'Standard Payment'}</div>
                        </div>
                      </div>
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 14 }} onClick={() => handleRemovePaymentMethod(method.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSaveAddress} style={{ display: 'grid', gap: 16 }}>
              <div className="form-group">
                <label>Full Name</label>
                <input required className="input" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input required className="input" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input required className="input" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>City</label>
                  <input required className="input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>State/Province</label>
                  <input required className="input" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input required className="input" value={addressForm.postalCode} onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input required className="input" value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} />
                Set as default address
              </label>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Address</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddressModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: 32, width: '100%', maxWidth: 400 }}>
            <h2 style={{ marginTop: 0 }}>Add Payment Method</h2>
            <form onSubmit={handleSavePaymentMethod} style={{ display: 'grid', gap: 16 }}>
              <div className="form-group">
                <label>Method Type</label>
                <select className="input" value={paymentForm.type} onChange={e => setPaymentForm({...paymentForm, type: e.target.value})}>
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="STRIPE">Stripe (Card Preference)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Details (Optional)</label>
                <input className="input" placeholder={paymentForm.type === 'COD' ? "e.g. Leave with security" : "e.g. Use for electronics"} value={paymentForm.details} onChange={e => setPaymentForm({...paymentForm, details: e.target.value})} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={paymentForm.isDefault} onChange={e => setPaymentForm({...paymentForm, isDefault: e.target.checked})} />
                Set as preferred method
              </label>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Method</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
