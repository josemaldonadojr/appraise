import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackLink } from './BackLink';
import { ProgressIndicator } from './ProgressIndicator';
import { Button } from './ui/button';
import { useOnboardingOptional } from '~/contexts/OnboardingContext';

interface OnboardingStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextButtonText?: string;
  showBackButton?: boolean;
  showNextButton?: boolean;
  className?: string;
  currentStep?: number;
  totalSteps?: number;
}

export function OnboardingStep({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextButtonText = "Next",
  showBackButton = true,
  showNextButton = true,
  className = "",
  currentStep: propCurrentStep,
  totalSteps: propTotalSteps
}: OnboardingStepProps) {
  const context = useOnboardingOptional();
  
  // Use context if available, otherwise fallback to props
  const currentStep = context?.currentStep ?? propCurrentStep ?? 1;
  const totalSteps = context?.totalSteps ?? propTotalSteps ?? 5;
  const nextStep = context?.nextStep ?? (() => {});
  const prevStep = context?.prevStep ?? (() => {});

  const handleNext = () => {
    onNext?.();
    nextStep();
  };

  const handleBack = () => {
    onBack?.();
    prevStep();
  };

  return (
    <motion.div 
      className={`relative content-stretch flex items-start rounded-[2px] size-full overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_70%)]"></div>
        {/* Very subtle diagonal lines */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(0,0,0,0.01)_49%,rgba(0,0,0,0.01)_51%,transparent_52%)] bg-[size:40px_40px]"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 bg-white content-stretch flex items-start rounded-[2px] size-full">
        {/* Left Panel */}
        <motion.div 
          className="box-border content-stretch flex flex-col h-full items-center justify-between p-[40px] relative shrink-0 w-[390px]"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
        <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full">
          <AnimatePresence mode="wait">
            {showBackButton && currentStep > 1 && (
              <motion.div 
                className="content-stretch flex items-center relative shrink-0 w-full"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <BackLink onClick={handleBack} />
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div 
            className="content-stretch flex flex-col gap-[16px] items-center leading-[0] not-italic relative shrink-0 tracking-[-0.026px] w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.div 
              className="flex flex-col font-['Uxum_Grotesque:Medium',_sans-serif] justify-center relative shrink-0 text-[#202020] text-[32px] w-full"
              key={title} // This ensures title animates when it changes
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="leading-[35.2px] whitespace-pre-wrap">{title}</p>
            </motion.div>
            {subtitle && (
              <motion.div 
                className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[#646464] text-[15px] w-full"
                key={subtitle} // This ensures subtitle animates when it changes
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <p className="leading-[18px] whitespace-pre-wrap">{subtitle}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
        
        <motion.div 
          className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {showNextButton && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button 
                onClick={handleNext}
                className="bg-[#202020] hover:bg-[#202020]/90 text-[#fcfcfc] px-[16px] py-[6px] rounded-[9999px] w-full font-['Inter:Medium',_sans-serif] font-medium text-[13px] tracking-[-0.026px]"
              >
                {nextButtonText}
              </Button>
            </motion.div>
          )}
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </motion.div>
      </motion.div>

        {/* Right Panel */}
        <motion.div 
          className={`box-border content-stretch flex flex-col h-full items-center justify-between p-[64px] relative shrink-0 w-[460px] ${currentStep === 3 ? 'bg-[#202020]' : 'bg-[#ebebeb]'}`}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.div 
            className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full"
            key={currentStep} // This ensures content animates when step changes
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
