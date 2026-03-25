import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axiosInstance from '../common/axios/axios-instance';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  roles: any[];
  role?: string; // Convenience field for UI
  permissions: any[];


  isActive: boolean;
  avatar?: string;
  lastLogin?: string;
  phone?: string;
  department?: string;
  bio?: string;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setCredentials: (user: UserProfile, accessToken: string, refreshToken: string) => void;
}


// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    isAuthenticated: false,
    isLoading: true,
  });

  // Fetch logged-in user profile
  const fetchProfile = useCallback(async () => {
    try {
      const data: any = await axiosInstance.get('/users/profile');

      console.log('Fetched Profile Data:', data);
      
      // Map roles to a simple string for convenience
      const userRoles = Array.isArray(data.roles) ? data.roles : [];
      let primaryRole = data.role || 'User';
      
      if (userRoles.length > 0) {
        const firstRole = userRoles[0];
        primaryRole = typeof firstRole === 'object' ? (firstRole.name || 'User') : firstRole;
      }

      const processedData = {
        ...data,
        role: primaryRole
      };

      setState((prev: any) => ({
        ...prev,
        user: processedData,
        isAuthenticated: true,
        isLoading: false,
      }));



    } catch {
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    const data: any = await axiosInstance.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setState((prev) => ({
      ...prev,
      accessToken: data.accessToken,
    }));
    await fetchProfile();
    return data.user;
  }, [fetchProfile]);


  // Manual credentials injection (e.g., from email verification)
  const setCredentials = useCallback((user: UserProfile, accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Map roles to a simple string for convenience
    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    let primaryRole = 'User';
    
    if (userRoles.length > 0) {
      const firstRole = userRoles[0];
      primaryRole = typeof firstRole === 'object' ? (firstRole.name || 'User') : firstRole;
    }

    setState((prev: any) => ({
      ...prev,
      user: { ...user, role: primaryRole },
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    }));
  }, []);

  // Logout
  const logout = useCallback(async () => {

    try {
      await axiosInstance.delete('/auth/sessions');
    } catch {

      // Swallow errors — we still want to clear local state
    } finally {
      localStorage.clear();
      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // Expose as refreshUser for manual header re-syncs
  const refreshUser = fetchProfile;

  // On mount: restore session if a token exists
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile();
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser, setCredentials }}>

      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
