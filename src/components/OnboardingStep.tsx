import React from 'react';
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
    <div className={`bg-white content-stretch flex items-start relative rounded-[2px] size-full ${className}`}>
      {/* Left Panel */}
      <div className="box-border content-stretch flex flex-col h-full items-center justify-between p-[40px] relative shrink-0 w-[390px]">
        <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full">
          {showBackButton && (
            <div className="content-stretch flex items-center relative shrink-0 w-full">
              <BackLink onClick={handleBack} />
            </div>
          )}
          
          <div className="content-stretch flex flex-col gap-[16px] items-center leading-[0] not-italic relative shrink-0 tracking-[-0.026px] w-full">
            <div className="flex flex-col font-['Uxum_Grotesque:Medium',_sans-serif] justify-center relative shrink-0 text-[#202020] text-[32px] w-full">
              <p className="leading-[35.2px] whitespace-pre-wrap">{title}</p>
            </div>
            {subtitle && (
              <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[#646464] text-[15px] w-full">
                <p className="leading-[18px] whitespace-pre-wrap">{subtitle}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full">
          {showNextButton && (
            <Button 
              onClick={handleNext}
              className="bg-[#202020] hover:bg-[#202020]/90 text-[#fcfcfc] px-[16px] py-[6px] rounded-[9999px] w-full font-['Inter:Medium',_sans-serif] font-medium text-[13px] tracking-[-0.026px]"
            >
              {nextButtonText}
            </Button>
          )}
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>

      {/* Right Panel */}
      <div className={`box-border content-stretch flex flex-col h-full items-center justify-between p-[64px] relative shrink-0 w-[460px] ${currentStep === 3 ? 'bg-[#202020]' : 'bg-[#ebebeb]'}`}>
        <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
