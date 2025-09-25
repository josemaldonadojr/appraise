import type { ReactNode } from "react"
import { InfoCard } from "~/components/InfoCard"

interface FeatureItem {
  icon: ReactNode
  text: string
}

interface FeatureListProps {
  features: FeatureItem[]
  className?: string
}

export function FeatureList({ features, className = "" }: FeatureListProps) {
  return (
    <div className={`content-stretch flex flex-col gap-4 items-center relative size-full ${className}`}>
      {features.map((feature, index) => (
        <div key={index} className="content-stretch flex gap-2 items-center relative shrink-0 w-full">
          <InfoCard 
            icon={feature.icon}
            text={feature.text}
          />
        </div>
      ))}
    </div>
  )
}
