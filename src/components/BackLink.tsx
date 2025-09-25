import * as React from "react"
import { cn } from "~/lib/utils"

export interface BackLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode
}

const BackLink = React.forwardRef<HTMLAnchorElement, BackLinkProps>(
  ({ className, children = "Back", ...props }, ref) => {
    return (
      <a
        className={cn(
          "inline-flex items-center gap-2 text-[#646464] text-[13px] leading-[18px] tracking-[-0.026px] hover:text-[#202020] transition-colors",
          className
        )}
        ref={ref}
        {...props}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <path
            d="M6.66669 12L2.66669 8L6.66669 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.3334 8H2.66669"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="whitespace-nowrap">{children}</span>
      </a>
    )
  }
)
BackLink.displayName = "BackLink"

export { BackLink }
