import { CustomizationForm } from './CustomizationForm';
import { OnboardingProvider } from '~/contexts/OnboardingContext';

export function CustomizationFormExample() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[850px]">
        <OnboardingProvider totalSteps={5}>
          <CustomizationForm />
        </OnboardingProvider>
      </div>
    </div>
  );
}
