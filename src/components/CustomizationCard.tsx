import { useState } from 'react';
import AppSelect, { type SelectOption } from './AppSelect';

export function CustomizationCard() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'ACME Inc.',
    companyType: '',
    companySize: '',
    teammates: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const companyTypeOptions: Array<SelectOption> = [
    { label: 'Select answer', value: '' },
    { label: 'Technology', value: 'technology' },
    { label: 'Finance', value: 'finance' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Education', value: 'education' },
    { label: 'Retail', value: 'retail' },
    { label: 'Other', value: 'other' }
  ];

  const companySizeOptions: Array<SelectOption> = [
    { label: 'Select answer', value: '' },
    { label: '1-10 employees', value: '1-10' },
    { label: '11-50 employees', value: '11-50' },
    { label: '51-200 employees', value: '51-200' },
    { label: '201-500 employees', value: '201-500' },
    { label: '500+ employees', value: '500+' }
  ];

  const teammatesOptions: Array<SelectOption> = [
    { label: 'Select answer', value: '' },
    { label: '1-5 teammates', value: '1-5' },
    { label: '6-15 teammates', value: '6-15' },
    { label: '16-50 teammates', value: '16-50' },
    { label: '51-100 teammates', value: '51-100' },
    { label: '100+ teammates', value: '100+' }
  ];

  return (
    <div className="bg-white content-stretch flex items-start relative rounded-[2px] size-full max-w-[850px] mx-auto">
      <div className="bg-[#0c0c0c] box-border flex h-full flex-col items-start justify-between px-[56px] py-[72px] text-left">
        <div className="flex w-full flex-1 flex-col gap-[20px]">
          <div className="flex flex-col gap-[14px] tracking-[-0.24px] text-[#f4f4f4]">
            <h2 className="text-[30px] font-semibold leading-[34px]">Let's customize your dashboard</h2>
            <p className="text-[15px] font-normal leading-[20px] text-[#8d8d8d]">
              We'd love to help you get setup for success
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-[20px]">
          <button className="bg-[#1f1f1f] flex h-[36px] w-full max-w-[200px] items-center justify-center rounded-full px-[24px] text-[13px] font-medium tracking-[-0.24px] text-[#f4f4f4] transition-colors hover:bg-[#333333]">
            Next
          </button>

          <div className="flex items-center gap-[6px]">
            <span className="size-[8px] rounded-full bg-[#f4f4f4]"></span>
            <span className="size-[8px] rounded-full bg-[#383838]"></span>
            <span className="size-[8px] rounded-full bg-[#383838]"></span>
            <span className="size-[8px] rounded-full bg-[#383838]"></span>
            <span className="size-[8px] rounded-full bg-[#383838]"></span>
          </div>
        </div>
      </div>

      <div className="bg-[#ebebeb] box-border content-stretch flex flex-col h-full items-center justify-between p-[64px] relative shrink-0 w-[460px]">
        <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full">
          <div className="content-stretch flex gap-[8px] items-start justify-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative self-stretch shrink-0">
              <label className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#646464] text-[15px] tracking-[-0.026px] w-full">
                <p className="leading-[18px] whitespace-pre-wrap">First name</p>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="bg-white box-border content-stretch flex h-[28px] items-center pl-[8px] pr-[16px] py-[4px] relative rounded-[2px] shrink-0 w-full border border-[#bbbbbb] border-solid shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)] text-[13px] text-[#202020] focus:outline-none focus:ring-2 focus:ring-[#202020] focus:border-transparent"
                placeholder="John"
              />
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative self-stretch shrink-0">
              <label className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#646464] text-[15px] tracking-[-0.026px] w-full">
                <p className="leading-[18px] whitespace-pre-wrap">Last name</p>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="bg-white box-border content-stretch flex h-[28px] items-center pl-[8px] pr-[16px] py-[4px] relative rounded-[2px] shrink-0 w-full border border-[#bbbbbb] border-solid shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)] text-[13px] text-[#202020] focus:outline-none focus:ring-2 focus:ring-[#202020] focus:border-transparent"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[4px] h-[50px] items-start relative shrink-0 w-full">
            <label className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#646464] text-[15px] tracking-[-0.026px] w-full">
              <p className="leading-[18px] whitespace-pre-wrap">What is your company name?</p>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="bg-white box-border content-stretch flex h-[28px] items-center pl-[8px] pr-[16px] py-[4px] relative rounded-[2px] shrink-0 w-full border border-[#bbbbbb] border-solid shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)] text-[13px] text-[#202020] focus:outline-none focus:ring-2 focus:ring-[#202020] focus:border-transparent"
              placeholder="ACME Inc."
            />
          </div>

          <div className="content-stretch flex flex-col gap-[4px] h-[50px] items-start relative shrink-0 w-full">
            <label className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#646464] text-[15px] tracking-[-0.026px] w-full">
              <p className="leading-[18px] whitespace-pre-wrap">What type of company do you work for?</p>
            </label>
            <AppSelect
              options={companyTypeOptions}
              placeholder="Select answer"
              value={formData.companyType}
              onValueChange={(value) => handleInputChange('companyType', value)}
              triggerClassName="w-full min-w-0"
            />
          </div>

          <div className="content-stretch flex flex-col gap-[4px] h-[50px] items-start relative shrink-0 w-full">
            <label className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#646464] text-[15px] tracking-[-0.026px] w-full">
              <p className="leading-[18px] whitespace-pre-wrap">What is your company size?</p>
            </label>
            <AppSelect
              options={companySizeOptions}
              placeholder="Select answer"
              value={formData.companySize}
              onValueChange={(value) => handleInputChange('companySize', value)}
              triggerClassName="w-full min-w-0"
            />
          </div>

          <div className="content-stretch flex flex-col gap-[4px] h-[50px] items-start relative shrink-0 w-full">
            <label className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#646464] text-[15px] tracking-[-0.026px] w-full">
              <p className="leading-[18px] whitespace-pre-wrap">How many teammates will be using Folk?</p>
            </label>
            <AppSelect
              options={teammatesOptions}
              placeholder="Select answer"
              value={formData.teammates}
              onValueChange={(value) => handleInputChange('teammates', value)}
              triggerClassName="w-full min-w-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
