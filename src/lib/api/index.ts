/**
 * Central export for API services
 */

import { AuthAPI } from './auth';
import { apiClient } from './client';
import { ModelsAPI } from './models';

// ** API client
export { ApiClient, apiClient } from './client';

// ** API services
export { AuthAPI } from './auth';
export { ModelsAPI } from './models';

// ** API constants
export * from './constants';

// ** Legacy compatibility - maintain existing interface for gradual migration
export const api = {
  // Auth methods
  register: (email: string, password: string, displayName?: string) => 
    AuthAPI.register({ email, password, displayName }),
  login: (email: string, password: string) => 
    AuthAPI.login({ email, password }),
  getProfile: () => AuthAPI.getProfile(),
  updateProfile: (updates: Record<string, unknown>) => AuthAPI.updateProfile(updates),

  // Settings methods - placeholder implementations
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (updates: Record<string, unknown>) => apiClient.put('/settings', updates),

  // Models methods - using ModelsAPI
  getTrainingModels: () => ModelsAPI.getModels(),
  createTrainingModel: (model: Record<string, unknown>) => ModelsAPI.createModel(model as any),
  getTrainingModel: (id: string) => ModelsAPI.getModel(id),
  updateTrainingModel: (id: string, updates: Record<string, unknown>) => ModelsAPI.updateModel(id, updates as any),
  deleteTrainingModel: (id: string) => ModelsAPI.deleteModel(id),

  // Images methods - placeholder implementations
  getTrainingImages: (modelId: string) => apiClient.get(`/models/${modelId}/images`),
  uploadTrainingImage: (modelId: string, imageData: Record<string, unknown>) => apiClient.post(`/models/${modelId}/images`, imageData),
  deleteTrainingImage: (imageId: string) => apiClient.delete(`/images/${imageId}`),

  getGeneratedImages: () => apiClient.get('/generated-images'),
  createGeneratedImage: (imageData: Record<string, unknown>) => apiClient.post('/generated-images', imageData),
  updateGeneratedImage: (id: string, updates: Record<string, unknown>) => apiClient.put(`/generated-images/${id}`, updates),
  deleteGeneratedImage: (id: string) => apiClient.delete(`/generated-images/${id}`),

  // Upload methods - placeholder implementations
  getPresignedUploadUrl: (filename: string, contentType: string, type: 'training' | 'generated' = 'training') =>
    apiClient.post('/upload/presigned', { filename, contentType, type }),
};
