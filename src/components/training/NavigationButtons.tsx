import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationButtonsProps {
  currentStep: number;
  canProceedToNext: boolean;
  isTraining: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const NavigationButtons = ({ 
  currentStep, 
  canProceedToNext, 
  isTraining, 
  onBack, 
  onNext 
}: NavigationButtonsProps) => {
  if (currentStep >= 4) return null;

  return (
    <div className="flex justify-between items-center gap-apple-sm">
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={currentStep === 1}
        className={cn(
          "btn-secondary touch-target focus-ring haptic-light font-apple",
          currentStep === 1 && "opacity-50 cursor-not-allowed"
        )}
      >
        <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
        Back
      </Button>
      
      <Button
        onClick={onNext}
        disabled={!canProceedToNext || isTraining}
        className={cn(
          "btn-primary touch-target focus-ring haptic-medium font-apple min-w-32",
          (!canProceedToNext || isTraining) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isTraining ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Training...
          </>
        ) : (
          <>
            {currentStep === 3 ? 'Start Training' : 'Continue'}
            {currentStep < 3 && <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />}
          </>
        )}
      </Button>
    </div>
  );
};
