import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="space-y-apple-sm">
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between px-apple-sm">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-apple font-apple",
                currentStep >= step.number
                  ? 'bg-primary border-primary text-primary-foreground shadow-apple'
                  : 'border-border text-muted-foreground bg-background'
              )}
            >
              {currentStep > step.number ? (
                <Check className="w-4 h-4" strokeWidth={2.5} />
              ) : (
                <span className="text-caption font-semibold">{step.number}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12 mx-3 rounded-full transition-apple",
                  currentStep > step.number ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Info */}
      <div className="text-center space-y-1">
        <h2 className="text-title-2 font-apple text-foreground">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-body font-apple text-muted-foreground">
          {steps[currentStep - 1].description}
        </p>
      </div>
    </div>
  );
};
