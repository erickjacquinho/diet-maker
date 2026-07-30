import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold ring-offset-background transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-warm-charcoal text-white hover:bg-warm-charcoal/90 border border-warm-charcoal",
        destructive: "bg-rose-600 text-white hover:bg-rose-700 border border-rose-600",
        outline: "border border-warm-border bg-warm-card text-warm-charcoal hover:bg-warm-inner hover:border-warm-borderDark",
        secondary: "bg-warm-inner text-warm-charcoal border border-warm-border hover:bg-warm-card hover:border-warm-borderDark",
        terracotta: "bg-warm-terracotta text-white hover:bg-warm-terracotta/90 border border-warm-terracotta",
        emerald: "bg-warm-emerald text-white hover:bg-warm-emerald/90 border-none",
        ghost: "text-warm-secondary hover:text-warm-charcoal hover:bg-warm-inner",
        link: "text-warm-charcoal underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-[11px]",
        lg: "h-11 rounded-xl px-6 text-sm font-extrabold",
        icon: "h-9 w-9 p-0 rounded-xl",
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
  ref?: React.Ref<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({ className, variant, size, asChild = false, ref, ...props }) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}
Button.displayName = "Button"

export { Button, buttonVariants }
