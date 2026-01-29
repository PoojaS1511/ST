import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';

const FacultyLayout = () => {
  return (
    <FacultyDashboard>
      <Outlet />
    </FacultyDashboard>
  );
};

const FacultyRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<FacultyLayout />}>
        <Route index element={<div>Welcome to Faculty Dashboard</div>} />
        {/* Add more nested routes here as needed */}
      </Route>
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default FacultyRoutes;
