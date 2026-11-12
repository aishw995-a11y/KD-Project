import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, confirmPass: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
  setProfileState: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session on startup
  useEffect(() => {
    async function loadUserSession() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const { user: currentUser } = await api.auth.getMe();
        setUser(currentUser);
        // Also fetch profile
        try {
          const { profile: userProfile } = await api.profile.get();
          setProfile(userProfile);
        } catch (profileErr) {
          console.warn('Could not fetch profile:', profileErr);
        }
      } catch (err) {
        console.warn('Stored token expired or invalid:', err);
        removeStoredToken();
        setToken(null);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserSession();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    try {
      const { profile: userProfile } = await api.profile.get();
      setProfile(userProfile);
    } catch {
      // Ignore if empty
    }
  };

  const register = async (name: string, email: string, pass: string, confirmPass: string) => {
    const res = await api.auth.register({ name, email, password: pass, confirmPassword: confirmPass });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    try {
      const { profile: userProfile } = await api.profile.get();
      setProfile(userProfile);
    } catch {
      // Ignore
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    try {
      const { profile: updated } = await api.profile.get();
      setProfile(updated);
      return updated;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return null;
    }
  };

  const setProfileState = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        setProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
