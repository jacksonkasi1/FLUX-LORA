export interface UserSettings {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  apiKeys: Record<string, string>; // Encrypted API keys
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingModel {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  modelType: string;
  triggerWord?: string;
  imageCount?: number;
  trainingConfig: Record<string, unknown>;
  modelUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

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
}
