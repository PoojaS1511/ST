import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopStepper from './components/TopStepper';
import './HROnboarding.css';

const HROnboardingLayout = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    { id: 0, name: 'Dashboard', path: '/hr-onboarding' },
    { id: 1, name: 'Registration', path: '/hr-onboarding/registration' },
    { id: 2, name: 'Documents', path: '/hr-onboarding/documents' },
    { id: 3, name: 'Role Assignment', path: '/hr-onboarding/role-assignment' },
    { id: 4, name: 'Work Policy', path: '/hr-onboarding/work-policy' },
    { id: 5, name: 'Salary Setup', path: '/hr-onboarding/salary-setup' },
    { id: 6, name: 'System Access', path: '/hr-onboarding/system-access' }
  ];

  const sidebarSteps = [
    { id: 0, name: 'Dashboard', icon: '📊' },
    { id: 1, name: 'Registration', icon: '📝' },
    { id: 2, name: 'Documents', icon: '📁' },
    { id: 3, name: 'Role Assignment', icon: '👤' },
    { id: 4, name: 'Work Policy', icon: '📋' },
    { id: 5, name: 'Salary Setup', icon: '💰' },
    { id: 6, name: 'System Access', icon: '🔐' }
  ];

  const stepperSteps = [
    'Registration',
    'Documents', 
    'Role Assignment',
    'Work Policy',
    'Salary Setup',
    'Activation'
  ];

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId);
    navigate(steps[stepId].path);
  };

  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const moveToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      navigate(steps[nextStep].path);
    }
  };

  const moveToPreviousStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      navigate(steps[prevStep].path);
    }
  };

  return (
    <div className="hr-onboarding-container">
      <Sidebar 
        steps={sidebarSteps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />
      
      <div className="main-content">
        <TopStepper 
          steps={stepperSteps}
          currentStep={currentStep - 1}
          completedSteps={completedSteps.filter(id => id > 0).map(id => id - 1)}
        />
        
        <div className="content-area">
          <Outlet 
            context={{
              currentStep,
              completedSteps,
              onStepComplete: handleStepComplete,
              moveToNextStep,
              moveToPreviousStep
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HROnboardingLayout;