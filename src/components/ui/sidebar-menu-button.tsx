"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-control p-2 text-left text-style-nav-item font-semibold text-sidebar-foreground outline-none transition-colors duration-fast ease-standard motion-reduce:transition-none motion-reduce:duration-0 [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar disabled:pointer-events-none disabled:opacity-disabled data-[active=true]:bg-sidebar-primary-soft data-[active=true]:text-sidebar-primary data-[active=true]:font-semibold",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "border border-sidebar-border hover:border-sidebar-ring hover:bg-sidebar-accent",
      },
      size: {
        default: "h-9",
        sm: "h-8 text-style-legal",
        lg: "h-12 text-style-body",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
)

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  isActive?: boolean
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ asChild = false, isActive = false, variant, size, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-active={isActive}
        data-size={size}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"
