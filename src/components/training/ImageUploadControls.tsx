
import { Button } from '@/components/ui/button';

interface ImageUploadControlsProps {
  imagesCount: number;
  selectedImagesCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRemoveSelected: () => void;
}

export const ImageUploadControls = ({
  imagesCount,
  selectedImagesCount,
  onSelectAll,
  onDeselectAll,
  onRemoveSelected,
}: ImageUploadControlsProps) => {
  if (imagesCount === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={onSelectAll}
        disabled={selectedImagesCount === imagesCount}
      >
        Select All
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDeselectAll}
        disabled={selectedImagesCount === 0}
      >
        Deselect All
      </Button>
      {selectedImagesCount > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemoveSelected}
        >
          Remove Selected ({selectedImagesCount})
        </Button>
      )}
    </div>
  );
};
