
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Upload, Camera } from 'lucide-react';

interface DropZoneProps {
  dragActive: boolean;
  maxImages: number;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DropZone = ({
  dragActive,
  maxImages,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onFileSelect,
}: DropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Card
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onClick={openFileDialog}
      >
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <Upload className="w-8 h-8 text-gray-400" />
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium">Drop images here or click to browse</p>
            <p className="text-sm text-gray-500">
              Upload up to {maxImages} images (JPG, PNG, max 10MB each)
            </p>
          </div>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
      />
    </>
  );
};
