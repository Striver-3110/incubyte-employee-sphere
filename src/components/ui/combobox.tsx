import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  options: { value: string; label: string }[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  loading?: boolean
  error?: string
  className?: string
  allowCustom?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  disabled = false,
  loading = false,
  error,
  className,
  allowCustom = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  // Find the current option
  const currentOption = options.find((option) => option.value === value)
  
  // Check if current value is custom (not in options)
  const isCustomValue = value && !currentOption

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setSearchValue("")
    setOpen(false)
  }

  const handleInputChange = (inputValue: string) => {
    setSearchValue(inputValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      // If there's an exact match, select it
      const exactMatch = options.find(opt => 
        opt.label.toLowerCase() === searchValue.toLowerCase()
      )
      
      if (exactMatch) {
        handleSelect(exactMatch.value)
      } else if (allowCustom) {
        // Allow custom input
        onValueChange(searchValue.trim())
        setSearchValue("")
        setOpen(false)
      }
    }
  }

  const handleCustomInput = () => {
    if (searchValue.trim() && allowCustom) {
      onValueChange(searchValue.trim())
      setSearchValue("")
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-borderSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1 text-brandBlueDarker",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          disabled={disabled}
        >
          {loading ? (
            "Loading..."
          ) : error ? (
            "Error loading options"
          ) : currentOption ? (
            currentOption.label
          ) : isCustomValue ? (
            <span className="flex items-center">
              <Plus className="w-3 h-3 mr-1 text-green-600" />
              {value}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="h-9"
            autoFocus
          />
          <CommandList>
            <CommandEmpty>
              {allowCustom && searchValue.trim() ? (
                <div className="flex items-center justify-between p-2">
                  <span>No matching options found</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCustomInput}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Use "{searchValue.trim()}"
                  </Button>
                </div>
              ) : (
                emptyMessage
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {allowCustom && searchValue.trim() && !filteredOptions.find(opt => 
                opt.label.toLowerCase() === searchValue.toLowerCase()
              ) && (
                <CommandItem
                  value={`custom-${searchValue}`}
                  onSelect={handleCustomInput}
                  className="text-green-600 hover:text-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add "{searchValue.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 