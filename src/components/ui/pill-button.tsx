import React from 'react';
import { cn } from '~/lib/utils';

export interface PillButtonProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function PillButton({ 
  children, 
  selected = false, 
  onClick, 
  className = "",
  disabled = false 
}: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-white box-border content-stretch flex gap-2 items-center pl-2 pr-4 py-2 relative rounded-[9999px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)] shrink-0 w-full",
        "hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
        selected && "ring-2 ring-[#202020] ring-offset-1",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className={cn(
        "bg-white relative rounded-[9999px] shrink-0 size-4",
        "border border-[#bbbbbb] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)]",
        selected && "bg-[#202020] border-[#202020]"
      )}>
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M6.5 2.5L3 6L1.5 4.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-0 not-italic relative shrink-0 text-[#202020] text-[13px] text-center whitespace-nowrap">
        <p className="leading-[19px]">{children}</p>
      </div>
    </button>
  );
}