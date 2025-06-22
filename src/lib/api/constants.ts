/**
 * API endpoint constants
 * Centralized location for all API endpoints
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
  },
  
  // Settings endpoints
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },
  
  // Models endpoints
  MODELS: {
    LIST: '/models',
    CREATE: '/models',
    GET: (id: string) => `/models/${id}`,
    UPDATE: (id: string) => `/models/${id}`,
    DELETE: (id: string) => `/models/${id}`,
  },
  
  // Images endpoints
  IMAGES: {
    LIST: (modelId: string) => `/models/${modelId}/images`,
    UPLOAD: (modelId: string) => `/models/${modelId}/images`,
    DELETE: (id: string) => `/images/${id}`,
  },
  
  // Generated images endpoints
  GENERATED: {
    LIST: '/generated-images',
    CREATE: '/generated-images',
    UPDATE: (id: string) => `/generated-images/${id}`,
    DELETE: (id: string) => `/generated-images/${id}`,
  },
  
  // Upload endpoints
  UPLOAD: {
    PRESIGNED: '/upload/presigned',
  },
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
