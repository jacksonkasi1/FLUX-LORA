/**
 * Authentication API hooks
 * Hooks for managing authentication-related API calls
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ** import api
import { AuthAPI } from '@/lib/api';

// ** import types
import type { AuthSession, LoginCredentials, RegisterCredentials, User } from '@/types';

/**
 * Hook for user login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthSession, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => AuthAPI.login(credentials),
    onSuccess: (data) => {
      // Cache user data
      queryClient.setQueryData(['user'], data.user);
      // Store token
      localStorage.setItem('auth_token', data.token);
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthSession, Error, RegisterCredentials>({
    mutationFn: (credentials: RegisterCredentials) => AuthAPI.register(credentials),
    onSuccess: (data) => {
      // Cache user data
      queryClient.setQueryData(['user'], data.user);
      // Store token
      localStorage.setItem('auth_token', data.token);
    },
  });
};

/**
 * Hook for getting current user profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => AuthAPI.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for updating user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => AuthAPI.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update cached user data
      queryClient.setQueryData(['user'], updatedUser);
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Remove token
      localStorage.removeItem('auth_token');
    },
  });
};
