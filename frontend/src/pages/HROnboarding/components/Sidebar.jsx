import React from 'react';

const Sidebar = ({ steps, currentStep, completedSteps, onStepClick }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🎓 HR Onboarding</h2>
      </div>
      
      <div className="sidebar-steps">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = currentStep === step.id;
          
          return (
            <div
              key={step.id}
              className={`sidebar-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onStepClick(step.id)}
            >
              <div className="sidebar-step-icon">
                {isCompleted ? '✓' : step.icon}
              </div>
              <div className="sidebar-step-text">
                <div className="sidebar-step-name">{step.name}</div>
                <div className="sidebar-step-status">
                  {isCompleted ? (
                    <span className="step-check">Completed</span>
                  ) : isActive ? (
                    <span>In Progress</span>
                  ) : (
                    <span>Pending</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
