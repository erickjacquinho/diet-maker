"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type SidebarState = "expanded" | "collapsed"

type SidebarContextValue = {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export type SidebarProviderProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  persist?: boolean
  storageKey?: string
  shortcutKey?: string
}

function readPersistedOpen(storageKey: string, fallback: boolean): boolean {
  if (typeof document === "undefined") return fallback

  const persisted = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${storageKey}=`))
    ?.split("=")[1]

  return persisted === undefined ? fallback : persisted !== "false"
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) return false
  return Boolean(target.closest("input, textarea, select, [contenteditable=\"true\"], [role=\"textbox\"]"))
}

const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange,
      persist = false,
      storageKey = "sidebar_state",
      shortcutKey,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [openState, setOpenState] = React.useState(() =>
      persist ? readPersistedOpen(storageKey, defaultOpen) : defaultOpen,
    )
    const open = openProp ?? openState
    const setOpen = React.useCallback(
      (nextOpen: boolean) => {
        if (openProp === undefined) setOpenState(nextOpen)
        onOpenChange?.(nextOpen)
        if (persist && typeof document !== "undefined") {
          document.cookie = `${storageKey}=${nextOpen}; path=/; max-age=31536000`
        }
      },
      [onOpenChange, openProp, persist, storageKey],
    )
    const toggleSidebar = React.useCallback(() => setOpen(!open), [open, setOpen])
    const state: SidebarState = open ? "expanded" : "collapsed"

    React.useEffect(() => {
      if (!shortcutKey) return

      const handleKeyDown = (event: KeyboardEvent) => {
        if (isEditableTarget(event.target)) return

        const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
        const hasModifier = isMac ? event.metaKey : event.ctrlKey
        if (!hasModifier || event.key.toLowerCase() !== shortcutKey.toLowerCase()) return

        event.preventDefault()
        toggleSidebar()
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [shortcutKey, toggleSidebar])

    return (
      <SidebarContext.Provider value={{ state, open, setOpen, toggleSidebar }}>
        <div
          ref={ref}
          data-sidebar="provider"
          data-state={state}
          className={cn(
            "flex min-h-screen [--sidebar-width:var(--cmp-sidebar-width-expanded)] [--sidebar-width-collapsed:var(--cmp-sidebar-width-collapsed)]",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  },
)
SidebarProvider.displayName = "SidebarProvider"

function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider")
  return context
}

export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "icon",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { state } = useSidebar()
    const effectiveState = collapsible === "none" ? "expanded" : state

    return (
      <aside
        ref={ref}
        data-sidebar="sidebar"
        data-state={effectiveState}
        data-collapsible={collapsible}
        data-side={side}
        data-variant={variant}
        className={cn(
          "group/sidebar flex min-h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-standard ease-standard motion-reduce:transition-none motion-reduce:duration-0",
          effectiveState === "collapsed" ? "w-sidebar-collapsed" : "w-sidebar",
          side === "right" && "border-l border-r-0",
          variant === "floating" && "rounded-control border",
          variant === "inset" && "border-r-0",
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    )
  },
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="header" className={cn("flex shrink-0 flex-col gap-2 p-3", className)} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto", className)}
      {...props}
    />
  ),
)
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-3", className)}
      {...props}
    />
  ),
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
  ),
)
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="group-label"
      className={cn("flex h-8 shrink-0 items-center rounded-control px-2 text-style-legal font-semibold text-sidebar-foreground outline-none", className)}
      {...props}
    />
  ),
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group-content" className={cn("w-full text-style-nav-item", className)} {...props} />
  ),
)
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
  ),
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
  ),
)
SidebarMenuItem.displayName = "SidebarMenuItem"

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

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
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

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
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

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-sidebar="menu-sub-item" className={cn("group/menu-sub-item relative", className)} {...props} />
  ),
)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const sidebarMenuSubButtonVariants = cva(
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

const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
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

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()
    return (
      <Button
        ref={ref}
        type="button"
        variant="quiet"
        size="standard"
        iconOnly
        aria-label="Alternar menu lateral"
        title="Alternar menu lateral"
        className={cn("shrink-0", className)}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) toggleSidebar()
        }}
        {...props}
      >
        <PanelLeft aria-hidden="true" />
      </Button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
