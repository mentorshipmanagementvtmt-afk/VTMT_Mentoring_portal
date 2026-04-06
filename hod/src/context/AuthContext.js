import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

// 1. Create the "box"
const AuthContext = createContext(null);

// 2. Create the "manager" (Provider) for the box
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // 3. Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setToken('cookie'); // Indicate we rely on HttpOnly cookie
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 4. Login function
  const login = (data) => {
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken('cookie');
    setUser(data.user);
  };

  // 5. Logout function
  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (e) {
      console.error('Logout failed:', e);
    }
    localStorage.removeItem('token'); // In case old tokens are there
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 6. Create a simple "hook" to use the box
export const useAuth = () => {
  return useContext(AuthContext);
};