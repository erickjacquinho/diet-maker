"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SidebarState = "expanded" | "collapsed"

export type SidebarContextValue = {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const SidebarContext = React.createContext<SidebarContextValue | null>(null)

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

export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
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

export function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider")
  return context
}
