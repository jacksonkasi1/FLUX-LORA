import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

export interface GeneratedImage {
  id: string;
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  isFavorite: boolean;
  generationConfig: any;
  createdAt: string;
  training_model?: {
    id: string;
    name: string;
    trigger_word: string;
  };
}

export const useGeneratedImages = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['generated-images', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const data = await apiClient.getGeneratedImages();
      return data as GeneratedImage[];
    },
    enabled: !!user,
  });
};
