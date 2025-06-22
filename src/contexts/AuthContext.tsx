/**
 * Authentication context with improved organization
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// ** Import API services
import { AuthAPI, apiClient } from '@/lib/api';

// ** Import types
import type { User, AuthContextType } from '@/types';

// ** Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication provider component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ** State management
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);

  // ** Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        apiClient.setToken(token);
        
        try {
          const profile = await AuthAPI.getProfile();
          const userData: User = {
            id: profile.id,
            email: profile.email,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          };
          
          setUser(userData);
          setSession({ user: userData });
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          apiClient.setToken(null);
          setUser(null);
          setSession(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Sign up new user
   */
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const response = await AuthAPI.register({ email, password, displayName });
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        displayName: response.user.displayName,
        avatarUrl: response.user.avatarUrl,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      };
      
      apiClient.setToken(response.token);
      setUser(userData);
      setSession({ user: userData });
      
      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Sign up failed';
      return { error: new Error(errorMessage) };
    }
  };

  /**
   * Sign in existing user
   */
  const signIn = async (email: string, password: string) => {
    try {
      const response = await AuthAPI.login({ email, password });
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        displayName: response.user.displayName,
        avatarUrl: response.user.avatarUrl,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      };
      
      apiClient.setToken(response.token);
      setUser(userData);
      setSession({ user: userData });
      
      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Sign in failed';
      return { error: new Error(errorMessage) };
    }
  };

  /**
   * Sign out user
   */
  const signOut = async (): Promise<void> => {
    apiClient.setToken(null);
    setUser(null);
    setSession(null);
  };

  /**
   * Sign in with Google (placeholder)
   */
  const signInWithGoogle = async () => {
    return { error: new Error('Google OAuth not implemented yet') };
  };

  // ** Context value
  const value: AuthContextType = {
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
