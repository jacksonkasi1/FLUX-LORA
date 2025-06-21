
import { Check, X } from 'lucide-react';

interface ImageGridProps {
  images: File[];
  selectedImages: Set<number>;
  onToggleSelection: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

export const ImageGrid = ({
  images,
  selectedImages,
  onToggleSelection,
  onRemoveImage,
}: ImageGridProps) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <div
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
              selectedImages.has(index) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => onToggleSelection(index)}
          >
            <img
              src={URL.createObjectURL(image)}
              alt={`Upload ${index + 1}`}
              className="w-full h-24 object-cover"
            />
            {selectedImages.has(index) && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveImage(index);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
            {Math.round(image.size / 1024)}KB
          </div>
        </div>
      ))}
    </div>
  );
};
