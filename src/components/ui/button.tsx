import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { recipes } from "@/design-system"

const buttonVariants = recipes.button;
type ButtonVariant = "primary" | "secondary" | "quiet" | "ghost" | "danger" | "default" | "destructive" | "outline" | "terracotta" | "emerald" | "link"
type ButtonSize = "compact" | "standard" | "default" | "sm" | "lg" | "icon"
type ButtonState = "default" | "disabled" | "loading"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  state?: ButtonState
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({ className, variant, size, loading = false, asChild = false, ref, disabled, ...props }) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, state: loading ? "loading" : disabled ? "disabled" : "default" }), className)}
      ref={ref}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    />
  )
}
Button.displayName = "Button"

export { Button, buttonVariants }
