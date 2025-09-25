import type { ReactNode } from "react"

interface InfoCardProps {
  icon: ReactNode
  text: string
  className?: string
}

export function InfoCard({ icon, text, className = "" }: InfoCardProps) {
  return (
    <div className={`content-stretch flex gap-2 items-center relative size-full ${className}`}>
      <div className="relative shrink-0 size-4">
        {icon}
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#646464] text-[15px] tracking-[-0.026px]">
        <p className="leading-[18px] whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}
