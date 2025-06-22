
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface TrainingImage {
  id: string;
  image_url: string;
  original_filename: string;
  created_at: string;
  training_model: {
    name: string;
    trigger_word: string;
  };
}

export const TrainingImagesView = () => {
  const { user } = useAuth();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const { data: trainingImages, isLoading } = useQuery({
    queryKey: ['training-images', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('training_images')
        .select(`
          id,
          image_url,
          original_filename,
          created_at,
          training_model:training_models(name, trigger_word)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });      return data as TrainingImage[];
    },
    enabled: !!user,
  });

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  };

  const truncateFilename = (filename: string, maxLength: number = 20) => {
    if (filename.length <= maxLength) return filename;
    return filename.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="masonry-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "masonry-item bg-white border border-gray-200 shadow-sm rounded-xl skeleton overflow-hidden",
              i % 3 === 0 ? "h-64" : i % 3 === 1 ? "h-48" : "h-56"
            )}
          />
        ))}
      </div>
    );
  }

  if (!trainingImages || trainingImages.length === 0) {
    return (
      <div className="text-center py-apple-xl">
        <div className="space-y-apple-sm">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-title-2 font-apple text-foreground">No Training Images</h3>
            <p className="text-body font-apple text-muted-foreground">
              Train your first model to see images here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      {trainingImages.map((image, index) => {
        const isLoaded = loadedImages.has(image.id);
        
        return (
          <div key={image.id} className="masonry-item">
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl group overflow-hidden">
              <div className="relative">
                {!isLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                
                <img
                  src={image.image_url}
                  alt={image.original_filename}
                  className={cn(
                    "w-full h-auto object-cover transition-all duration-500",
                    isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                  )}
                  loading={index < 4 ? "eager" : "lazy"}
                  onLoad={() => handleImageLoad(image.id)}
                />
              </div>
              
              <div className="p-apple-sm space-y-2">
                <p 
                  className="text-caption font-apple text-muted-foreground leading-tight"
                  title={image.original_filename}
                >
                  {truncateFilename(image.original_filename)}
                </p>
                
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ImageIcon className="w-3 h-3" />
                  <span className="text-caption font-apple">{image.training_model?.name}</span>
                </div>
                
                <p className="text-caption font-apple text-muted-foreground">
                  {new Date(image.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
