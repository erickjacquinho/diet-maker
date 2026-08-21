"use client"

import * as React from "react"
import { DayButton, getDefaultClassNames } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus()
    }
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="quiet"
      size="compact"
      iconOnly
      data-day={day.date.toLocaleDateString("pt-BR")}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "h-control-compact w-control-compact text-style-caption font-regular leading-none text-text-primary data-[selected-single=true]:rounded-control data-[selected-single=true]:border-primary-focus data-[selected-single=true]:bg-primary data-[selected-single=true]:text-on-primary data-[range-middle=true]:bg-primary-soft data-[range-middle=true]:text-primary data-[range-start=true]:rounded-control data-[range-start=true]:bg-primary data-[range-start=true]:text-on-primary data-[range-end=true]:rounded-control data-[range-end=true]:bg-primary data-[range-end=true]:text-on-primary group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-raised group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-primary-focus",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}
