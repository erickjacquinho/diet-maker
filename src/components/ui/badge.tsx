import * as React from "react"
import { cn } from "@/lib/utils"
import { recipes } from "@/design-system"

const badgeVariants = recipes.badge

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "emerald"
  | "rose"
  | "amber"
  | "teal"
  | "blue"
  | "neutral"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "protein"
  | "carbohydrate"
  | "fat"
  | "kcal";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const toneMap: Record<BadgeVariant, "default" | "primary" | "info" | "success" | "warning" | "error" | "protein" | "carbohydrate" | "fat"> = {
    default: "default",
    secondary: "default",
    neutral: "default",
    outline: "default",
    primary: "primary",
    blue: "primary",
    success: "success",
    emerald: "success",
    error: "error",
    destructive: "error",
    rose: "error",
    warning: "warning",
    amber: "warning",
    info: "info",
    teal: "info",
    protein: "protein",
    carbohydrate: "carbohydrate",
    fat: "fat",
    kcal: "warning",
  };
  const tone = toneMap[variant] || "default";
  return (
    <div className={cn(badgeVariants({ tone }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
