
import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { GeneratedImage } from "@/hooks/useGeneratedImages";

interface ImageModalProps {
  image: GeneratedImage;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (imageId: string) => void;
}

export const ImageModal = ({ image, isOpen, onClose, onDelete }: ImageModalProps) => {
  const [showControls, setShowControls] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!isOpen) return null;

  const handleImageTap = () => {
    setShowControls(!showControls);
  };

  const handleDelete = () => {
    onDelete(image.id);
    setShowDeleteDialog(false);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <>
      {/* Full-screen modal overlay */}
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
            alt={image.prompt}
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
              <div className="flex items-end justify-between">
                <div className="space-y-2 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">{image.prompt}</h2>
                  {image.training_model && (
                    <p className="text-gray-200 text-sm">{image.training_model.name}</p>
                  )}
                  <p className="text-gray-300 text-sm">
                    {new Date(image.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  onClick={handleDeleteClick}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full p-3 ml-4"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-sm mx-4 rounded-xl border shadow-lg">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-lg font-bold">
              Delete Model?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="flex-row gap-3 justify-center">
            <AlertDialogCancel className="mt-0 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-xl px-6">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-xl px-6"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
