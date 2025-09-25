interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  className = "" 
}: ProgressIndicatorProps) {
  return (
    <div className={`flex gap-2 items-center ${className}`}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        
        return (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              isActive 
                ? 'bg-[#202020]' 
                : 'bg-[#bbbbbb]'
            }`}
          />
        );
      })}
    </div>
  );
}
