import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  const initializeAuth = useCallback(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const clearInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
  };

  const startInactivityTimer = () => {
    clearInactivityTimer();
    const timer = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT_MS);
    setInactivityTimer(timer);
  };

  const handleUserActivity = () => {
    if (token) {
      startInactivityTimer();
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    setToken(newToken);
    startInactivityTimer();
  };

  const logout = () => {
    clearInactivityTimer();
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
  };

  const handleLogout = useCallback(() => {
    logout();
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (token) {
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
      window.addEventListener('click', handleUserActivity);
      startInactivityTimer();
    }

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      clearInactivityTimer();
    };
  }, [token]);

  const contextValue: AuthContextType = {
    isLoggedIn: Boolean(token),
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
