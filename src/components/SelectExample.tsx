import { Select, type SelectOption } from '~/components/ui/select';
import { useState } from 'react';

const companyOptions: SelectOption[] = [
  { value: 'startup', label: 'Startup' },
  { value: 'small-business', label: 'Small Business' },
  { value: 'medium-business', label: 'Medium Business' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'non-profit', label: 'Non-profit' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
];

export function SelectExample() {
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Component Example</h3>
      
      <Select
        label="What type of company do you work for?"
        placeholder="Select answer"
        options={companyOptions}
        value={selectedCompany}
        onChange={setSelectedCompany}
      />
      
      {selectedCompany && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Selected: <span className="font-medium">{companyOptions.find(opt => opt.value === selectedCompany)?.label}</span>
          </p>
        </div>
      )}
    </div>
  );
}
