import { PillButton } from "~/components/ui/pill-button"
import { Plus, ArrowRight, Star } from "lucide-react"

export function PillButtonExample() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold">Pill Button Examples</h2>
      
      <div className="flex flex-wrap gap-3">
        {/* Default variant with icon */}
        <PillButton icon={<Plus className="size-2" />}>
          Sell more
        </PillButton>
        
        {/* Outline variant */}
        <PillButton variant="outline" icon={<ArrowRight className="size-2" />}>
          Get started
        </PillButton>
        
        {/* Ghost variant */}
        <PillButton variant="ghost" icon={<Star className="size-2" />}>
          Add to favorites
        </PillButton>
        
        {/* Different sizes */}
        <PillButton size="sm" icon={<Plus className="size-1.5" />}>
          Small
        </PillButton>
        
        <PillButton size="lg" icon={<Plus className="size-3" />}>
          Large
        </PillButton>
        
        {/* Without icon */}
        <PillButton>
          Text only
        </PillButton>
      </div>
    </div>
  )
}
