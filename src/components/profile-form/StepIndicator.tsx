import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { number: 1, title: 'Basic Profile', description: 'Personal information and platforms' },
  { number: 2, title: 'Tech Stack', description: 'Skills and expertise' },
  { number: 3, title: 'Ice Breakers', description: 'Questions and answers' },
  { number: 4, title: 'Shared Learnings', description: 'Achievements and contributions' }
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <button
              type="button"
              className={`focus:outline-none bg-transparent border-none p-0 m-0 cursor-pointer group flex items-center ${onStepClick ? 'hover:opacity-80' : ''}`}
              onClick={() => onStepClick && onStepClick(step.number)}
              disabled={step.number === currentStep}
              aria-current={step.number === currentStep ? 'step' : undefined}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step.number < currentStep
                    ? 'bg-brandGreen border-brandGreen text-white'
                    : step.number === currentStep
                    ? 'bg-brandBlue border-brandBlue text-white'
                    : 'bg-brandBlueLightest border-brandBlueLight text-brandBlueDark'
                }`}
              >
                {step.number < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>
              <div className="ml-3 text-left">
                <p
                  className={`text-sm font-semibold ${
                    step.number <= currentStep ? 'text-brandBlueDarkest' : 'text-brandBlueDark'
                  }`}
                >
                  {step.title}
                </p>
                <p className={`text-xs ${
                  step.number <= currentStep ? 'text-brandBlueDark' : 'text-brandBlueLight'
                }`}>{step.description}</p>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div
                className={`w-24 h-0.5 mx-4 transition-colors ${
                  step.number < currentStep ? 'bg-brandGreen' : 'bg-brandBlueLight'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
