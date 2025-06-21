import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { ImageUpload } from '@/components/training/ImageUpload';
import { ModelConfig } from '@/components/training/ModelConfig';
import { TrainingProgress } from '@/components/training/TrainingProgress';
import { StepIndicator } from '@/components/training/StepIndicator';
import { TrainingReview } from '@/components/training/TrainingReview';
import { NavigationButtons } from '@/components/training/NavigationButtons';
import { useTrainingFlow } from '@/hooks/useTrainingFlow';
import { cn } from '@/lib/utils';

export const TrainPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    currentStep,
    images,
    setImages,
    modelConfig,
    setModelConfig,
    isTraining,
    currentModelId,
    canProceedToNext,
    handleNext,
    handleBack,
  } = useTrainingFlow();

  const steps = [
    { number: 1, title: 'Upload Images', description: 'Add 2-20 training images' },
    { number: 2, title: 'Configure Model', description: 'Set name and trigger word' },
    { number: 3, title: 'Review & Train', description: 'Confirm and start training' },
    { number: 4, title: 'Training Progress', description: 'Monitor training status' },
  ];

  const handleTrainingComplete = () => {
    toast({
      title: "Training Complete!",
      description: "Your model is ready for image generation.",
    });
    navigate('/');
  };

  return (
    <div className="app-container">
      {/* Apple-style Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-apple border-b border-border safe-area-top">
        <div className="container mx-auto px-apple-sm py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="shrink-0 touch-target focus-ring haptic-light"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </Button>
            <div className="flex-1">
              <h1 className="text-title-2 font-apple text-foreground">Train LoRA</h1>
              <p className="text-caption font-apple text-muted-foreground">
                Create a custom FLUX model
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-apple-sm py-apple-sm space-y-apple-lg">
          {/* Step Indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} />

          {/* Step Content */}
          <div className="min-h-96">
            {currentStep === 1 && (
              <div className="space-y-apple-sm animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-title-1 font-apple text-foreground">Upload Training Images</h2>
                  <p className="text-body font-apple text-muted-foreground max-w-md mx-auto">
                    Select 2-20 high-quality images that represent what you want to train
                  </p>
                </div>
                <ImageUpload onImagesChange={setImages} maxImages={20} />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-apple-sm animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-title-1 font-apple text-foreground">Configure Your Model</h2>
                  <p className="text-body font-apple text-muted-foreground max-w-md mx-auto">
                    Give your model a name and set a trigger word for generation
                  </p>
                </div>
                <ModelConfig onConfigChange={setModelConfig} />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-apple-sm animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-title-1 font-apple text-foreground">Review & Start Training</h2>
                  <p className="text-body font-apple text-muted-foreground max-w-md mx-auto">
                    Review your settings and start the training process
                  </p>
                </div>
                <TrainingReview modelConfig={modelConfig} imageCount={images.length} />
              </div>
            )}

            {currentStep === 4 && currentModelId && (
              <div className="space-y-apple-sm animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-title-1 font-apple text-foreground">Training in Progress</h2>
                  <p className="text-body font-apple text-muted-foreground max-w-md mx-auto">
                    Your model is being trained. This may take several minutes.
                  </p>
                </div>
                <TrainingProgress
                  modelId={currentModelId}
                  onComplete={handleTrainingComplete}
                  onError={(error) => {
                    toast({
                      title: "Training Error",
                      description: error,
                      variant: "destructive",
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-apple border-t border-border safe-area-bottom">
        <div className="container mx-auto px-apple-sm py-apple-sm">
          <NavigationButtons
            currentStep={currentStep}
            canProceedToNext={canProceedToNext()}
            isTraining={isTraining}
            onBack={handleBack}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
};
