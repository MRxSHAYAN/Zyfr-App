import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.get('/auth/check');
        setAuthUser(res.data);
      } catch (error) {
        console.log('[AuthContext] No active session found');
        localStorage.removeItem('zyfr_token');
        setAuthUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data.token) {
        localStorage.setItem('zyfr_token', res.data.token);
      }
      setAuthUser(res.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const register = async (username, fullName, email, password, avatar, bio) => {
    try {
      const res = await api.post('/auth/register', { username, fullName, email, password, avatar, bio });
      if (res.data.token) {
        localStorage.setItem('zyfr_token', res.data.token);
      }
      setAuthUser(res.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/users/profile', profileData);
      setAuthUser(res.data);
      return { success: true, user: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile.',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[AuthContext] Logout API error:', error);
    } finally {
      localStorage.removeItem('zyfr_token');
      setAuthUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        isCheckingAuth,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
