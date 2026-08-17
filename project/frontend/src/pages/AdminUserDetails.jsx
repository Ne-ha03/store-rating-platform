import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';

const ROLE_LABELS = { admin: 'Admin', user: 'Normal user', owner: 'Store owner' };

export default function AdminUserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get(`/admin/users/${id}`)
      .then((res) => setUser(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load this user.'));
  }, [id]);

  return (
    <Layout>
      <div className="page" style={{ maxWidth: 560 }}>
        <div className="page-header">
          <div>
            <h1>User details</h1>
            <Link to="/admin/users" className="page-subtitle">← Back to all users</Link>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {user && (
          <div className="panel">
            <div className="field">
              <label>Name</label>
              <div>{user.name}</div>
            </div>
            <div className="field">
              <label>Email</label>
              <div>{user.email}</div>
            </div>
            <div className="field">
              <label>Address</label>
              <div>{user.address}</div>
            </div>
            <div className="field">
              <label>Role</label>
              <div><span className={`role-badge role-badge-${user.role}`}>{ROLE_LABELS[user.role]}</span></div>
            </div>
            {user.role === 'owner' && (
              <div className="field">
                <label>Store rating</label>
                <div>{Number(user.averageRating).toFixed(1)} / 5</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
