import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HOME_BY_ROLE = { admin: '/admin', user: '/', owner: '/owner' };

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to={user ? HOME_BY_ROLE[user.role] : '/login'} className="topbar-brand">
          Store Ratings
        </Link>
        {user && (
          <div className="topbar-right">
            <span className="topbar-role">{user.role}</span>
            <span>{user.name}</span>
            <Link to="/account/password">Change password</Link>
            <button className="btn btn-secondary btn-small" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}
