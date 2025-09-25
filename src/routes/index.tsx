import { createFileRoute } from '@tanstack/react-router'
import { PillButtonExample } from '~/components/PillButtonExample';
import { LinkExample } from '~/components/LinkExample';
import { ProgressIndicator } from '~/components/ProgressIndicator';
import { FeatureListExample } from '~/components/FeatureListExample';
import { InputFieldExample } from '~/components/InputFieldExample';
import { SelectExample } from '~/components/SelectExample';
import { CustomizationFormExample } from '~/components/CustomizationFormExample';
import { OnboardingProvider } from '~/contexts/OnboardingContext';
import { CustomizationForm } from '~/components/CustomizationForm';


export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="space-y-8">
          {/* Onboarding Flow Example */}
          <div className="w-[850px] h-[600px] border border-gray-200 rounded-lg overflow-hidden">
            <OnboardingProvider totalSteps={5}>
              <CustomizationForm />
            </OnboardingProvider>
          </div>
        </div>
    </div>
  )
}