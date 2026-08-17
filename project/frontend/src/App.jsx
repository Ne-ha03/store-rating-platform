import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import UpdatePassword from './pages/UpdatePassword';

import UserStores from './pages/UserStores';

import OwnerDashboard from './pages/OwnerDashboard';

import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetails from './pages/AdminUserDetails';
import AdminStores from './pages/AdminStores';
import AdminAddUser from './pages/AdminAddUser';
import AdminAddStore from './pages/AdminAddStore';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/account/password"
        element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        }
      />

      {/* normal user */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserStores />
          </ProtectedRoute>
        }
      />

      {/* store owner */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      {/* admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/new"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAddUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUserDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminStores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores/new"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAddStore />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
