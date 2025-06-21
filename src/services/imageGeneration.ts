
import { fal } from '@fal-ai/client';
import { supabase } from '@/integrations/supabase/client';
import { getUserApiKey } from './falai';

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
  generationConfig: any;
}

export const generateImageWithModel = async (
  params: GenerateImageParams, 
  userId: string, 
  modelId: string
): Promise<GeneratedImageResult> => {
  try {
    // Get user's API key
    const apiKey = await getUserApiKey(userId);
    if (!apiKey) {
      throw new Error('FAL.AI API key not found. Please add your API key in Settings.');
    }

    // Configure FAL client
    fal.config({
      credentials: apiKey,
    });

    console.log('Generating image with trained model:', params);

    // Generate image using the trained LoRA model with correct property names
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

    // Save generated image to database
    const { data: savedImage, error } = await supabase
      .from('generated_images')
      .insert({
        user_id: userId,
        training_model_id: modelId,
        prompt: params.prompt,
        negative_prompt: params.negativePrompt,
        image_url: imageUrl,
        generation_config: generationConfig,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving generated image:', error);
      // Don't throw here - we still want to return the generated image
    }

    return {
      imageUrl,
      seed: result.data.seed || params.seed || 0,
      prompt: params.prompt,
      negativePrompt: params.negativePrompt,
      generationConfig,
    };

  } catch (error: any) {
    console.error('Image generation failed:', error);
    throw new Error(error.message || 'Failed to generate image');
  }
};
