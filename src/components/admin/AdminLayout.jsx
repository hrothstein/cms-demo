import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import AdminNav from './AdminNav';
import LoadingSpinner from '../LoadingSpinner';

const AdminLayout = () => {
  const { isAuthenticated, isLoading, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    navigate('/admin/login');
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
