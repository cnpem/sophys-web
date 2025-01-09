"use client";

import { useCallback, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";

const gridVariants = cva("sm:max-w-[425px] grid m-4 gap-1", {
  variants: {
    size: {
      sm: "grid-cols-1",
      md: "grid-cols-2",
      lg: "grid-cols-3",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

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
    if (selectedOptions.length <= 2) return `[${selectedOptions.join(", ")}]`;
    return `[${selectedOptions.slice(0, 2).join(", ")}, ...]`;
  }, [selectedOptions, placeholder]);

  const optionsSize = useCallback((op: string[]) => {
    if (op.length <= 4) return "sm";
    if (op.length <= 8) return "md";
    return "lg";
  }, []);

  return (
    <DropdownMenu onOpenChange={handleOpenChange} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="w-full justify-start text-left font-normal"
          variant="outline"
        >
          {renderTrigger()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(gridVariants({ size: optionsSize(options) }))}
      >
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
