import React from 'react';

const TopStepper = ({ steps, currentStep, completedSteps }) => {
  const getStepStatus = (index) => {
    if (completedSteps.includes(index)) return 'completed';
    if (currentStep === index) return 'active';
    return 'pending';
  };

  return (
    <div className="top-stepper">
      <div className="stepper-container">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={index} className="stepper-step">
              <div>
                <div className={`step-number ${status}`}>
                  {status === 'completed' ? '✓' : index + 1}
                </div>
                <div className={`step-label ${status}`}>
                  {step}
                </div>
              </div>
              
              {!isLast && (
                <div className={`step-line ${status === 'completed' ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopStepper;
