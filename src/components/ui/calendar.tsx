"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "quiet",
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar w-fit bg-surface p-3 text-secondary",
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("pt-BR", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "compact", iconOnly: true }),
          "h-control-compact w-control-compact select-none p-0 aria-disabled:opacity-disabled",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "compact", iconOnly: true }),
          "h-control-compact w-control-compact select-none p-0 aria-disabled:opacity-disabled",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-control-compact w-full items-center justify-center px-control-compact",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-control-compact w-full items-center justify-center gap-2 text-style-button-label font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-control border border-control shadow-sm has-focus:border-primary-focus has-focus:ring-2 has-focus:ring-primary-focus/30",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 bg-surface opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-style-button-label"
            : "flex h-control-compact items-center gap-1 rounded-control px-2 text-style-button-label",
          defaultClassNames.caption_label,
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 select-none rounded-control text-style-legal font-medium text-muted",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "h-control-compact w-control-compact select-none",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "h-control-compact w-control-compact select-none text-center text-style-legal text-muted",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative h-control-compact w-control-compact select-none p-0 text-center",
          defaultClassNames.day,
        ),
        range_start: cn(
          "bg-primary-soft",
          defaultClassNames.range_start,
        ),
        range_middle: cn("bg-primary-soft", defaultClassNames.range_middle),
        range_end: cn("bg-primary-soft", defaultClassNames.range_end),
        today: cn(
          "rounded-control bg-surface-subtle text-secondary data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted aria-selected:text-muted",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "text-disabled opacity-disabled",
          defaultClassNames.disabled,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: rootClassName, rootRef, ...rootProps }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(rootClassName)}
            {...rootProps}
          />
        ),
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", chevronClassName)} {...chevronProps} />
          }

          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", chevronClassName)} {...chevronProps} />
          }

          return <ChevronDownIcon className={cn("size-4", chevronClassName)} {...chevronProps} />
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...weekNumberProps }) => (
          <td {...weekNumberProps}>
            <div className="flex h-control-compact w-control-compact items-center justify-center text-center">
              {children}
            </div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
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
        "h-control-compact w-control-compact font-regular leading-none data-[selected-single=true]:bg-primary data-[selected-single=true]:text-on-primary data-[range-middle=true]:bg-primary-soft data-[range-middle=true]:text-primary data-[range-start=true]:rounded-control data-[range-start=true]:bg-primary data-[range-start=true]:text-on-primary data-[range-end=true]:rounded-control data-[range-end=true]:bg-primary data-[range-end=true]:text-on-primary group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-raised group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-primary-focus",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
