import { useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';

export default function UpdatePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const { data } = await client.put('/auth/password', form);
      setMessage({ type: 'success', text: data.message });
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not update password.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="page" style={{ maxWidth: 480 }}>
        <div className="page-header">
          <div>
            <h1>Change password</h1>
            <p className="page-subtitle">Update the password you use to log in.</p>
          </div>
        </div>

        <div className="panel">
          {message && (
            <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={(e) => updateField('currentPassword', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={(e) => updateField('newPassword', e.target.value)}
                required
              />
              <div className="field-hint">8-16 characters, at least one uppercase letter and one special character.</div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
