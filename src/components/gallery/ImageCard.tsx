
import { Card } from "@/components/ui/card";

interface ImageCardProps {
  image: unknown; // TODO: Define proper type
}

export const ImageCard = ({ image }: ImageCardProps) => {
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {/* Placeholder for image */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <span className="text-4xl">🖼️</span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm text-gray-900 truncate">Sample Image</h4>
        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
      </div>
    </Card>
  );
};
