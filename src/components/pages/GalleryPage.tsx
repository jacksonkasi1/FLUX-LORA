
import { useState } from "react";
import { Heart, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/gallery/EmptyState";
import { ImageModal } from "@/components/gallery/ImageModal";
import { useGeneratedImages } from "@/hooks/useGeneratedImages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const { data: generatedImages, isLoading } = useGeneratedImages();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async ({ imageId, isFavorite }: { imageId: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('generated_images')
        .update({ is_favorite: isFavorite })
        .eq('id', imageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-images'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorite status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-images'] });
      toast({
        title: "Success",
        description: "Image deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = (imageId: string, currentFavorite: boolean) => {
    favoriteMutation.mutate({ imageId, isFavorite: !currentFavorite });
  };

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  };

  const handleDelete = (imageId: string) => {
    deleteMutation.mutate(imageId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-apple-sm py-apple-sm">
        <div className="masonry-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "masonry-item bg-white border border-gray-200 shadow-sm rounded-lg skeleton",
                i % 3 === 0 ? "h-64" : i % 3 === 1 ? "h-48" : "h-56"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!generatedImages || generatedImages.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="container mx-auto px-apple-sm py-apple-sm space-y-apple-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-large-title text-foreground font-apple">Gallery</h2>
        </div>

        {/* Generated Images - Pinterest Masonry Layout */}
        <div className="masonry-grid">
          {generatedImages.map((image, index) => {
            const isLoaded = loadedImages.has(image.id);
            
            return (
              <div key={image.id} className="masonry-item">
                <div 
                  className="bg-white border border-gray-200 shadow-sm rounded-lg group cursor-pointer transition-apple hover:shadow-apple-hover overflow-hidden"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative">
                    {/* Progressive blur placeholder */}
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-lg" />
                    )}
                    
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className={cn(
                        "w-full h-auto object-cover transition-all duration-500 group-hover:scale-105 rounded-t-lg",
                        isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                      )}
                      loading={index < 4 ? "eager" : "lazy"}
                      onLoad={() => handleImageLoad(image.id)}
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "absolute top-2 right-2 p-2 h-auto w-auto rounded-full backdrop-blur-apple transition-apple-quick haptic-light",
                        "bg-background/80 hover:bg-background/90",
                        image.is_favorite ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(image.id, image.is_favorite);
                      }}
                    >
                      <Heart 
                        className={cn(
                          "w-4 h-4 transition-apple-quick",
                          image.is_favorite && 'fill-current'
                        )} 
                      />
                    </Button>
                  </div>
                  
                  <div className="p-apple-sm space-y-2">
                    <p className="text-body font-apple text-foreground line-clamp-2 leading-tight">
                      {image.prompt}
                    </p>
                    
                    {image.training_model && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ImageIcon className="w-3 h-3" />
                        <span className="text-caption font-apple">{image.training_model.name}</span>
                      </div>
                    )}
                    
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
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};
