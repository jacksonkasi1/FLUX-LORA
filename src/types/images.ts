/**
 * Images related type definitions
 */

export interface TrainingImage {
  id: string;
  userId: string;
  trainingModelId: string;
  imageUrl: string;
  caption?: string;
  originalFilename?: string;
  fileSize?: number;
  imageHash?: string;
  createdAt: string;
}

export interface GeneratedImage {
  id: string;
  userId: string;
  trainingModelId?: string;
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  generationConfig: Record<string, unknown>;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  training_model?: {
    id: string;
    name: string;
    trigger_word: string;
  };
}

export interface CreateTrainingImageRequest {
  imageUrl: string;
  caption?: string;
  originalFilename?: string;
  fileSize?: number;
}

export interface CreateGeneratedImageRequest {
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  trainingModelId?: string;
  generationConfig?: Record<string, unknown>;
  isFavorite?: boolean;
}

export interface UpdateGeneratedImageRequest {
  isFavorite?: boolean;
  prompt?: string;
  negativePrompt?: string;
  generationConfig?: Record<string, unknown>;
}

export interface ImageUploadConfig {
  maxSize: number;
  allowedTypes: string[];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}
