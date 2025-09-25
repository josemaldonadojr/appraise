import React from 'react';
import { InfoCard } from './InfoCard';

// Icons for the premium features
const GroupsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z" fill="white"/>
    <path d="M8 9C5.33 9 0 10.34 0 13V16H16V13C16 10.34 10.67 9 8 9Z" fill="white"/>
  </svg>
);

const PipelinesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4H14V6H2V4Z" fill="white"/>
    <path d="M2 7H14V9H2V7Z" fill="white"/>
    <path d="M2 10H14V12H2V10Z" fill="white"/>
  </svg>
);

const ChromeExtensionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14Z" fill="white"/>
    <path d="M8 4C5.79 4 4 5.79 4 8C4 10.21 5.79 12 8 12C10.21 12 12 10.21 12 8C12 5.79 10.21 4 8 4Z" fill="white"/>
  </svg>
);

const EnrichmentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0L10.5 5.5L16 8L10.5 10.5L8 16L5.5 10.5L0 8L5.5 5.5L8 0Z" fill="white"/>
  </svg>
);

const IntegrationsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2H6V6H2V2Z" fill="white"/>
    <path d="M10 2H14V6H10V2Z" fill="white"/>
    <path d="M2 10H6V14H2V10Z" fill="white"/>
    <path d="M10 10H14V14H10V10Z" fill="white"/>
  </svg>
);

const MoreFeaturesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14Z" fill="white"/>
    <path d="M8 4C5.79 4 4 5.79 4 8C4 10.21 5.79 12 8 12C10.21 12 12 10.21 12 8C12 5.79 10.21 4 8 4Z" fill="white"/>
  </svg>
);

const premiumFeatures = [
  {
    icon: <GroupsIcon />,
    title: "Bulk Ordering",
    description: "Order multiple appraisals at once with our streamlined bulk ordering system"
  },
  {
    icon: <ChromeExtensionIcon />,
    title: "Property Data Import",
    description: "Import property details directly from MLS and real estate websites"
  },
  {
    icon: <EnrichmentIcon />,
    title: "Property Enrichment",
    description: "Automatically enrich property data with market comps and neighborhood insights"
  },
  {
    icon: <MoreFeaturesIcon />,
    title: "Advanced Analytics",
    description: "Track appraisal performance, turnaround times, and cost optimization insights"
  }
];

export function PremiumTrialStep() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      {premiumFeatures.map((feature, index) => (
        <div key={index} className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
            <div className="relative shrink-0 size-[16px]">
              {feature.icon}
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[4px] items-start justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 tracking-[-0.026px]">
              <div className="flex flex-col justify-center relative shrink-0 text-[15px] text-white w-full">
                <p className="leading-[18px] whitespace-pre-wrap">{feature.title}</p>
              </div>
              <div className="flex flex-col justify-center relative shrink-0 text-[#bbbbbb] text-[12px] w-full">
                <p className="leading-[18px] whitespace-pre-wrap">{feature.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
