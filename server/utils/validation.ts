/**
 * Server validation utilities
 * Validation functions for server-side operations
 */

// ** import server config
import { serverEnv } from '@server/config/env';

/**
 * Validate file upload request
 */
export const validateFileUpload = (
  fileName: string,
  fileType: string,
  fileSize: number
): { isValid: boolean; error?: string } => {
  // Check file type
  if (!(serverEnv.constants.allowedImageTypes as readonly string[]).includes(fileType)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${serverEnv.constants.allowedImageTypes.join(', ')}`,
    };
  }

  // Check file size
  if (fileSize > serverEnv.constants.maxFileSize) {
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${serverEnv.constants.maxFileSize / (1024 * 1024)}MB`,
    };
  }

  // Check file name
  if (!fileName || fileName.trim().length === 0) {
    return {
      isValid: false,
      error: 'File name is required',
    };
  }

  return { isValid: true };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (
  page?: string,
  limit?: string
): { isValid: boolean; error?: string; page?: number; limit?: number } => {
  let pageNum = 1;
  let limitNum: number = serverEnv.constants.defaultPagination.limit;

  if (page) {
    pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return {
        isValid: false,
        error: 'Page must be a positive integer',
      };
    }
  }

  if (limit) {
    limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      return {
        isValid: false,
        error: 'Limit must be a positive integer',
      };
    }
    if (limitNum > serverEnv.constants.defaultPagination.maxLimit) {
      return {
        isValid: false,
        error: `Limit cannot exceed ${serverEnv.constants.defaultPagination.maxLimit}`,
      };
    }
  }

  return {
    isValid: true,
    page: pageNum,
    limit: limitNum,
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: 'Email is required',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; error?: string; missingFields?: string[] } => {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim().length === 0);
  });

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields,
    };
  }

  return { isValid: true };
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize input (alias for sanitizeString)
 */
export const sanitizeInput = sanitizeString;

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate UUID format
 */
export const validateUUID = (id: string): { isValid: boolean; error?: string } => {
  if (!id || typeof id !== 'string') {
    return {
      isValid: false,
      error: 'ID is required',
    };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return {
      isValid: false,
      error: 'Invalid ID format',
    };
  }

  return { isValid: true };
};
