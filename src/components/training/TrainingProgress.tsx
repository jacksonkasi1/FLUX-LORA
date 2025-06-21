
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TrainingProgressProps {
  modelId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

type TrainingStatus = 'pending' | 'training' | 'completed' | 'failed';

export const TrainingProgress = ({ modelId, onComplete, onError }: TrainingProgressProps) => {
  const [status, setStatus] = useState<TrainingStatus>('pending');
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  useEffect(() => {
    // Fetch initial status
    fetchModelStatus();

    // Subscribe to model status changes
    const subscription = supabase
      .channel(`training-${modelId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'training_models',
        filter: `id=eq.${modelId}`
      }, (payload) => {
        const newStatus = payload.new.status as TrainingStatus;
        console.log('Training status update:', newStatus);
        setStatus(newStatus);
        
        if (newStatus === 'training') {
          setProgress(25);
          setEstimatedTime(300); // 5 minutes estimate
        } else if (newStatus === 'completed') {
          setProgress(100);
          setEstimatedTime(null);
          onComplete?.();
        } else if (newStatus === 'failed') {
          onError?.('Training failed. Please check your API key and try again.');
        }
      })
      .subscribe();

    // Progress simulation for training phase
    let progressInterval: NodeJS.Timeout;
    if (status === 'training') {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + Math.random() * 5;
          }
          return prev;
        });
      }, 10000);
    }

    return () => {
      subscription.unsubscribe();
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [modelId, onComplete, onError, status]);

  const fetchModelStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('training_models')
        .select('status')
        .eq('id', modelId)
        .single();

      if (error) {
        console.error('Error fetching model status:', error);
        return;
      }

      setStatus(data.status as TrainingStatus);
      if (data.status === 'training') {
        setProgress(25);
        setEstimatedTime(300);
      } else if (data.status === 'completed') {
        setProgress(100);
      }
    } catch (error) {
      console.error('Error fetching model status:', error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'training':
        return <Zap className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Preparing training...';
      case 'training':
        return 'Training in progress...';
      case 'completed':
        return 'Training completed successfully!';
      case 'failed':
        return 'Training failed';
    }
  };

  const getEstimatedTimeText = () => {
    if (!estimatedTime) return '';
    const minutes = Math.ceil(estimatedTime / 60);
    return `Estimated time: ${minutes} minutes`;
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div>
          <h3 className="text-lg font-semibold">{getStatusText()}</h3>
          {estimatedTime && status === 'training' && (
            <p className="text-sm text-gray-500">{getEstimatedTimeText()}</p>
          )}
        </div>
      </div>

      {(status === 'training' || status === 'pending') && (
        <>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-gray-500">
            {Math.round(progress)}% complete
          </p>
        </>
      )}

      {status === 'completed' && (
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              Your FLUX LoRA model is ready! You can now use it to generate images with your custom trigger word.
            </p>
          </div>
          <Button onClick={onComplete} className="w-full">
            Start Generating Images
          </Button>
        </div>
      )}

      {status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 mb-3">
            Training failed. This could be due to:
          </p>
          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
            <li>Invalid or missing FAL.AI API key</li>
            <li>Insufficient image quality or variety</li>
            <li>Network connectivity issues</li>
            <li>FAL.AI service temporarily unavailable</li>
          </ul>
          <p className="text-sm text-red-600 mt-3">
            Please check your API key in Settings and try again.
          </p>
        </div>
      )}

      {status === 'training' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Training in progress...</strong><br />
            Your model is being trained with FLUX LoRA technology. This process typically takes 2-10 minutes depending on the number of images and current system load.
          </p>
        </div>
      )}
    </Card>
  );
};
