import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh access token
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken: newAccessToken } = response.data;
      localStorage.setItem('accessToken', newAccessToken);
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setAccessToken(null);
      throw error;
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      const storedAccessToken = localStorage.getItem('accessToken');

      if (refreshToken && storedAccessToken) {
        try {
          setAccessToken(storedAccessToken);
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          // Token expired or invalid, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setAccessToken(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken: newAccessToken, refreshToken } = response.data;
    
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setAccessToken(newAccessToken);
    setUser(userData);
    
    return userData;
  }, []);

  // Register function
  const register = useCallback(async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { user: userData, accessToken: newAccessToken, refreshToken } = response.data;
    
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setAccessToken(newAccessToken);
    setUser(userData);
    
    return userData;
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors during logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
