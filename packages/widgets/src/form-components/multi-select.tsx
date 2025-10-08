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
  defaultValue: string[];
  value: unknown;
  options: string[];
  placeholder?: string;
  selectAll?: boolean;
  onChange: (selectedOptions: string[]) => void;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export function MultiSelectDialog({
  defaultValue,
  value,
  options,
  placeholder = "Select options",
  selectAll = true,
  onChange,
}: MultiSelectDialogProps) {
  const safeValue = isStringArray(value) ? value : defaultValue;
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionToggle = useCallback(
    (option: string) => {
      const newOptions = safeValue.includes(option)
        ? safeValue.filter((item) => item !== option)
        : [...safeValue, option];
      onChange(newOptions);
    },
    [onChange, safeValue],
  );

  const handleItemClick = useCallback(
    (option: string) => (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      handleOptionToggle(option);
    },
    [handleOptionToggle],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const renderTrigger = useCallback(() => {
    if (!Array.isArray(safeValue) || safeValue.length === 0) return placeholder;
    if (safeValue.length === 1) return safeValue[0];
    return "(multiple items selected)";
  }, [safeValue, placeholder]);

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
            checked={safeValue.length === options.length}
            onSelect={(event) => {
              if (safeValue.length === options.length) {
                onChange([]);
              } else {
                onChange(options);
              }
              event.preventDefault();
              event.stopPropagation();
            }}
            className="font-medium"
          >
            Select/Unselect All
          </DropdownMenuCheckboxItem>
        ) : null}
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            checked={safeValue.includes(option)}
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
