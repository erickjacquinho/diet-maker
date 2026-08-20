import * as React from "react"

import { cn } from "@/lib/utils"
import { recipes } from "@/design-system"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  state?: "default" | "error" | "read-only" | "disabled";
}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, state = "default", ...props }, ref) => {
  return (
    <textarea
      className={cn(
        recipes.textarea({ state }),
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

