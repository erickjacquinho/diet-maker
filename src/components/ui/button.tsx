import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { recipes } from "@/design-system"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-control font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: recipes.button({ variant: "primary" }),
        primary: recipes.button({ variant: "primary" }),
        secondary: recipes.button({ variant: "secondary" }),
        outline: recipes.button({ variant: "secondary" }),
        destructive: recipes.button({ variant: "destructive" }),
        "destructive-outline": recipes.button({ variant: "destructive-outline text-error border-error/20 bg-transparent hover:bg-error/10" }),
        ghost: recipes.button({ variant: "quiet" }),
        quiet: recipes.button({ variant: "quiet" }),
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: recipes.button({ size: "standard" }),
        standard: recipes.button({ size: "standard" }),
        sm: recipes.button({ size: "compact" }),
        compact: recipes.button({ size: "compact" }),
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
