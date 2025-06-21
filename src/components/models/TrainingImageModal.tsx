
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrainingImage {
  id: string;
  image_url: string;
  original_filename: string;
  created_at: string;
}

interface TrainingImageModalProps {
  image: TrainingImage;
  isOpen: boolean;
  onClose: () => void;
}

export const TrainingImageModal = ({ image, isOpen, onClose }: TrainingImageModalProps) => {
  const [showControls, setShowControls] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!isOpen) return null;

  const handleImageTap = () => {
    setShowControls(!showControls);
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Image container - full width and height, edge-to-edge */}
      <div 
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onClick={handleImageTap}
      >
        {/* Progressive blur placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
        
        <img
          src={image.image_url}
          alt={image.original_filename}
          className={cn(
            "max-w-[95%] max-h-[95%] object-contain transition-all duration-500 border border-gray-300 rounded-lg",
            imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Top-left close button - appears on tap */}
        <div className={cn(
          "absolute top-6 left-6 transition-all duration-300 ease-out",
          showControls 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCloseClick}
            className="text-white hover:bg-white/20 rounded-full w-12 h-12 backdrop-blur-sm bg-black/40"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Bottom overlay with gradient - appears on tap */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out",
          showControls 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-full pointer-events-none"
        )}>
          <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white p-6 pt-16">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white leading-tight">{image.original_filename}</h2>
              <p className="text-gray-300 text-sm">
                {new Date(image.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
