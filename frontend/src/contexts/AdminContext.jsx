import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AdminContext = createContext();

const initialState = {
  admin: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: [],
  error: null
};

function adminReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        admin: action.payload.admin,
        isAuthenticated: true,
        isLoading: false,
        permissions: action.payload.permissions || [],
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        admin: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        admin: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
}

export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token is still valid
      adminApi.getProfile()
        .then(response => {
          if (response.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                admin: response.data,
                permissions: response.data.permissions || []
              }
            });
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('adminToken');
            dispatch({ type: 'LOGOUT' });
          }
        })
        .catch((error) => {
          console.log('Token validation failed:', error.message);
          // Token is invalid, remove it
          localStorage.removeItem('adminToken');
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await adminApi.login(credentials);
      
      if (response.success) {
        localStorage.setItem('adminToken', response.data.token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            admin: response.data,
            permissions: response.data.permissions || []
          }
        });
        return { success: true };
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.error?.message || 'Login failed'
        });
        return { success: false, error: response.error?.message || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    dispatch({ type: 'LOGOUT' });
  };

  const hasPermission = (permission) => {
    return state.permissions.includes(permission);
  };

  const hasRole = (role) => {
    return state.admin?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.admin?.role);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearInvalidToken = () => {
    localStorage.removeItem('adminToken');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
    clearError,
    clearInvalidToken
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
