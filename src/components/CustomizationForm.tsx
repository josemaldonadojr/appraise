import { OnboardingStep } from './OnboardingStep';
import { GoalsSelection } from './GoalsSelection';
import { CompanyInfoForm } from './CompanyInfoForm';
import { PremiumTrialStep } from './PremiumTrialStep';
import { useOnboardingOptional } from '~/contexts/OnboardingContext';

interface CustomizationFormProps {
  className?: string;
  currentStep?: number;
}

export function CustomizationForm({ className = "", currentStep: propCurrentStep }: CustomizationFormProps) {
  const context = useOnboardingOptional();
  const currentStep = context?.currentStep ?? propCurrentStep ?? 1;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CompanyInfoForm />;
      case 2:
        return <GoalsSelection />;
      case 3:
        return <PremiumTrialStep />;
      default:
        return <CompanyInfoForm />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Let's customize your appraisal workflow";
      case 2:
        return "What brings you to Appraise?";
      case 3:
        return "Your 14-days free trial on the Premium plan";
      default:
        return "Let's customize your appraisal workflow";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "We'd love to help you streamline your appraisal process";
      case 2:
        return "We'll personalize your appraisal ordering experience based on your business needs. You can always adjust these later.";
      case 3:
        return "Streamline your appraisal ordering process with advanced features designed for mortgage professionals.";
      default:
        return "We'd love to help you streamline your appraisal process";
    }
  };

  return (
    <OnboardingStep
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
      className={className}
      nextButtonText={currentStep === 3 ? "Start free trial" : "Next"}
      showNextButton={currentStep <= 3}
    >
      {renderStepContent()}
    </OnboardingStep>
  );
}
