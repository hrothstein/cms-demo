import { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if admin is authenticated on mount
  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token by getting profile
      const response = await adminApi.getProfile();
      if (response.success) {
        setAdmin(response.data);
        // Get permissions from token or make another API call
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setPermissions(tokenData.permissions || []);
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await adminApi.login(username, password);
      if (response.success) {
        const { token, ...adminData } = response.data;
        localStorage.setItem('adminToken', token);
        setAdmin(adminData);
        setPermissions(adminData.permissions || []);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { 
        success: false, 
        error: { 
          code: 'LOGIN_ERROR', 
          message: 'Login failed. Please try again.' 
        } 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    setPermissions([]);
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    return permissionList.some(permission => permissions.includes(permission));
  };

  const isAuthenticated = !!admin;

  const value = {
    admin,
    permissions,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    checkAdminAuth
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
