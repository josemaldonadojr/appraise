import React, { useState } from 'react';
import { InputField } from './InputField';
import { Select } from './ui/select';
import { useOnboardingOptional } from '~/contexts/OnboardingContext';

const companyTypeOptions = [
  { value: 'mortgage-lender', label: 'Mortgage Lender' },
  { value: 'credit-union', label: 'Credit Union' },
  { value: 'real-estate-broker', label: 'Real Estate Brokerage' },
  { value: 'title-company', label: 'Title Company' },
  { value: 'property-management', label: 'Property Management Company' },
  { value: 'investment-firm', label: 'Real Estate Investment Firm' },
  { value: 'other', label: 'Other' },
];

const companySizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

const teammatesOptions = [
  { value: '1', label: 'Just me' },
  { value: '2-5', label: '2-5 people' },
  { value: '6-20', label: '6-20 people' },
  { value: '21-50', label: '21-50 people' },
  { value: '51+', label: '51+ people' },
];

export function CompanyInfoForm() {
  const context = useOnboardingOptional();
  const [localData, setLocalData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'Veterans United Home Loans',
    companyType: '',
    companySize: '',
    teammates: ''
  });
  
  const data = context?.data ?? localData;
  const updateData = context?.updateData ?? ((updates: any) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  });

  const handleInputChange = (field: keyof typeof data, value: string) => {
    updateData({ [field]: value });
  };

  return (
    <div className="content-stretch flex flex-col gap-6 items-center relative shrink-0 w-full">
      {/* Name Fields */}
      <div className="content-stretch flex gap-2 items-start justify-center relative shrink-0 w-full">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-1 items-start min-h-px min-w-px relative self-stretch shrink-0">
          <InputField
            label="First name"
            value={data.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            className="h-[50px]"
          />
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-1 items-start min-h-px min-w-px relative self-stretch shrink-0">
          <InputField
            label="Last name"
            value={data.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            className="h-[50px]"
          />
        </div>
      </div>

      {/* Company Name */}
      <div className="content-stretch flex flex-col gap-1 h-[50px] items-start relative shrink-0 w-full">
        <InputField
          label="What is your company name?"
          value={data.companyName}
          onChange={(value) => handleInputChange('companyName', value)}
          className="h-[50px]"
        />
      </div>

      {/* Company Type */}
      <div className="content-stretch flex flex-col gap-1 h-[50px] items-start relative shrink-0 w-full">
        <Select
          label="What type of company do you work for?"
          placeholder="Select answer"
          options={companyTypeOptions}
          value={data.companyType}
          onChange={(value) => handleInputChange('companyType', value)}
          className="h-[50px]"
        />
      </div>

      {/* Company Size */}
      <div className="content-stretch flex flex-col gap-1 h-[50px] items-start relative shrink-0 w-full">
        <Select
          label="How many appraisals do you typically order per month?"
          placeholder="Select answer"
          options={[
            { value: '1-10', label: '1-10 appraisals' },
            { value: '11-50', label: '11-50 appraisals' },
            { value: '51-200', label: '51-200 appraisals' },
            { value: '201-500', label: '201-500 appraisals' },
            { value: '500+', label: '500+ appraisals' },
          ]}
          value={data.companySize}
          onChange={(value) => handleInputChange('companySize', value)}
          className="h-[50px]"
        />
      </div>

      {/* Teammates */}
      <div className="content-stretch flex flex-col gap-1 h-[50px] items-start relative shrink-0 w-full">
        <Select
          label="How many team members will be ordering appraisals?"
          placeholder="Select answer"
          options={teammatesOptions}
          value={data.teammates}
          onChange={(value) => handleInputChange('teammates', value)}
          className="h-[50px]"
        />
      </div>
    </div>
  );
}
