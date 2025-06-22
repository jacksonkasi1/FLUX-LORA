/**
 * Training models API methods
 */

import { apiClient } from './client';
import type { 
  TrainingModel, 
  CreateTrainingModelRequest, 
  UpdateTrainingModelRequest 
} from '@/types';

/**
 * Training models API service
 */
export class ModelsAPI {
  /**
   * Get all training models for user
   */
  static async getModels(): Promise<TrainingModel[]> {
    return apiClient.get<TrainingModel[]>('/models');
  }

  /**
   * Create new training model
   */
  static async createModel(model: CreateTrainingModelRequest): Promise<TrainingModel> {
    return apiClient.post<TrainingModel>('/models', model);
  }

  /**
   * Get specific training model
   */
  static async getModel(id: string): Promise<TrainingModel> {
    return apiClient.get<TrainingModel>(`/models/${id}`);
  }

  /**
   * Update training model
   */
  static async updateModel(id: string, updates: UpdateTrainingModelRequest): Promise<TrainingModel> {
    return apiClient.put<TrainingModel>(`/models/${id}`, updates);
  }

  /**
   * Delete training model
   */
  static async deleteModel(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/models/${id}`);
  }
}
