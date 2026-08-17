import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';

export default function AdminAddStore() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // only store-owner accounts are eligible to be picked as a store's owner
    client.get('/admin/users', { params: { role: 'owner' } }).then((res) => setOwners(res.data));
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await client.post('/admin/stores', { ...form, ownerId: form.ownerId || null });
      navigate('/admin/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the store.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="page" style={{ maxWidth: 620 }}>
        <div className="page-header">
          <div>
            <h1>Add a store</h1>
            <p className="page-subtitle">Register a new store on the platform.</p>
          </div>
        </div>

        <div className="panel">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field field-full">
                <label htmlFor="name">Store name</label>
                <input id="name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                <div className="field-hint">Between 20 and 60 characters.</div>
              </div>
              <div className="field">
                <label htmlFor="email">Store email</label>
                <input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="owner">Store owner</label>
                <select id="owner" value={form.ownerId} onChange={(e) => updateField('ownerId', e.target.value)}>
                  <option value="">No owner assigned yet</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                  ))}
                </select>
                {owners.length === 0 && (
                  <div className="field-hint">No store-owner accounts exist yet - create one first if you'd like to assign an owner.</div>
                )}
              </div>
              <div className="field field-full">
                <label htmlFor="address">Address</label>
                <textarea id="address" rows={2} value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create store'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
