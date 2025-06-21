
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-[16px] font-semibold ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-foreground/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border-2 border-border bg-background hover:bg-muted hover:text-foreground focus-visible:ring-blue-500/20",
        secondary:
          "bg-muted text-foreground hover:bg-muted/80 focus-visible:ring-muted/20",
        ghost: "hover:bg-muted hover:text-foreground focus-visible:ring-muted/20",
        link: "text-foreground underline-offset-4 hover:underline focus-visible:ring-blue-500/20",
      },
      size: {
        default: "h-[52px] px-6 py-3",
        sm: "h-[44px] rounded-[10px] px-4 text-[14px]",
        lg: "h-[56px] rounded-[14px] px-8 text-[18px]",
        icon: "h-[52px] w-[52px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
