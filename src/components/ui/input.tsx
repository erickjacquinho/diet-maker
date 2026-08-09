import * as React from "react"

import { cn } from "@/lib/utils"
import { recipes } from "@/design-system"

export interface InputProps extends React.ComponentProps<"input"> {
  ref?: React.Ref<HTMLInputElement>;
}

const Input: React.FC<InputProps> = ({ className, type, ref, ...props }) => {
  return (
    <input
      type={type}
      className={cn(
        recipes.input({ size: "standard", state: "default" }),
        "file:border-0 file:bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}
Input.displayName = "Input"

export { Input }
