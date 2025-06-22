/**
 * Validation utility functions
 */

import { env } from '@/config/env';

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates file type for image uploads
 */
export const isValidImageType = (contentType: string): boolean => {
  const allowedTypes: readonly string[] = env.constants.allowedImageTypes;
  return allowedTypes.includes(contentType.toLowerCase());
};

/**
 * Validates file size
 */
export const isValidFileSize = (size: number): boolean => {
  return size <= env.constants.maxFileSize;
};

/**
 * Validates training image count
 */
export const isValidTrainingImageCount = (count: number): boolean => {
  return count >= env.constants.minTrainingImages && count <= env.constants.maxTrainingImages;
};

/**
 * Validates model name
 */
export const isValidModelName = (name: string): boolean => {
  return name.trim().length >= 3 && name.trim().length <= 50;
};

/**
 * Validates trigger word
 */
export const isValidTriggerWord = (triggerWord: string): boolean => {
  return triggerWord.trim().length >= 2 && triggerWord.trim().length <= 20;
};

/**
 * Validates URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitizes user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000); // Limit length
};
