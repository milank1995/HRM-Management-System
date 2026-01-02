import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface SimpleMultiSelectProps {
  options: Option[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function SimpleMultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Select items...",
  className,
}: SimpleMultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((item) => item !== value))
    } else {
      onSelectionChange([...selected, value])
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm",
            className
          )}
        >
          <span className={cn(
            "truncate flex-1 text-left",
            selected.length > 0 ? "text-foreground" : "text-muted-foreground"
          )}>
            {selected.length > 0 
              ? selected.map(value => options.find(opt => opt.value === value)?.label).join(", ")
              : placeholder
            }
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </Popover.Trigger>
      <Popover.Content className="w-[var(--radix-popover-trigger-width)] p-0 z-50 bg-white border border-border rounded-lg shadow-lg" align="start">
        <div className="max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "flex items-center px-3 py-2 cursor-pointer",
                selected.includes(option.value) ? "bg-blue-500 text-white" : ""
              )}
              onClick={() => handleSelect(option.value)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selected.includes(option.value) ? "opacity-100" : "opacity-0"
                )}
              />
              {option.label}
            </div>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}