import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

// Layout
import AdminDashboard from '../pages/admin/AdminDashboard';

// Core Components
import AdminOverview from '../components/admin/AdminOverview';

const AdminRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route element={<AdminDashboard />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverview />} />

        {/* Test Route */}
        <Route 
          path="test" 
          element={
            <div className="p-4 bg-yellow-100 border border-yellow-500 rounded">
              <h1 className="text-2xl font-bold mb-4">Test Route - This should appear</h1>
              <p>If you can see this, routing is working!</p>
            </div>
          } 
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
