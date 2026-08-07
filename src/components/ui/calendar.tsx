"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CalendarDayButton } from "./calendar-day-button"

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
        "group/calendar w-fit bg-surface p-2 text-text-secondary",
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
        months: cn("relative flex flex-col gap-3", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
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
          "flex h-control-compact w-full items-center justify-center gap-2 text-style-button-label text-text-primary",
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
          "select-none text-text-primary",
          captionLayout === "label"
            ? "text-style-button-label"
            : "flex h-control-compact items-center gap-1 rounded-control px-2 text-style-button-label",
          defaultClassNames.caption_label,
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 select-none rounded-control text-style-caption font-semibold text-text-secondary",
          defaultClassNames.weekday,
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "h-control-compact w-control-compact select-none",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "h-control-compact w-control-compact select-none text-center text-style-caption text-text-muted",
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
          "rounded-control bg-surface-subtle text-text-secondary",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-text-muted aria-selected:text-text-muted",
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

export { Calendar, CalendarDayButton }
