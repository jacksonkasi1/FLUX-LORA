import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { trainFluxModel } from '@/services/falai';
import { ModelConfig } from '@/components/training/ModelConfig';
import { SettingsAPI } from '@/lib/api/settings';
import { ModelsAPI } from '@/lib/api/models';
import { TrainingImagesAPI, UploadAPI } from '@/lib/api/images';

export const useTrainingFlow = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    name: '',
    triggerWord: '',
    description: '',
  });
  const [isTraining, setIsTraining] = useState(false);
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return images.length >= 2; // Minimum 2 images
      case 2:
        return Boolean(modelConfig.name.trim() && modelConfig.triggerWord.trim());
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      await startTraining();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTraining = async () => {
    if (!user) return;

    try {
      setIsTraining(true);

      // Check if user has FAL.AI API key
      const settings = await SettingsAPI.getSettings();
      if (!settings.hasApiKeys || !settings.apiKeyServices.includes('falai')) {
        toast({
          title: "API Key Required",
          description: "Please add your FAL.AI API key in Settings before training a model.",
          variant: "destructive",
        });
        setIsTraining(false);
        return;
      }

      // Create the model record
      const model = await ModelsAPI.createModel({
        name: modelConfig.name,
        triggerWord: modelConfig.triggerWord,
        description: modelConfig.description,
        status: 'pending',
        imageCount: images.length,
      });

      setCurrentModelId(model.id);

      // Upload images and save references
      const uploadPromises = images.map(async (image, index) => {
        // Get presigned upload URL
        const { uploadUrl, publicUrl } = await UploadAPI.getPresignedUploadUrl(
          `${model.id}-${index}-${Date.now()}.${image.type.split('/')[1]}`,
          image.type,
          'training'
        );

        // Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: image,
          headers: {
            'Content-Type': image.type,
          },
        });

        // Save image record to database
        await TrainingImagesAPI.uploadImage(model.id, {
          imageUrl: publicUrl,
          originalFilename: image.name,
          fileSize: image.size,
        });

        return publicUrl;
      });

      await Promise.all(uploadPromises);

      setCurrentStep(4);
      
      // Start actual FAL.AI training
      toast({
        title: "Training started",
        description: "Your model training has begun. This will take 2-10 minutes.",
      });

      // Start training in background
      trainFluxModel({
        images,
        triggerWord: modelConfig.triggerWord,
        modelId: model.id,
        apiKey: 'dummy' // Will be retrieved from settings in the service
      }).catch((error) => {
        console.error('Background training error:', error);
        toast({
          title: "Training failed",
          description: error instanceof Error ? error.message : "Training failed. Please try again.",
          variant: "destructive",
        });
      });

    } catch (error: unknown) {
      console.error('Training setup error:', error);
      toast({
        title: "Training failed",
        description: error instanceof Error ? error.message : "Failed to start training. Please try again.",
        variant: "destructive",
      });
      setIsTraining(false);
    }
  };

  return {
    currentStep,
    images,
    setImages,
    modelConfig,
    setModelConfig,
    isTraining,
    currentModelId,
    canProceedToNext,
    handleNext,
    handleBack,
  };
};
