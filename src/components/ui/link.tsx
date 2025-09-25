import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "~/lib/utils"

const linkVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#202020] text-[#fcfcfc] hover:bg-[#2a2a2a]",
        outline: "bg-transparent text-[#202020] border border-[#bbbbbb] hover:bg-gray-50",
        ghost: "bg-transparent text-[#202020] hover:bg-gray-100",
      },
      size: {
        default: "px-4 py-1.5 text-[13px] leading-[19px]",
        sm: "px-3 py-1 text-xs",
        lg: "px-6 py-2 text-base",
      },
      shape: {
        default: "rounded-full",
        rounded: "rounded-md",
        square: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
)

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  children: React.ReactNode
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, shape, children, ...props }, ref) => {
    return (
      <a
        className={cn(linkVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      >
        <span className="font-medium tracking-[-0.026px]">{children}</span>
      </a>
    )
  }
)
Link.displayName = "Link"

export { Link, linkVariants }
