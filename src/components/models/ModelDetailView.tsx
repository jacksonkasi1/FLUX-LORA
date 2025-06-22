import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ImageIcon, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { TrainingImageModal } from "./TrainingImageModal";
import { cn } from "@/lib/utils";

// ** import api
import { apiClient } from '@/lib/api';

interface ModelDetailViewProps {
  modelId: string;
  onBack: () => void;
}

interface TrainingImage {
  id: string;
  image_url: string;
  original_filename: string;
  created_at: string;
}

interface ModelDetail {
  id: string;
  name: string;
  description?: string;
  status: string;
  trigger_word: string;
  image_count?: number;
  created_at: string;
}

export const ModelDetailView = ({ modelId, onBack }: ModelDetailViewProps) => {
  const { user } = useAuth();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<TrainingImage | null>(null);

  const { data: model, isLoading: modelLoading } = useQuery({
    queryKey: ['training-model', modelId],
    queryFn: async () => {
      const data = await apiClient.get('/training-models');      return data as ModelDetail;
    },
    enabled: !!modelId,
  });

  const { data: trainingImages, isLoading: imagesLoading } = useQuery({
    queryKey: ['model-training-images', modelId],
    queryFn: async () => {
      const data = await apiClient.get('/training-images');      return data as TrainingImage[];
    },
    enabled: !!modelId,
  });

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  };

  const truncateFilename = (filename: string, maxLength: number = 15) => {
    if (filename.length <= maxLength) return filename;
    return filename.substring(0, maxLength) + '...';
  };

  if (modelLoading) {
    return (
      <div className="container mx-auto px-apple-sm py-apple-sm space-y-apple-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 skeleton rounded-full"></div>
          <div className="h-8 skeleton rounded w-48"></div>
        </div>
        <div className="space-y-3">
          <div className="h-6 skeleton rounded w-32"></div>
          <div className="h-4 skeleton rounded w-64"></div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="container mx-auto px-apple-sm py-apple-sm">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-center text-muted-foreground">Model not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-apple-sm py-apple-sm space-y-apple-sm">
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="icon"
            className="w-10 h-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-large-title font-apple text-foreground">{model.name}</h2>
        </div>

        {/* Model info card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-apple-sm space-y-3">
          {model.description && (
            <p className="text-body font-apple text-muted-foreground leading-relaxed">
              {model.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-apple-sm text-caption font-apple text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">Trigger:</span>
              <code className="bg-secondary px-2 py-1 rounded font-mono text-primary">
                {model.trigger_word}
              </code>
            </div>
            
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" strokeWidth={2} />
              <span className="capitalize">{model.status}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" strokeWidth={2} />
              <span>{new Date(model.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {/* Training images section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-title-2 font-apple text-foreground">Training Images</h3>
            <span className="text-caption font-apple text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {trainingImages?.length || 0} image{trainingImages?.length !== 1 ? 's' : ''}
            </span>
          </div>

          {imagesLoading ? (
            <div className="masonry-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="masonry-item bg-white border border-gray-200 shadow-sm rounded-xl skeleton h-48 overflow-hidden" />
              ))}
            </div>
          ) : trainingImages && trainingImages.length > 0 ? (
            <div className="masonry-grid">
              {trainingImages.map((image, index) => {
                const isLoaded = loadedImages.has(image.id);
                
                return (
                  <div key={image.id} className="masonry-item">
                    <div 
                      className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden cursor-pointer transition-apple hover:shadow-apple-hover"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="relative">
                        {!isLoaded && (
                          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                        )}
                        
                        <img
                          src={image.image_url}
                          alt={image.original_filename}
                          className={cn(
                            "w-full h-auto object-cover transition-all duration-500 hover:scale-105",
                            isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                          )}
                          loading={index < 4 ? "eager" : "lazy"}
                          onLoad={() => handleImageLoad(image.id)}
                        />
                      </div>
                      
                      <div className="p-apple-sm">
                        <p 
                          className="text-caption font-apple text-muted-foreground truncate"
                          title={image.original_filename}
                        >
                          {truncateFilename(image.original_filename)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-apple-lg">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-body font-apple text-muted-foreground">No training images found</p>
            </div>
          )}
        </div>
      </div>

      {/* Training Image Modal */}
      {selectedImage && (
        <TrainingImageModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};
