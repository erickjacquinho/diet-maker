import * as React from "react"
import { cn } from "@/lib/utils"
import { recipes } from "@/design-system"

const badgeVariants = recipes.badge

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "emerald" | "rose" | "amber" | "teal" | "blue" | "neutral"
export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }

function Badge({ className, variant, ...props }: BadgeProps) {
  const tone = variant === "emerald" ? "success" : variant === "rose" ? "error" : variant === "amber" ? "warning" : variant === "teal" ? "info" : variant === "blue" ? "primary" : variant === "destructive" ? "error" : variant === "secondary" || variant === "outline" || variant === "neutral" ? "default" : variant;
  return (
    <div className={cn(badgeVariants({ tone }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
