import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

// 1. Create the "box"
const AuthContext = createContext(null);

// 2. Create the "manager" (Provider) for the box
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // 3. Restore the current session from the backend cookie
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const { data } = await api.get('/users/profile');
        if (!isMounted) return;

        localStorage.setItem('user', JSON.stringify(data));
        setToken('cookie');
        setUser(data);
      } catch (error) {
        if (!isMounted) return;

        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
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
    <AuthContext.Provider value={{ token, user, login, logout, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
}

// 6. Create a simple "hook" to use the box
export const useAuth = () => {
  return useContext(AuthContext);
};
