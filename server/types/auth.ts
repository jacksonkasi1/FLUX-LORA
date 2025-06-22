/**
 * Authentication related types
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
  displayName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}