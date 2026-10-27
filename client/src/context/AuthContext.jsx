import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mystery_room_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('mystery_room_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('mystery_room_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('mystery_room_user', JSON.stringify(response.user));
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('mystery_room_token', res.token);
      localStorage.setItem('mystery_room_user', JSON.stringify(res.user));
      return res.user;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('mystery_room_token', res.token);
      localStorage.setItem('mystery_room_user', JSON.stringify(res.user));
      return res.user;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network failures on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('mystery_room_token');
      localStorage.removeItem('mystery_room_user');
    }
  };

  const updateProfile = async (payload) => {
    const res = await api.patch('/auth/profile', payload);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('mystery_room_user', JSON.stringify(res.user));
      return res.user;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
