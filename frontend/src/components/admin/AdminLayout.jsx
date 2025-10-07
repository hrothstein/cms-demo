import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import AdminNav from './AdminNav';
import LoadingSpinner from '../LoadingSpinner';

const AdminLayout = () => {
  const { isAuthenticated, isLoading, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const hasNavigated = useRef(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  useEffect(() => {
    if (!isAuthenticated && !isLoading && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate('/admin/login');
    }
  }, [isAuthenticated, isLoading]);

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={handleLogout} />
      <main className="ml-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
