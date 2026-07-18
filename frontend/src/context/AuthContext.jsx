import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await getMe();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    // Listen to token expiration events from api layer
    const handleAuthExpired = () => {
      setUser(null);
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const loginUser = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success('Welcome back!');
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginUser,
      logoutUser,
      isSuperAdmin,
      isAdmin,
      isReceptionist
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
