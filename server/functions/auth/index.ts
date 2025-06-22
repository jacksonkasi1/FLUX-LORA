/**
 * Central export for authentication functions
 */

// ** Authentication handlers
export { handler as register } from './register';
export { handler as login } from './login';
export { handler as getProfile, updateHandler as updateProfile } from './profile';
