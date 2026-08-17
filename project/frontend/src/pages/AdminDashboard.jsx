import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get('/admin/dashboard').then((res) => setStats(res.data));
  }, []);

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Admin dashboard</h1>
            <p className="page-subtitle">A quick look at what's on the platform right now.</p>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-number">{stats ? stats.totalUsers : '—'}</div>
            <div className="stat-label">Total users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats ? stats.totalStores : '—'}</div>
            <div className="stat-label">Total stores</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats ? stats.totalRatings : '—'}</div>
            <div className="stat-label">Ratings submitted</div>
          </div>
        </div>

        <div className="panel" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/admin/users/new">Add a user</Link>
          <Link className="btn btn-secondary" to="/admin/stores/new">Add a store</Link>
          <Link className="btn btn-secondary" to="/admin/users">View all users</Link>
          <Link className="btn btn-secondary" to="/admin/stores">View all stores</Link>
        </div>
      </div>
    </Layout>
  );
}
