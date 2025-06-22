/**
 * Upload related types
 */

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  type: 'training' | 'generated' | 'avatar';
  modelId?: string; // Required for training images
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  fields?: Record<string, string>;
}