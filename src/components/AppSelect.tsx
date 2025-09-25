import { Select } from '@base-ui-components/react/select';
import { ChevronDown } from 'lucide-react';

export type SelectOption = {
    label: string;
    value: string;
};

type Props = {
    options: Array<SelectOption>;
    placeholder?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    triggerClassName?: string;
};

export default function AppSelect({ options, placeholder, value, onValueChange, triggerClassName }: Props) {
    return (
        <Select.Root items={options} value={value} onValueChange={onValueChange}>
            <Select.Trigger
                className={`bg-white box-border flex h-[28px] min-w-[220px] items-center justify-between rounded-[2px] border border-[#bbbbbb] px-[8px] pr-[12px] text-[13px] text-[#202020] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)] focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202020] data-[placeholder]:text-[#bbbbbb] ${triggerClassName ?? ''}`}
            >
                <Select.Value className="flex-1 text-left" placeholder={placeholder} />
                <Select.Icon className="ml-2 flex shrink-0 text-[#bbbbbb]">
                    <ChevronDown className="size-4" />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Positioner className="z-10 outline-none" sideOffset={6}>
                    <Select.Popup className="w-[var(--anchor-width)] rounded-[2px] border border-[#bbbbbb] bg-white py-1 text-[13px] text-[#202020] shadow-[0px_12px_20px_-12px_rgba(0,0,0,0.45)] outline-none">
                        {options.map(({ label, value }) => (
                            <Select.Item
                                key={value}
                                value={value}
                                className="cursor-pointer px-3 py-1.5 text-left text-[13px] text-[#202020] outline-none data-[highlighted]:bg-[#202020] data-[highlighted]:text-[#f4f4f4]"
                            >
                                <Select.ItemText>{label}</Select.ItemText>
                            </Select.Item>
                        ))}
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    );
}