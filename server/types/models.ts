/**
 * Training models related types
 */

export interface TrainingModel {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  triggerWord: string;
  imageCount: number;
  trainingJobId?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  trainingConfig: {
    steps: number;
    learningRate: number;
    batchSize: number;
  };
  progress?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateTrainingModelRequest {
  name: string;
  description?: string;
  triggerWord: string;
  trainingConfig?: {
    steps?: number;
    learningRate?: number;
    batchSize?: number;
  };
}

export interface UpdateTrainingModelRequest {
  name?: string;
  description?: string;
  status?: TrainingModel['status'];
  progress?: number;
  errorMessage?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  completedAt?: string;
}