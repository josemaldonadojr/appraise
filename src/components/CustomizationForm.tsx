import { OnboardingStep } from './OnboardingStep';
import { GoalsSelection } from './GoalsSelection';
import { CompanyInfoForm } from './CompanyInfoForm';
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
        return <GoalsSelection />;
      case 2:
        return <CompanyInfoForm />;
      default:
        return <GoalsSelection />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "What brings you to Appraise?";
      case 2:
        return "Let's customize your appraisal workflow";
      default:
        return "What brings you to Appraise?";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "We'll personalize your appraisal ordering experience based on your business needs. You can always adjust these later.";
      case 2:
        return "We'd love to help you streamline your appraisal process";
      default:
        return "We'll personalize your appraisal ordering experience based on your business needs. You can always adjust these later.";
    }
  };

  return (
    <OnboardingStep
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
      className={className}
    >
      {renderStepContent()}
    </OnboardingStep>
  );
}
