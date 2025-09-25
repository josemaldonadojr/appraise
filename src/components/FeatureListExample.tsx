import { FeatureList } from "~/components/FeatureList"
import { Users, Shield, CheckCircle, Mail } from "lucide-react"

export function FeatureListExample() {
  const features = [
    {
      icon: <Users className="size-4 text-[#646464]" />,
      text: "folk will import and auto-sync your contacts, emails, and calendar"
    },
    {
      icon: <Shield className="size-4 text-[#646464]" />,
      text: "GDPR compliant"
    },
    {
      icon: <CheckCircle className="size-4 text-[#646464]" />,
      text: "Google security audit"
    },
    {
      icon: <Mail className="size-4 text-[#646464]" />,
      text: "folk will never delete or email contacts on your behalf"
    }
  ]

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold">Feature List Example</h2>
      
      <div className="max-w-md">
        <FeatureList features={features} />
      </div>
    </div>
  )
}
