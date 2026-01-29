import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HROnboardingLayout from './HROnboardingLayout';
import Dashboard from './Dashboard';
import Registration from './Registration';
import Documents from './Documents';
import RoleAssignment from './RoleAssignment';
import WorkPolicy from './WorkPolicy';
import SalarySetup from './SalarySetup';
import SystemAccess from './SystemAccess';

const HROnboarding = () => {
  return (
    <HROnboardingLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="registration" element={<Registration />} />
        <Route path="documents" element={<Documents />} />
        <Route path="role-assignment" element={<RoleAssignment />} />
        <Route path="work-policy" element={<WorkPolicy />} />
        <Route path="salary-setup" element={<SalarySetup />} />
        <Route path="system-access" element={<SystemAccess />} />
      </Routes>
    </HROnboardingLayout>
  );
};

export default HROnboarding;
