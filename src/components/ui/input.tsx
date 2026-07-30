import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  ref?: React.Ref<HTMLInputElement>;
}

const Input: React.FC<InputProps> = ({ className, type, ref, ...props }) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9.5 w-full rounded-xl border border-warm-border bg-warm-inner px-3 py-2 text-xs text-warm-charcoal font-medium ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-warm-charcoal placeholder:text-warm-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-emerald focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}
Input.displayName = "Input"

export { Input }
