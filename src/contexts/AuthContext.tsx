import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate it
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
      // Validate token by fetching profile
      apiClient.getProfile()
        .then((profile) => {
          const userData = {
            id: profile.id,
            email: profile.email,
            displayName: profile.displayName,
          };
          setUser(userData);
          setSession({ user: userData });
          setLoading(false);
        })
        .catch(() => {
          // Token is invalid, clear it
          apiClient.setToken(null);
          setUser(null);
          setSession(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const response = await apiClient.register(email, password, displayName);
      const userData = {
        id: response.user.id,
        email: response.user.email,
        displayName: response.user.displayName,
      };
      
      apiClient.setToken(response.token);
      setUser(userData);
      setSession({ user: userData });
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      const userData = {
        id: response.user.id,
        email: response.user.email,
        displayName: response.user.displayName,
      };
      
      apiClient.setToken(response.token);
      setUser(userData);
      setSession({ user: userData });
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    apiClient.setToken(null);
    setUser(null);
    setSession(null);
  };

  const signInWithGoogle = async () => {
    // Google OAuth not implemented in this simple setup
    return { error: { message: 'Google OAuth not implemented yet' } };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
