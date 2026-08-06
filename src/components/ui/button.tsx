import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { recipes } from "@/design-system"

const buttonVariants = recipes.button;
type ButtonVariant = "primary" | "secondary" | "quiet" | "destructive" | "destructive-outline"
type ButtonSize = "compact" | "standard"
type ButtonState = "default" | "disabled" | "loading"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  iconOnly?: boolean
  state?: ButtonState
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({ className, variant, size, iconOnly = false, state, loading = false, asChild = false, ref, disabled, children, ...props }) => {
  const Comp = asChild ? Slot : "button"
  const resolvedState = state ?? (loading ? "loading" : disabled ? "disabled" : "default")
  const isLoading = resolvedState === "loading"
  const isDisabled = disabled || isLoading || resolvedState === "disabled"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, iconOnly, state: resolvedState }), className)}
      ref={ref}
      aria-busy={isLoading || undefined}
      disabled={isDisabled}
      {...props}
    >
      {asChild ? (
        children
      ) : isLoading ? (
        <>
          <Spinner aria-hidden="true" className="size-4 shrink-0 motion-reduce:animate-none" />
          <span className="sr-only">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}
Button.displayName = "Button"

export { Button, buttonVariants }
