/**
 * Images related types
 */

export interface TrainingImage {
  id: string;
  modelId: string;
  userId: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  hash: string; // For deduplication
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedImage {
  id: string;
  userId: string;
  modelId: string;
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  thumbnailUrl: string;
  generationConfig: {
    steps: number;
    guidanceScale: number;
    seed: number;
  };
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadTrainingImageRequest {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface GenerateImageRequest {
  modelId: string;
  prompt: string;
  negativePrompt?: string;
  generationConfig?: {
    steps?: number;
    guidanceScale?: number;
    seed?: number;
  };
}

export interface UpdateGeneratedImageRequest {
  isFavorite?: boolean;
}