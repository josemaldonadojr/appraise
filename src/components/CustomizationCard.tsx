import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
            <div className="bg-white box-border content-stretch flex h-[28px] items-center justify-between pl-[8px] pr-[16px] py-[4px] relative rounded-[2px] shrink-0 w-full border border-[#bbbbbb] border-solid shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)] focus-within:ring-2 focus-within:ring-[#202020] focus-within:border-transparent">
              <select
                value={formData.companyType}
                onChange={(e) => handleInputChange('companyType', e.target.value)}
                className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bbbbbb] text-[13px] whitespace-nowrap bg-transparent border-none outline-none w-full text-left"
              >
                <option value="">Select answer</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
              <div className="relative shrink-0 size-[16px]">
                <ChevronDown className="w-4 h-4 text-[#bbbbbb]" />
              </div>
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[4px] h-[50px] items-start relative shrink-0 w-full">
            <label className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#646464] text-[15px] tracking-[-0.026px] w-full">
              <p className="leading-[18px] whitespace-pre-wrap">What is your company size?</p>
            </label>
            <div className="bg-white box-border content-stretch flex h-[28px] items-center justify-between pl-[8px] pr-[16px] py-[4px] relative rounded-[2px] shrink-0 w-full border border-[#bbbbbb] border-solid shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)] focus-within:ring-2 focus-within:ring-[#202020] focus-within:border-transparent">
              <select
                value={formData.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bbbbbb] text-[13px] whitespace-nowrap bg-transparent border-none outline-none w-full text-left"
              >
                <option value="">Select answer</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
              <div className="relative shrink-0 size-[16px]">
                <ChevronDown className="w-4 h-4 text-[#bbbbbb]" />
              </div>
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[4px] h-[50px] items-start relative shrink-0 w-full">
            <label className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#646464] text-[15px] tracking-[-0.026px] w-full">
              <p className="leading-[18px] whitespace-pre-wrap">How many teammates will be using Folk?</p>
            </label>
            <div className="bg-white box-border content-stretch flex h-[28px] items-center justify-between pl-[8px] pr-[16px] py-[4px] relative rounded-[2px] shrink-0 w-full border border-[#bbbbbb] border-solid shadow-[0px_1px_1px_0px_rgba(0,0,0,0.06)] focus-within:ring-2 focus-within:ring-[#202020] focus-within:border-transparent">
              <select
                value={formData.teammates}
                onChange={(e) => handleInputChange('teammates', e.target.value)}
                className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bbbbbb] text-[13px] whitespace-nowrap bg-transparent border-none outline-none w-full text-left"
              >
                <option value="">Select answer</option>
                <option value="1-5">1-5 teammates</option>
                <option value="6-15">6-15 teammates</option>
                <option value="16-50">16-50 teammates</option>
                <option value="51-100">51-100 teammates</option>
                <option value="100+">100+ teammates</option>
              </select>
              <div className="relative shrink-0 size-[16px]">
                <ChevronDown className="w-4 h-4 text-[#bbbbbb]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
