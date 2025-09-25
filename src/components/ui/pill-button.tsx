import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "~/lib/utils"

const pillButtonVariants = cva(
  "inline-flex items-center gap-2 whitespace-nowrap rounded-full transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-white text-[#202020] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)] hover:shadow-[0px_2px_2px_0px_rgba(0,0,0,0.08)]",
        outline: "bg-transparent text-[#202020] border border-[#bbbbbb] hover:bg-gray-50",
        ghost: "bg-transparent text-[#202020] hover:bg-gray-100",
      },
      size: {
        default: "px-4 py-2 text-sm",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const pillButtonIconVariants = cva(
  "rounded-full shrink-0",
  {
    variants: {
      size: {
        default: "size-4",
        sm: "size-3",
        lg: "size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pillButtonVariants> {
  icon?: React.ReactNode
  children: React.ReactNode
}

const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <button
        className={cn(pillButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && (
          <div className={cn(pillButtonIconVariants({ size }))}>
            <div className="relative size-full rounded-full bg-white border border-[#bbbbbb] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)]">
              <div className="absolute inset-0 flex items-center justify-center">
                {icon}
              </div>
            </div>
          </div>
        )}
        <span className="font-normal leading-[19px]">{children}</span>
      </button>
    )
  }
)
PillButton.displayName = "PillButton"

export { PillButton, pillButtonVariants }
