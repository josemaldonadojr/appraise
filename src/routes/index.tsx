import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '~/components/SignIn'
import { CustomizationCard } from '~/components/CustomizationCard'
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from "convex/react";
import AppSelect from '~/components/AppSelect'

export const Route = createFileRoute('/')({
  component: Home,
})

const fontOptions = [
  { label: "Sans-serif", value: "sans" },
  { label: "Serif", value: "serif" },
  { label: "Monospace", value: "mono" },
  { label: "Cursive", value: "cursive" },
]

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Authenticated>
        <CustomizationCard />
        <AppSelect options={fontOptions} placeholder="Choose a font" />
      </Authenticated>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <AuthLoading>
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </AuthLoading>
    </div>
  )
}