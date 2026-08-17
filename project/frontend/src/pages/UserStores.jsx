import { useEffect, useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';
import StarRating from '../components/StarRating';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function loadStores(query = '') {
    setLoading(true);
    try {
      const { data } = await client.get('/stores', { params: { search: query } });
      setStores(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  // small debounce so we're not firing a request on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => loadStores(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleRate(storeId, rating) {
    setSavingId(storeId);
    try {
      await client.post(`/stores/${storeId}/rating`, { rating });
      // reload so the overall average reflects what the server actually computed
      await loadStores(search);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Browse stores</h1>
            <p className="page-subtitle">Search by name or address, then rate any store from 1 to 5 stars.</p>
          </div>
        </div>

        <div className="filter-bar">
          <input
            placeholder="Search by store name or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 280 }}
          />
        </div>

        {loading && <p className="loading-text">Loading stores…</p>}

        {!loading && stores.length === 0 && (
          <div className="empty-state">No stores match your search yet.</div>
        )}

        <div className="store-grid">
          {stores.map((store) => (
            <div className="store-card" key={store.id}>
              <h3>{store.name}</h3>
              <div className="store-address">{store.address}</div>

              <div className="rating-row">
                <span>Overall rating</span>
                <span className="value">{Number(store.average_rating).toFixed(1)} / 5</span>
              </div>
              <div className="rating-row">
                <span>Your rating</span>
                <span className="value">{store.user_rating ? `${store.user_rating} / 5` : 'Not rated yet'}</span>
              </div>

              <StarRating
                value={store.user_rating || 0}
                onChange={(rating) => handleRate(store.id, rating)}
                disabled={savingId === store.id}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
