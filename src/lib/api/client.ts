/**
 * API client with improved organization and error handling
 * Following better code practices for API management
 */

// ** import config
import { env } from '@/config';

// ** import types
import type { ApiResponse } from '@/types';

// ** import constants
import { HTTP_METHODS, HTTP_STATUS } from './constants';

// ** import api
// import { apiClient } from '@/lib/api';

/**
 * API client class with organized methods
 */
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = env.api.baseUrl) {
    this.baseUrl = baseUrl;
    this.token = this.getStoredToken();
  }

  /**
   * Get stored authentication token
   */
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  /**
   * Make HTTP request with proper error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      // Assuming options.headers is a Record<string, string>
      Object.assign(headers, options.headers);
    }

    // Add authorization header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid response format: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse<T> = await response.json();

      // Handle API errors
      if (!data.success) {
        throw new Error(data.error?.message || 'API request failed');
      }

      return data.data as T;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error instanceof Error ? error.message : "Unknown error".includes('fetch')) {
        throw new Error('Network error: Please check your internet connection');
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
