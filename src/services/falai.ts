/**
 * FAL.AI service
 * Handles interactions with FAL.AI API for model training and generation
 */

import { fal } from '@fal-ai/client';

// ** import config
import { env } from '@/config';

// ** import api client
import { apiClient } from '@/lib/api';

// ** import types
import type { UserSettings } from '@/types';

/**
 * Get user's FAL.AI API key from settings
 */
export const getUserApiKey = async (userId: string): Promise<string | null> => {
  try {
    // First try to get from user settings via API
    const settings = await apiClient.get<UserSettings>('/settings');
    
    if (settings?.hasApiKeys && settings?.apiKeyServices?.includes('falai')) {
      // Get the FAL.AI API key from the apiKeys record
      return settings.apiKeys['falai'] || env.external.falaiApiKey || null;
    }

    // Fallback to environment variable
    return env.external.falaiApiKey || null;
  } catch (error) {
    console.error('Error fetching API key:', error);
    // Fallback to environment variable
    return env.external.falaiApiKey || null;
  }
};

interface TrainFluxModelParams {
  images: File[];
  triggerWord: string;
  modelId: string;
  apiKey: string;
}

/**
 * Compress image for training
 */
const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, { 
            type: 'image/jpeg',
            lastModified: Date.now() 
          });
          resolve(compressedFile);
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, 'image/jpeg', quality);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const trainFluxModel = async ({ images, triggerWord, modelId, apiKey }: TrainFluxModelParams) => {
  try {
    // Configure FAL client with the API key
    fal.config({
      credentials: apiKey,
    });

    // Update model status to training
    await apiClient.put(`/models/${modelId}`, { status: 'training' });

    console.log('Starting image compression and ZIP creation...');
    
    // First, compress all images to ensure they're under size limits
    const compressedImages = await Promise.all(
      images.map(async (image, index) => {
        console.log(`Compressing image ${index + 1}/${images.length}...`);
        
        // If image is already small enough (< 1MB), use as-is, otherwise compress
        if (image.size < 1024 * 1024) {
          return image;
        }
        
        return await compressImage(image, 1024, 0.6);
      })
    );
    
    // Create a ZIP archive containing all images
    console.log('Creating ZIP archive...');
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Add each compressed image to the ZIP
    compressedImages.forEach((image, index) => {
      const fileName = `image_${index + 1}.${image.type.split('/')[1] || 'jpg'}`;
      zip.file(fileName, image);
    });
    
    // Generate the ZIP file as a blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], 'training_images.zip', { type: 'application/zip' });

    console.log(`ZIP archive created (${(zipFile.size / 1024 / 1024).toFixed(2)}MB), uploading to FAL.AI storage...`);
    
    // Upload the ZIP file to FAL.AI storage
    const zipUrl = await fal.storage.upload(zipFile);
    console.log('ZIP archive uploaded successfully:', zipUrl);

    console.log('Starting training with ZIP archive...');

    // Submit training job to FAL.AI using the ZIP archive URL
    const result = await fal.subscribe('fal-ai/flux-lora-fast-training', {
      input: {
        images_data_url: zipUrl,
        trigger_word: triggerWord,
        is_style: false,
        steps: 1000,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update);
      },
    });

    console.log('Training result:', result);

    // Update model with training results
    await apiClient.put(`/models/${modelId}`, { 
      status: 'completed',
      modelUrl: result.data?.diffusers_lora_file?.url || null,
      trainingConfig: result.data
    });

    return result;

  } catch (error: unknown) {
    console.error('Training failed:', error);
    
    // Update model status to failed
    await apiClient.put(`/models/${modelId}`, { status: 'failed' });

    throw error;
  }
};
