/**
 * Authentication API methods
 */

import { apiClient } from './client';
import type { 
  User, 
  AuthSession, 
  LoginCredentials, 
  RegisterCredentials 
} from '@/types';

/**
 * Authentication API service
 */
export class AuthAPI {
  /**
   * Register new user
   */
  static async register(credentials: RegisterCredentials): Promise<AuthSession> {
    return apiClient.post<AuthSession>('/auth/register', credentials);
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthSession> {
    return apiClient.post<AuthSession>('/auth/login', credentials);
  }

  /**
   * Get user profile
   */
  static async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: Partial<User>): Promise<User> {
    return apiClient.put<User>('/auth/profile', updates);
  }
}
