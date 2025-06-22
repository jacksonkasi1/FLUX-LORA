/**
 * Hook for managing generated images
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ** Import contexts
import { useAuth } from '@/contexts/AuthContext';

// ** Import API client
import { apiClient } from '@/lib/api';

// ** Import types
import type { GeneratedImage } from '@/types';

/**
 * Hook to fetch generated images
 */
export const useGeneratedImages = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['generated-images', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await apiClient.get<GeneratedImage[]>('/generated-images');
    },
    enabled: !!user,
  });
};

/**
 * Hook to create a generated image record
 */
export const useCreateGeneratedImage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (imageData: Partial<GeneratedImage>) => {
      return await apiClient.post<GeneratedImage>('/generated-images', imageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-images', user?.id] });
    },
  });
};

/**
 * Hook to delete a generated image
 */
export const useDeleteGeneratedImage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (imageId: string) => {
      await apiClient.delete(`/generated-images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-images', user?.id] });
    },
  });
};
