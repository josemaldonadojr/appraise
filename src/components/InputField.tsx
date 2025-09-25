import React from 'react'

interface InputFieldProps {
  label: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function InputField({ 
  label, 
  placeholder = "", 
  value = "", 
  onChange,
  className = ""
}: InputFieldProps) {
  return (
    <div className={`flex flex-col gap-1 items-start relative w-full ${className}`}>
      <label className="font-['Inter:Regular',_sans-serif] font-normal text-[#646464] text-[15px] leading-[18px] tracking-[-0.026px]">
        {label}
      </label>
      <div className="bg-white box-border flex h-[28px] items-center pl-[8px] pr-[16px] py-[4px] relative rounded-[2px] w-full border border-[#bbbbbb] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)]">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="flex-1 font-['Inter:Regular',_sans-serif] font-normal text-[#bbbbbb] text-[13px] leading-[19px] bg-transparent border-none outline-none placeholder:text-[#bbbbbb]"
        />
      </div>
    </div>
  )
}
