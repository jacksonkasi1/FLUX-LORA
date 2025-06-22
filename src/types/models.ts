/**
 * Training models related type definitions
 */

export type ModelStatus = 'pending' | 'training' | 'completed' | 'failed';
export type ModelType = 'lora' | 'dreambooth' | 'textual_inversion';

export interface TrainingModel {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: ModelStatus;
  modelType: ModelType;
  triggerWord?: string;
  imageCount?: number;
  trainingConfig: Record<string, unknown>;
  modelUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingModelRequest {
  name: string;
  description?: string;
  triggerWord: string;
  modelType?: ModelType;
  trainingConfig?: Record<string, unknown>;
  status?: ModelStatus;
  imageCount?: number;
}

export interface UpdateTrainingModelRequest {
  name?: string;
  description?: string;
  status?: ModelStatus;
  modelUrl?: string;
  thumbnailUrl?: string;
  trainingConfig?: Record<string, unknown>;
  imageCount?: number;
}

export interface ModelConfig {
  name: string;
  triggerWord: string;
  description: string;
}
