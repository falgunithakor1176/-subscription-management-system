/**
 * AuthContext.jsx
 * Global authentication state and actions.
 * Provides user, token, and auth methods to the entire application.
 */

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getMeApi, loginApi, logoutApi, registerApi } from '../modules/auth/services/auth.api.js';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // ─── Persist session ────────────────────────────────────────────────────────
  const persistSession = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  // ─── Initialize: verify stored token on mount ───────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        const response = await getMeApi();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [clearSession]);

  // ─── Auth actions ───────────────────────────────────────────────────────────

  const login = useCallback(async (credentials) => {
    const response = await loginApi(credentials);
    if (response.success) {
      persistSession(response.data.user, response.data.token);
    }
    return response;
  }, [persistSession]);

  const register = useCallback(async (data) => {
    const response = await registerApi(data);
    if (response.success) {
      persistSession(response.data.user, response.data.token);
    }
    return response;
  }, [persistSession]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Even if the server call fails, clear local session
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // ─── Role & Permission helpers ─────────────────────────────────────────────
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';
  const isCustomer = user?.role === 'CUSTOMER';
  const isAuthenticated = Boolean(user && token);

  const hasRole = useCallback(
    (...roles) => {
      if (!user?.role) return false;
      return roles.includes(user.role);
    },
    [user?.role]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isInitialized,
      isAuthenticated,
      isAdmin,
      isStaff,
      isCustomer,
      hasRole,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, isInitialized, isAuthenticated, isAdmin, isStaff, isCustomer, hasRole, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
