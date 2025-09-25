import { InfoCard } from "~/components/InfoCard"
import { Users } from "lucide-react"

export function InfoCardExample() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold">Info Card Example</h2>
      
      <div className="max-w-md">
        <InfoCard 
          icon={<Users className="size-4 text-[#646464]" />}
          text="folk will import and auto-sync your contacts, emails, and calendar"
        />
      </div>
      
      {/* Additional examples with different icons and text */}
      <div className="max-w-md">
        <InfoCard 
          icon={<Users className="size-4 text-[#646464]" />}
          text="This is another example of the info card component with different content"
        />
      </div>
    </div>
  )
}
