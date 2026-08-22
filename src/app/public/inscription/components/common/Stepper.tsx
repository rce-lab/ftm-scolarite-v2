// src/app/public/inscription/components/common/Stepper.tsx
'use client'

interface StepperProps {
  currentStep: number;
  totalSteps?: number;
}

export default function Stepper({ currentStep, totalSteps = 5 }: StepperProps) {
  const steps = [
    { number: 1, label: 'Informations' },
    { number: 2, label: 'Disponibilités' },
    { number: 3, label: 'Motivation' },
    { number: 4, label: 'Évaluation' },
    { number: 5, label: 'Confirmation' }
  ].slice(0, totalSteps);

  return (
    <div className="mb-8">
      <div className="flex justify-between">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 ${
              currentStep >= step.number 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}>
              {step.number}
            </div>
            <span className={`text-sm ${currentStep >= step.number ? 'font-medium text-blue-600' : 'text-gray-700'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2"></div>
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-300"
          style={{ 
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
          }}
        ></div>
      </div>
    </div>
  );
}