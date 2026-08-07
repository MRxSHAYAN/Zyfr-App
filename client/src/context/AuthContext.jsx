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

  // Verify active session via HTTP-Only cookie on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.get('/auth/check');
        setAuthUser(res.data);
      } catch (error) {
        console.log('[AuthContext] No active session found or cookie expired');
        setAuthUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login handler
  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      setAuthUser(res.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  // Registration handler
  const register = async (username, email, password, avatar) => {
    try {
      const res = await api.post('/auth/register', { username, email, password, avatar });
      setAuthUser(res.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[AuthContext] Logout API error:', error);
    } finally {
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
