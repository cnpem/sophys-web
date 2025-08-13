"use client";

import { useCallback, useState } from "react";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";

interface MultiSelectDialogProps {
  defaultOptions?: string[];
  options: string[];
  placeholder?: string;
  selectAll?: boolean;
  onChange: (selectedOptions: string[]) => void;
}

export function MultiSelectDialog({
  options,
  defaultOptions,
  placeholder = "Select options",
  selectAll = false,
  onChange,
}: MultiSelectDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    defaultOptions ?? [],
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionToggle = useCallback(
    (option: string) => {
      setSelectedOptions((prev) => {
        const newOptions = prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option];
        onChange(newOptions);
        return newOptions;
      });
    },
    [onChange],
  );

  const handleItemClick = useCallback(
    (option: string) => (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      handleOptionToggle(option);
    },
    [handleOptionToggle],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onChange(selectedOptions);
      }
      setIsOpen(open);
    },
    [onChange, selectedOptions],
  );

  const renderTrigger = useCallback(() => {
    if (!Array.isArray(selectedOptions) || selectedOptions.length === 0)
      return placeholder;
    if (selectedOptions.length <= 2) return `${selectedOptions.join(", ")}`;
    return "(multiple items selected)";
  }, [selectedOptions, placeholder]);

  return (
    <DropdownMenu onOpenChange={handleOpenChange} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="justify-start overflow-hidden text-left font-normal"
          variant="outline"
        >
          {renderTrigger()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full gap-1">
        {selectAll ? (
          <DropdownMenuCheckboxItem
            checked={selectedOptions.length === options.length}
            onSelect={(event) => {
              if (selectedOptions.length === options.length) {
                setSelectedOptions([]);
              } else {
                setSelectedOptions(options);
              }
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            Select All
          </DropdownMenuCheckboxItem>
        ) : null}
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            checked={selectedOptions.includes(option)}
            key={option}
            onSelect={handleItemClick(option)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
