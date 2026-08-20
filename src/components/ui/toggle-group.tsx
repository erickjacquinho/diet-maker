import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  value?: string | number
  onValueChange?: (value: any) => void
}

const ToggleGroupContext = React.createContext<{
  value?: string | number
  onValueChange?: (value: any) => void
}>({})

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, type = "single", value, onValueChange, children, role, ...props }, ref) => {
    return (
      <ToggleGroupContext.Provider value={{ value, onValueChange }}>
        <div
          ref={ref}
          role={role ?? "group"}
          className={cn(
            "inline-flex items-center justify-center rounded-control bg-surface-subtle p-1 border border-border-subtle text-text-muted gap-1",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    )
  }
)
ToggleGroup.displayName = "ToggleGroup"

export interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string | number
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, children, value, onClick, role, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)
    const isSelected = context.value === value

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      context.onValueChange?.(value)
    }

    const isTab = role === "tab"

    return (
      <button
        ref={ref}
        type="button"
        role={role}
        aria-selected={isTab ? isSelected : undefined}
        aria-pressed={!isTab ? isSelected : undefined}
        data-state={isSelected ? (isTab ? "active" : "on") : (isTab ? "inactive" : "off")}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-control px-3 py-1.5 text-style-legal font-medium transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-disabled",
          isSelected
            ? "bg-surface text-text-primary shadow-subtle border border-border-subtle font-bold"
            : "text-text-muted hover:text-text-primary hover:bg-surface-hover/60 border border-transparent",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
