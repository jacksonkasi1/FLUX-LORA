
import { Card } from '@/components/ui/card';
import { ModelConfig } from '@/components/training/ModelConfig';

interface TrainingReviewProps {
  modelConfig: ModelConfig;
  imageCount: number;
}

export const TrainingReview = ({ modelConfig, imageCount }: TrainingReviewProps) => {
  return (
    <Card className="p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">Review Your Model</h3>
      <div className="space-y-4">
        <div>
          <label className="font-medium">Model Name:</label>
          <p className="text-gray-600">{modelConfig.name}</p>
        </div>
        <div>
          <label className="font-medium">Trigger Word:</label>
          <p className="text-gray-600">{modelConfig.triggerWord}</p>
        </div>
        {modelConfig.description && (
          <div>
            <label className="font-medium">Description:</label>
            <p className="text-gray-600">{modelConfig.description}</p>
          </div>
        )}
        <div>
          <label className="font-medium">Training Images:</label>
          <p className="text-gray-600">{imageCount} images</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-800 text-sm">
            <strong>Training Cost:</strong> Approximately $2-4 USD<br />
            <strong>Training Time:</strong> 2-10 minutes<br />
            <strong>Note:</strong> Make sure your FAL.AI API key is configured in Settings.
          </p>
        </div>
      </div>
    </Card>
  );
};
