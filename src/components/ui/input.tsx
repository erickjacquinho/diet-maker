import * as React from "react"

import { cn } from "@/lib/utils"
import { recipes } from "@/design-system"

export interface InputProps extends Omit<React.ComponentProps<"input">, "size"> {
  size?: "standard" | "compact" | number;
  visibleChars?: number;
  ref?: React.Ref<HTMLInputElement>;
}

const Input: React.FC<InputProps> = ({ className, type, size = "standard", visibleChars, ref, ...props }) => {
  const recipeSize = size === "compact" ? "compact" : "standard";
  const htmlSize = visibleChars ?? (typeof size === "number" ? size : undefined);

  return (
    <input
      type={type}
      size={htmlSize}
      className={cn(
        recipes.input({ size: recipeSize, state: "default" }),
        visibleChars && "w-auto",
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
