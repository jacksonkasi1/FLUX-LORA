/**
 * Client environment configuration
 * Environment variables for client-side operations only
 */

// ** API Configuration
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
} as const;

// ** External Services Configuration (Client-side)
export const externalServices = {
  falaiApiKey: import.meta.env.VITE_FALAI_API_KEY || '',
} as const;

// ** Client Constants
export const clientConstants = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  minTrainingImages: 2,
  maxTrainingImages: 50,
} as const;

// ** UI Constants
export const uiConstants = {
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
  desktopBreakpoint: 1280,
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

/**
 * Validates that all required client environment variables are set
 */
export const validateClientEnvironment = (): void => {
  const requiredVars = [
    { key: 'VITE_API_BASE_URL', value: apiConfig.baseUrl },
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);

  if (missingVars.length > 0) {
    const missing = missingVars.map(({ key }) => key).join(', ');
    console.warn(`Missing optional client environment variables: ${missing}`);
  }
};

// ** Centralized client environment configuration export
export const env = {
  api: apiConfig,
  external: externalServices,
  constants: clientConstants,
  ui: uiConstants,
} as const;
