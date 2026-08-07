"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn("mx-3 flex min-w-0 flex-col gap-1 border-l border-sidebar-border px-3 py-1", className)}
      {...props}
    />
  ),
)
SidebarMenuSub.displayName = "SidebarMenuSub"

export const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-sidebar="menu-sub-item" className={cn("group/menu-sub-item relative", className)} {...props} />
  ),
)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

export const sidebarMenuSubButtonVariants = cva(
  "flex h-control-standard min-w-0 items-center gap-2 overflow-hidden rounded-control px-2 text-style-legal text-sidebar-foreground outline-none transition-colors duration-fast ease-standard motion-reduce:transition-none motion-reduce:duration-0 [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar data-[active=true]:bg-sidebar-primary-soft data-[active=true]:text-sidebar-primary",
  {
    variants: {
      size: { sm: "text-style-legal", md: "text-style-nav-item" },
    },
    defaultVariants: { size: "sm" },
  },
)

export interface SidebarMenuSubButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof sidebarMenuSubButtonVariants> {
  asChild?: boolean
  isActive?: boolean
}

export const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
  ({ asChild = false, isActive = false, size, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"
    return (
      <Comp
        ref={ref}
        data-sidebar="menu-sub-button"
        data-active={isActive}
        data-size={size}
        className={cn(sidebarMenuSubButtonVariants({ size }), className)}
        {...props}
      />
    )
  },
)
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"
