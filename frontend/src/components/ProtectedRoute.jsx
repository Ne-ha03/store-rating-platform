import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps a page and only renders it if someone is logged in and (optionally)
// holds one of the allowed roles. Otherwise sends them somewhere sensible.
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
