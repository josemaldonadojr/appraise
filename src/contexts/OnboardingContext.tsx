import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface OnboardingData {
    firstName: string;
    lastName: string;
    companyName: string;
    companyType: string;
    companySize: string;
    teammates: string;
    goals: string[];
}

interface OnboardingContextType {
    currentStep: number;
    totalSteps: number;
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    isComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const initialData: OnboardingData = {
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'Veterans United',
    companyType: '',
    companySize: '',
    teammates: '',
    goals: []
};

export function OnboardingProvider({ children, totalSteps = 5 }: { children: ReactNode; totalSteps?: number }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<OnboardingData>(initialData);

    const updateData = (updates: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const goToStep = (step: number) => {
        setCurrentStep(Math.max(1, Math.min(step, totalSteps)));
    };

    const isComplete = currentStep === totalSteps;

    return (
        <OnboardingContext.Provider
            value={{
                currentStep,
                totalSteps,
                data,
                updateData,
                nextStep,
                prevStep,
                goToStep,
                isComplete
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}

export function useOnboardingOptional() {
    const context = useContext(OnboardingContext);
    return context;
}
