import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '~/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options?: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function Select({
  label,
  placeholder = "Select answer",
  options = [],
  value,
  onChange,
  className,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === selectedValue);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    onChange?.(optionValue);
  };

  return (
    <div className={cn("flex flex-col gap-1 items-start w-full", className)}>
      {label && (
        <label className="text-[15px] font-normal leading-[18px] text-[#646464] tracking-[-0.026px] w-full">
          {label}
        </label>
      )}
      <div className="relative w-full" ref={selectRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "bg-white border border-[#bbbbbb] rounded-[2px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)]",
            "h-[28px] px-2 pr-4 py-1 w-full flex items-center justify-between",
            "text-[13px] leading-[19px] text-center",
            "hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors duration-150",
            disabled && "opacity-50 cursor-not-allowed",
            !selectedValue && "text-[#bbbbbb]",
            selectedValue && "text-gray-900"
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDownIcon 
            className={cn(
              "w-4 h-4 flex-shrink-0 transition-transform duration-150",
              isOpen && "rotate-180",
              !selectedValue && "text-[#bbbbbb]",
              selectedValue && "text-gray-600"
            )}
          />
        </button>
        
        {isOpen && options.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#bbbbbb] rounded-[2px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)] z-50 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full px-2 py-1 text-left text-[13px] leading-[19px] text-gray-900",
                  "hover:bg-gray-50 transition-colors duration-150",
                  "first:rounded-t-[2px] last:rounded-b-[2px]",
                  selectedValue === option.value && "bg-blue-50 text-blue-900"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
