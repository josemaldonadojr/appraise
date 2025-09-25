import { createFileRoute } from '@tanstack/react-router'
import { OnboardingProvider } from '~/contexts/OnboardingContext';
import { CustomizationForm } from '~/components/CustomizationForm';


export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-600/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 space-y-8">
        {/* Onboarding Flow Example */}
        <div className="w-[850px] h-[600px] border border-slate-600/30 rounded-lg overflow-hidden shadow-2xl">
          <OnboardingProvider totalSteps={3}>
            <CustomizationForm />
          </OnboardingProvider>
        </div>
      </div>
    </div>
  )
}