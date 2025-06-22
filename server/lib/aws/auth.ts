/**
 * Authentication service with JWT handling
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { serverEnv } from '@server/config';
import type { JWTPayload } from '@server/types';

/**
 * Authentication service class
 */
export class AuthService {
  /**
   * Generate JWT token for user payload
   */
  static generateToken(payload: { userId: string; email: string }): string {
    const jwtPayload: JWTPayload = {
      userId: payload.userId,
      email: payload.email,
    };

    return jwt.sign(jwtPayload, serverEnv.auth.jwtSecret, {
      expiresIn: serverEnv.auth.tokenExpiry,
    });
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, serverEnv.auth.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, serverEnv.auth.bcryptRounds);
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Encrypt API key (simple base64 encoding for now - use proper encryption in production)
   */
  static encryptApiKey(apiKey: string): string {
    return Buffer.from(apiKey).toString('base64');
  }

  /**
   * Decrypt API key
   */
  static decryptApiKey(encryptedApiKey: string): string {
    return Buffer.from(encryptedApiKey, 'base64').toString('utf8');
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Validate token and return user info
   */
  static validateAuthHeader(authHeader: string | undefined): JWTPayload | null {
    const token = this.extractTokenFromHeader(authHeader);
    if (!token) {
      return null;
    }
    return this.verifyToken(token);
  }
}
