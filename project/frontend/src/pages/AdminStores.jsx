import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [loading, setLoading] = useState(true);

  async function loadStores() {
    setLoading(true);
    try {
      const { data } = await client.get('/admin/stores', { params: { ...filters, ...sort } });
      setStores(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadStores, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort]);

  function toggleSort(column) {
    setSort((prev) => ({
      sortBy: column,
      order: prev.sortBy === column && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  }

  function updateFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Stores</h1>
            <p className="page-subtitle">Every store registered on the platform, with its current average rating.</p>
          </div>
          <Link className="btn btn-primary" to="/admin/stores/new">Add a store</Link>
        </div>

        <div className="filter-bar">
          <input placeholder="Filter by name" value={filters.name} onChange={(e) => updateFilter('name', e.target.value)} />
          <input placeholder="Filter by email" value={filters.email} onChange={(e) => updateFilter('email', e.target.value)} />
          <input placeholder="Filter by address" value={filters.address} onChange={(e) => updateFilter('address', e.target.value)} />
        </div>

        {loading && <p className="loading-text">Loading stores…</p>}

        {!loading && stores.length === 0 && <div className="empty-state">No stores match those filters.</div>}

        {!loading && stores.length > 0 && (
          <table>
            <thead>
              <tr>
                <th onClick={() => toggleSort('name')}>Name</th>
                <th onClick={() => toggleSort('email')}>Email</th>
                <th onClick={() => toggleSort('address')}>Address</th>
                <th onClick={() => toggleSort('rating')}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.address}</td>
                  <td>{Number(s.average_rating).toFixed(1)} / 5</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
