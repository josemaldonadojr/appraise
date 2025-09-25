import React, { useState } from 'react';
import { motion } from 'motion/react';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="content-stretch flex flex-col gap-4 items-start relative shrink-0 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {goalOptions.map((goal, index) => (
        <motion.div
          key={goal}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full"
        >
          <PillButton
            selected={data.goals?.includes(goal) || false}
            onClick={() => handleGoalToggle(goal)}
            className="w-full"
          >
            {goal}
          </PillButton>
        </motion.div>
      ))}
    </motion.div>
  );
}
