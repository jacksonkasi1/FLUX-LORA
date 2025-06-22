/**
 * Images API methods
 */

import { apiClient } from './client';
import type { 
  TrainingImage, 
  GeneratedImage, 
  CreateTrainingImageRequest, 
  CreateGeneratedImageRequest, 
  UpdateGeneratedImageRequest,
  PresignedUploadResponse 
} from '@/types';

/**
 * Training images API service
 */
export class TrainingImagesAPI {
  /**
   * Get training images for a model
   */
  static async getImages(modelId: string): Promise<TrainingImage[]> {
    return apiClient.get<TrainingImage[]>(`/models/${modelId}/images`);
  }

  /**
   * Upload training image
   */
  static async uploadImage(modelId: string, imageData: CreateTrainingImageRequest): Promise<TrainingImage> {
    return apiClient.post<TrainingImage>(`/models/${modelId}/images`, imageData);
  }

  /**
   * Delete training image
   */
  static async deleteImage(imageId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/images/${imageId}`);
  }
}

/**
 * Generated images API service
 */
export class GeneratedImagesAPI {
  /**
   * Get all generated images for user
   */
  static async getImages(): Promise<GeneratedImage[]> {
    return apiClient.get<GeneratedImage[]>('/generated-images');
  }

  /**
   * Create generated image record
   */
  static async createImage(imageData: CreateGeneratedImageRequest): Promise<GeneratedImage> {
    return apiClient.post<GeneratedImage>('/generated-images', imageData);
  }

  /**
   * Update generated image
   */
  static async updateImage(id: string, updates: UpdateGeneratedImageRequest): Promise<GeneratedImage> {
    return apiClient.put<GeneratedImage>(`/generated-images/${id}`, updates);
  }

  /**
   * Delete generated image
   */
  static async deleteImage(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/generated-images/${id}`);
  }
}

/**
 * File upload API service
 */
export class UploadAPI {
  /**
   * Get presigned upload URL
   */
  static async getPresignedUploadUrl(
    filename: string, 
    contentType: string, 
    type: 'training' | 'generated' = 'training'
  ): Promise<PresignedUploadResponse> {
    return apiClient.post<PresignedUploadResponse>('/upload/presigned', {
      filename,
      contentType,
      type,
    });
  }
}
