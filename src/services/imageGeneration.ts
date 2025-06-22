/**
 * Image generation service
 * Handles AI image generation using FAL.AI
 */

import { fal } from '@fal-ai/client';

// ** import config
import { env } from '@/config';

// ** import types
import type { GeneratedImage } from '@/types';

export interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  modelUrl: string;
  triggerWord: string;
  width?: number;
  height?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
  seed?: number;
}

export interface GeneratedImageResult {
  imageUrl: string;
  seed: number;
  prompt: string;
  negativePrompt?: string;
  generationConfig: Record<string, unknown>;
}

/**
 * Generate image with trained LoRA model
 */
export const generateImageWithModel = async (
  params: GenerateImageParams, 
  userId: string, 
  modelId: string
): Promise<GeneratedImageResult> => {
  try {
    // Configure FAL client with API key
    fal.config({
      credentials: env.external.falaiApiKey,
    });

    console.log('Generating image with trained model:', params);

    // Generate image using the trained LoRA model
    const result = await fal.subscribe('fal-ai/flux-lora', {
      input: {
        prompt: params.prompt,
        loras: [{ path: params.modelUrl, scale: 1 }],
        image_size: 'square_hd',
        num_inference_steps: params.numInferenceSteps || 28,
        guidance_scale: params.guidanceScale || 3.5,
        num_images: 1,
        enable_safety_checker: true,
        seed: params.seed,
      },
      logs: true,
    });

    console.log('Generation result:', result);

    if (!result.data?.images?.[0]?.url) {
      throw new Error('No image generated');
    }

    const imageUrl = result.data.images[0].url;
    const generationConfig = {
      model_url: params.modelUrl,
      trigger_word: params.triggerWord,
      num_inference_steps: params.numInferenceSteps || 28,
      guidance_scale: params.guidanceScale || 3.5,
      image_size: 'square_hd',
      seed: result.data.seed || params.seed,
    };

    // Note: Image saving to database should be handled by the API layer
    // This service only handles the generation logic

    return {
      imageUrl,
      seed: result.data.seed || params.seed || 0,
      prompt: params.prompt,
      negativePrompt: params.negativePrompt,
      generationConfig,
    };

  } catch (error: unknown) {
    console.error('Image generation failed:', error);
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Failed to generate image';
    throw new Error(errorMessage);
  }
};
