import React, { useState } from 'react';
import { InputField } from './InputField';
import { Select } from './ui/select';
import { ProgressIndicator } from './ProgressIndicator';
import { Button } from './ui/button';

interface CustomizationFormProps {
  className?: string;
}

export function CustomizationForm({ className = "" }: CustomizationFormProps) {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'ACME Inc.',
    companyType: '',
    companySize: '',
    teammates: ''
  });

  const companyTypeOptions = [
    { value: 'startup', label: 'Startup' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'small-business', label: 'Small Business' },
    { value: 'non-profit', label: 'Non-profit' },
  ];

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  const teammatesOptions = [
    { value: '1-5', label: '1-5 teammates' },
    { value: '6-20', label: '6-20 teammates' },
    { value: '21-50', label: '21-50 teammates' },
    { value: '51+', label: '51+ teammates' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`bg-white content-stretch flex items-start relative rounded-[2px] size-full ${className}`}>
      {/* Left Panel */}
      <div className="box-border content-stretch flex flex-col h-full items-center justify-between p-[40px] relative shrink-0 w-[390px]">
        <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[16px] items-center leading-[0] not-italic relative shrink-0 tracking-[-0.026px] w-full">
            <div className="flex flex-col font-['Uxum_Grotesque:Medium',_sans-serif] justify-center relative shrink-0 text-[#202020] text-[32px] w-full">
              <p className="leading-[35.2px] whitespace-pre-wrap">Let's customize your CRM</p>
            </div>
            <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[#646464] text-[15px] w-full">
              <p className="leading-[18px] whitespace-pre-wrap">We'd love to help you get setup for success</p>
            </div>
          </div>
        </div>
        
        <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full">
          <Button className="bg-[#202020] hover:bg-[#202020]/90 text-[#fcfcfc] px-[16px] py-[6px] rounded-[9999px] w-full font-['Inter:Medium',_sans-serif] font-medium text-[13px] tracking-[-0.026px]">
            Next
          </Button>
          <ProgressIndicator currentStep={1} totalSteps={5} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="bg-[#ebebeb] box-border content-stretch flex flex-col h-full items-center justify-between p-[64px] relative shrink-0 w-[460px]">
        <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full">
          {/* Name Fields */}
          <div className="content-stretch flex gap-[8px] items-start justify-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative self-stretch shrink-0">
              <InputField
                label="First name"
                value={formData.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
                className="h-[50px]"
              />
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative self-stretch shrink-0">
              <InputField
                label="Last name"
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                className="h-[50px]"
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="content-stretch flex flex-col gap-[4px] h-[50px] items-start relative shrink-0 w-full">
            <InputField
              label="What is your company name?"
              value={formData.companyName}
              onChange={(value) => handleInputChange('companyName', value)}
              className="h-[50px]"
            />
          </div>

          {/* Company Type */}
          <div className="content-stretch flex flex-col gap-[4px] h-[50px] items-start relative shrink-0 w-full">
            <Select
              label="What type of company do you work for?"
              placeholder="Select answer"
              options={companyTypeOptions}
              value={formData.companyType}
              onChange={(value) => handleInputChange('companyType', value)}
              className="h-[50px]"
            />
          </div>

          {/* Company Size */}
          <div className="content-stretch flex flex-col gap-[4px] h-[50px] items-start relative shrink-0 w-full">
            <Select
              label="What is your company size?"
              placeholder="Select answer"
              options={companySizeOptions}
              value={formData.companySize}
              onChange={(value) => handleInputChange('companySize', value)}
              className="h-[50px]"
            />
          </div>

          {/* Teammates */}
          <div className="content-stretch flex flex-col gap-[4px] h-[50px] items-start relative shrink-0 w-full">
            <Select
              label="How many teammates will be using Folk?"
              placeholder="Select answer"
              options={teammatesOptions}
              value={formData.teammates}
              onChange={(value) => handleInputChange('teammates', value)}
              className="h-[50px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
