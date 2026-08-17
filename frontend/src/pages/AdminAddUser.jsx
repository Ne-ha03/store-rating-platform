import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';

export default function AdminAddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await client.post('/admin/users', form);
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the user.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="page" style={{ maxWidth: 620 }}>
        <div className="page-header">
          <div>
            <h1>Add a user</h1>
            <p className="page-subtitle">Create an admin, normal user, or store owner account.</p>
          </div>
        </div>

        <div className="panel">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field field-full">
                <label htmlFor="name">Full name</label>
                <input id="name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                <div className="field-hint">Between 20 and 60 characters.</div>
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="role">Role</label>
                <select id="role" value={form.role} onChange={(e) => updateField('role', e.target.value)}>
                  <option value="user">Normal user</option>
                  <option value="owner">Store owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="field field-full">
                <label htmlFor="address">Address</label>
                <textarea id="address" rows={2} value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
              </div>
              <div className="field field-full">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
                <div className="field-hint">8-16 characters, at least one uppercase letter and one special character.</div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create user'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
