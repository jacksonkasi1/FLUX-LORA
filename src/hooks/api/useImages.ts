/**
 * Images hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { TrainingImage, GeneratedImage } from '@/types';

/**
 * Get training images for a model
 */
export const useTrainingImages = (modelId: string) => {
  return useQuery({
    queryKey: ['training-images', modelId],
    queryFn: () => apiClient.get<TrainingImage[]>(`/models/${modelId}/images`),
    enabled: !!modelId,
  });
};

/**
 * Upload training image mutation
 */
export const useUploadTrainingImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ modelId, imageData }: { modelId: string; imageData: any }) =>
      apiClient.post(`/models/${modelId}/images`, imageData),
    onSuccess: (_, { modelId }) => {
      queryClient.invalidateQueries({ queryKey: ['training-images', modelId] });
    },
  });
};

/**
 * Delete training image mutation
 */
export const useDeleteTrainingImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => apiClient.delete(`/images/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-images'] });
    },
  });
};

/**
 * Get generated images
 */
export const useGeneratedImages = () => {
  return useQuery({
    queryKey: ['generated-images'],
    queryFn: () => apiClient.get<GeneratedImage[]>('/generated-images'),
  });
};

/**
 * Create generated image mutation
 */
export const useCreateGeneratedImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageData: any) => apiClient.post('/generated-images', imageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-images'] });
    },
  });
};

/**
 * Update generated image mutation
 */
export const useUpdateGeneratedImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      apiClient.put(`/generated-images/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-images'] });
    },
  });
};

/**
 * Delete generated image mutation
 */
export const useDeleteGeneratedImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/generated-images/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-images'] });
    },
  });
};