import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TransportManagement = () => {
  const navigate = useNavigate();

  // Redirect to the Fleet Flow frontend
  useEffect(() => {
    // Using window.location.replace to prevent going back to this page
    window.location.replace('http://localhost:3001');
    return () => {};
  }, [navigate]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Transport Management System...</p>
      </div>
    </div>
  );
};

export default TransportManagement;
