/**
 * Cryptographic utility functions
 */

import { createHash, randomBytes } from 'crypto';
import { ENV } from 'server/config/env';

/**
 * Generates a secure random user ID
 */
export const generateUserId = (): string => {
  return randomBytes(16).toString('hex');
};

/**
 * Generates a secure random ID for any entity
 */
export const generateId = (): string => {
  return randomBytes(16).toString('hex');
};

/**
 * Hashes a password with salt
 */
export const hashPassword = (password: string): string => {
  return createHash('sha256').update(password + ENV.auth.jwtSecret).digest('hex');
};

/**
 * Creates a hash for image deduplication
 */
export const createImageHash = (imageUrl: string, modelId: string): string => {
  return createHash('md5').update(imageUrl + modelId).digest('hex');
};

/**
 * Simple encryption for API keys (in production, use proper encryption)
 */
export const encryptApiKey = (apiKey: string): string => {
  return createHash('sha256').update(apiKey + ENV.auth.jwtSecret).digest('hex');
};

/**
 * Validates password strength
 */
export const validatePasswordStrength = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
};
