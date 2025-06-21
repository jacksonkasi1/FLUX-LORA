
import { useEffect } from 'react';
import { DropZone } from './DropZone';
import { ImageGrid } from './ImageGrid';
import { ImageUploadControls } from './ImageUploadControls';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export const ImageUpload = ({ onImagesChange, maxImages = 20 }: ImageUploadProps) => {
  const {
    images,
    selectedImages,
    dragActive,
    setDragActive,
    handleDrop,
    handleFileSelect,
    removeImage,
    toggleImageSelection,
    selectAllImages,
    deselectAllImages,
    removeSelectedImages,
  } = useImageUpload(maxImages);

  // Notify parent when images change
  useEffect(() => {
    onImagesChange(images);
  }, [images, onImagesChange]);

  const handleRemoveImage = (index: number) => {
    const newImages = removeImage(index);
    onImagesChange(newImages);
  };

  const handleRemoveSelected = () => {
    const newImages = removeSelectedImages();
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Upload Training Images</h3>
        <span className="text-sm text-gray-500">{images.length}/{maxImages}</span>
      </div>

      <DropZone
        dragActive={dragActive}
        maxImages={maxImages}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onFileSelect={handleFileSelect}
      />

      <ImageUploadControls
        imagesCount={images.length}
        selectedImagesCount={selectedImages.size}
        onSelectAll={selectAllImages}
        onDeselectAll={deselectAllImages}
        onRemoveSelected={handleRemoveSelected}
      />

      <ImageGrid
        images={images}
        selectedImages={selectedImages}
        onToggleSelection={toggleImageSelection}
        onRemoveImage={handleRemoveImage}
      />
    </div>
  );
};
