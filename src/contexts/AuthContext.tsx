import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, toFrontendRole, normalizeUser, NormalizedUser } from "@/lib/api";

export type UserRole = "teacher" | "student" | null;

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  session: null; // kept for interface compat, always null
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<{ error: Error | null }>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fairgrade.onrender.com';

function buildAuthUserFromStored(): AuthUser | null {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  try {
    const u = JSON.parse(storedUser);
    return {
      id: u.id || '',
      email: u.email || '',
      fullName: u.name || u.fullName || null,
      firstName: u.first_name || u.firstName || null,
      lastName: u.last_name || u.lastName || null,
      role: (toFrontendRole(u.role) as UserRole) || null,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from cache synchronously — no loading screen
  const cachedUser = buildAuthUserFromStored();
  const hasToken = !!localStorage.getItem('access_token');

  const [user, setUser] = useState<AuthUser | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(!hasToken && !cachedUser ? false : false);
  const [role, setRole] = useState<UserRole>(cachedUser?.role || null);

  // Silently verify token in background — never show loading
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    api.get('/api/auth/me')
      .then((data) => {
        const normalized = normalizeUser(data);
        const authUser: AuthUser = {
          id: normalized.id,
          email: normalized.email,
          fullName: normalized.name,
          firstName: normalized.first_name,
          lastName: normalized.last_name,
          role: (normalized.role as UserRole) || null,
        };
        setUser(authUser);
        setRole(authUser.role);
        localStorage.setItem('user', JSON.stringify(normalized));
        localStorage.setItem('user_role', normalized.role || '');
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        setUser(null);
        setRole(null);
      });
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setRole(null);
      return;
    }
    try {
      const data = await api.get('/api/auth/me');
      const normalized = normalizeUser(data);
      const authUser: AuthUser = {
        id: normalized.id,
        email: normalized.email,
        fullName: normalized.name,
        firstName: normalized.first_name,
        lastName: normalized.last_name,
        role: (normalized.role as UserRole) || null,
      };
      setUser(authUser);
      setRole(authUser.role);
      localStorage.setItem('user', JSON.stringify(normalized));
      localStorage.setItem('user_role', normalized.role || '');
    } catch {
      setUser(null);
      setRole(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('access_token', response.access_token);
      const normalized = normalizeUser(response.user);
      localStorage.setItem('user', JSON.stringify(normalized));
      localStorage.setItem('user_role', normalized.role || '');
      const authUser: AuthUser = {
        id: normalized.id,
        email: normalized.email,
        fullName: normalized.name,
        firstName: normalized.first_name,
        lastName: normalized.last_name,
        role: (normalized.role as UserRole) || null,
      };
      setUser(authUser);
      setRole(authUser.role);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userRole: UserRole
  ): Promise<{ error: Error | null }> => {
    try {
      const { toApiRole } = await import("@/lib/api");
      const response = await api.post('/api/auth/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName || '',
        role: toApiRole(userRole),
      });
      localStorage.setItem('access_token', response.access_token);
      const normalized = normalizeUser(response.user);
      localStorage.setItem('user', JSON.stringify(normalized));
      localStorage.setItem('user_role', normalized.role || '');
      const authUser: AuthUser = {
        id: normalized.id,
        email: normalized.email,
        fullName: normalized.name,
        firstName: normalized.first_name,
        lastName: normalized.last_name,
        role: (normalized.role as UserRole) || null,
      };
      setUser(authUser);
      setRole(authUser.role);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    window.location.href = `${API_BASE_URL}/api/auth/google/authorize`;
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    sessionStorage.clear();
    setUser(null);
    setRole(null);
  }, []);

  const value: AuthContextType = {
    user,
    session: null,
    isAuthenticated: !!user,
    isLoading,
    role,
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
