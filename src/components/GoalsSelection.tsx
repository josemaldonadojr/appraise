import React, { useState } from 'react';
import { PillButton } from './ui/pill-button';
import { useOnboardingOptional } from '~/contexts/OnboardingContext';

const goalOptions = [
  'Order appraisals for mortgage lending',
  'Order appraisals for refinancing',
  'Order appraisals for home equity loans',
  'Order appraisals for real estate transactions',
  'Order appraisals for property management',
  'Order appraisals for investment properties',
  'Something else'
];

export function GoalsSelection() {
  const context = useOnboardingOptional();
  const [localGoals, setLocalGoals] = useState<string[]>([]);
  
  const data = context?.data ?? { goals: localGoals };
  const updateData = context?.updateData ?? ((updates: any) => {
    if (updates.goals) {
      setLocalGoals(updates.goals);
    }
  });

  const handleGoalToggle = (goal: string) => {
    const currentGoals = data.goals || [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    
    updateData({ goals: newGoals });
  };

  return (
    <div className="content-stretch flex flex-col gap-4 items-start relative shrink-0 w-full">
      {goalOptions.map((goal) => (
        <PillButton
          key={goal}
          selected={data.goals?.includes(goal) || false}
          onClick={() => handleGoalToggle(goal)}
          className="w-full"
        >
          {goal}
        </PillButton>
      ))}
    </div>
  );
}
