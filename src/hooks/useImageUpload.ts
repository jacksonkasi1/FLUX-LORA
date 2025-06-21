
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = (maxImages: number = 20) => {
  const [images, setImages] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const newImages = [...images, ...validFiles].slice(0, maxImages);
    setImages(newImages);

    if (newImages.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can upload up to ${maxImages} images`,
      });
    }

    return newImages;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Remove from selection if it was selected
    const newSelection = new Set(selectedImages);
    newSelection.delete(index);
    // Update indices for remaining selected images
    const updatedSelection = new Set<number>();
    newSelection.forEach(selectedIndex => {
      if (selectedIndex < index) {
        updatedSelection.add(selectedIndex);
      } else if (selectedIndex > index) {
        updatedSelection.add(selectedIndex - 1);
      }
    });
    setSelectedImages(updatedSelection);
    
    return newImages;
  };

  const toggleImageSelection = (index: number) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedImages(newSelection);
  };

  const selectAllImages = () => {
    const allIndices = new Set(images.map((_, index) => index));
    setSelectedImages(allIndices);
  };

  const deselectAllImages = () => {
    setSelectedImages(new Set());
  };

  const removeSelectedImages = () => {
    const newImages = images.filter((_, index) => !selectedImages.has(index));
    setImages(newImages);
    setSelectedImages(new Set());
    return newImages;
  };

  return {
    images,
    setImages,
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
  };
};
