import { useEffect, useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/owner/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="page"><p className="loading-text">Loading your dashboard…</p></div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="page"><div className="alert alert-error">{error}</div></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>{data.store.name}</h1>
            <p className="page-subtitle">{data.store.address}</p>
          </div>
        </div>

        <div className="stat-row" style={{ gridTemplateColumns: '1fr' }}>
          <div className="stat-card">
            <div className="stat-number">{Number(data.averageRating).toFixed(1)} / 5</div>
            <div className="stat-label">Average rating from {data.raters.length} customer{data.raters.length === 1 ? '' : 's'}</div>
          </div>
        </div>

        <div className="panel">
          <h2 style={{ marginBottom: 14 }}>Who's rated your store</h2>
          {data.raters.length === 0 ? (
            <div className="empty-state">No ratings yet - check back once customers start rating your store.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {data.raters.map((rater) => (
                  <tr key={rater.id}>
                    <td>{rater.name}</td>
                    <td>{rater.email}</td>
                    <td>{rater.rating} / 5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
