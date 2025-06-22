/**
 * Application constants
 * Centralized location for all application-wide constants
 */

// ** File Upload Constants
export const FILE_CONSTANTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  PRESIGNED_URL_EXPIRY: 3600, // 1 hour
} as const;

// ** Training Constants
export const TRAINING_CONSTANTS = {
  MIN_IMAGES: 2,
  MAX_IMAGES: 50,
  DEFAULT_STEPS: 1000,
  DEFAULT_LEARNING_RATE: 0.0001,
} as const;

// ** UI Constants
export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
} as const;

// ** API Constants
export const API_CONSTANTS = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// ** Status Constants
export const STATUS_CONSTANTS = {
  TRAINING: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
  GENERATION: {
    PENDING: 'pending',
    GENERATING: 'generating',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
} as const;

// ** Route Constants
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  SIGNUP: '/auth/signup',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  TRAIN: '/train',
  MODELS: '/models',
  GALLERY: '/gallery',
} as const;
