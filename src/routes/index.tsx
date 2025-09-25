import { createFileRoute } from '@tanstack/react-router'
import { PillButtonExample } from '~/components/PillButtonExample';
import { LinkExample } from '~/components/LinkExample';
import { ProgressIndicator } from '~/components/ProgressIndicator';
import { FeatureListExample } from '~/components/FeatureListExample';
import { InputFieldExample } from '~/components/InputFieldExample';
import { SelectExample } from '~/components/SelectExample';
import { CustomizationFormExample } from '~/components/CustomizationFormExample';


export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="space-y-8">
          <PillButtonExample />
          <LinkExample />
          <ProgressIndicator
            currentStep={2}
            totalSteps={5}
          />
          <FeatureListExample />
          <InputFieldExample />
          <SelectExample />
          <CustomizationFormExample />
        </div>
    </div>
  )
}