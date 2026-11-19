import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('uniskill_token');
      const cached = localStorage.getItem('uniskill_user');

      if (token && cached) {
        try {
          setUser(JSON.parse(cached));
          // Verify with backend
          const fresh = await authService.getCurrentUser();
          setUser(fresh);
          localStorage.setItem('uniskill_user', JSON.stringify(fresh));
        } catch (err) {
          console.warn("Session expired or token invalid.");
          authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const switchRole = async (targetRole) => {
    try {
      setLoading(true);
      if (targetRole === 'admin') {
        const data = await authService.login('rahul@uniskill.in', '1234567890');
        setUser(data.user);
      } else {
        const data = await authService.login('student@uniskill.in', 'student123');
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error switching demo role:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchRole, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

