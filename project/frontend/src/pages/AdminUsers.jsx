import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';

const ROLE_LABELS = { admin: 'Admin', user: 'Normal user', owner: 'Store owner' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data } = await client.get('/admin/users', { params: { ...filters, ...sort } });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
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
            <h1>Users</h1>
            <p className="page-subtitle">Every admin, normal user and store owner on the platform.</p>
          </div>
          <Link className="btn btn-primary" to="/admin/users/new">Add a user</Link>
        </div>

        <div className="filter-bar">
          <input placeholder="Filter by name" value={filters.name} onChange={(e) => updateFilter('name', e.target.value)} />
          <input placeholder="Filter by email" value={filters.email} onChange={(e) => updateFilter('email', e.target.value)} />
          <input placeholder="Filter by address" value={filters.address} onChange={(e) => updateFilter('address', e.target.value)} />
          <select value={filters.role} onChange={(e) => updateFilter('role', e.target.value)}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">Normal user</option>
            <option value="owner">Store owner</option>
          </select>
        </div>

        {loading && <p className="loading-text">Loading users…</p>}

        {!loading && users.length === 0 && <div className="empty-state">No users match those filters.</div>}

        {!loading && users.length > 0 && (
          <table>
            <thead>
              <tr>
                <th onClick={() => toggleSort('name')}>Name</th>
                <th onClick={() => toggleSort('email')}>Email</th>
                <th onClick={() => toggleSort('address')}>Address</th>
                <th onClick={() => toggleSort('role')}>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.address}</td>
                  <td><span className={`role-badge role-badge-${u.role}`}>{ROLE_LABELS[u.role]}</span></td>
                  <td><Link className="link-button" to={`/admin/users/${u.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
