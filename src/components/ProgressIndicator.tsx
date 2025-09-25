import { motion } from 'motion/react';

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
        const isCompleted = stepNumber < currentStep;
        
        return (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${
              isActive 
                ? 'bg-[#202020]' 
                : isCompleted
                ? 'bg-[#202020]'
                : 'bg-[#bbbbbb]'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: isActive ? 1.2 : 1,
              opacity: 1
            }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.1,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ scale: 1.1 }}
          />
        );
      })}
    </div>
  );
}
