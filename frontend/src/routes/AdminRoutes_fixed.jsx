import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

// Layout
import AdminDashboard from '../pages/admin/AdminDashboard';

// Core Components - Direct imports (these work fine)
import AdminOverview from '../components/admin/AdminOverview';
import StudentManagement from '../components/admin/StudentManagement';
import AddStudent from '../components/admin/AddStudent';
import StudentCredentials from '../components/admin/StudentCredentials';
import FeesList from '../components/admin/FeesListWithErrorBoundary';
import FeeDetail from '../components/admin/FeeDetail';
import PaymentForm from '../components/admin/PaymentForm';
import FeeManagement from '../components/admin/FeeManagement';
import NewFeeForm from '../components/admin/NewFeeForm';

// HR Management - Direct imports (these work fine)
import HROnboardingDashboard from '../components/hr/HROnboardingDashboard';
import HROnboarding from '../pages/hr/HROnboarding';
import AddEmployee from '../components/hr/AddEmployeeSimple';
import EmployeeList from '../components/hr/EmployeeListSimple';

// Lazy loaded components (these might cause import issues)
const NotificationManagement = lazy(() => import('../pages/admin/notifications/NotificationManagement'));
const AttendanceManagement = lazy(() => import('../components/admin/AttendanceManagement'));
const MarksEntry = lazy(() => import('../components/admin/MarksEntry'));
const Admissions = lazy(() => import('../components/admin/Admissions'));
const HostelManagement = lazy(() => import('../components/admin/HostelManagement'));
const ReportsAnalytics = lazy(() => import('../components/admin/ReportsAnalytics'));
const AIAssistant = lazy(() => import('../components/admin/AIAssistant'));
const Settings = lazy(() => import('../components/admin/Settings'));
const TestComponent = lazy(() => import('../components/admin/TestComponent'));

// Faculty - Lazy loaded
const FacultyDashboard = lazy(() => import('../pages/faculty/admin_faculty/admin/Dashboard'));
const FacultyManagement = lazy(() => import('../pages/faculty/admin_faculty/admin/FacultyManagement'));
const FacultyAttendance = lazy(() => import('../pages/faculty/admin_faculty/admin/Attendance'));

// Infrastructure & Facilities - Lazy loaded
const FacilitiesManagement = lazy(() => import('../pages/admin/FacilitiesManagement'));
const InfrastructureFacilities = lazy(() => import('../pages/admin/infrastructure/InfrastructureFacilities'));
const CampusMap = lazy(() => import('../pages/admin/infrastructure/CampusMap'));
const ClassroomAllocation = lazy(() => import('../pages/admin/infrastructure/ClassroomAllocation'));
const SmartClassroomTracking = lazy(() => import('../pages/admin/infrastructure/SmartClassroomTracking'));
const LabEquipmentManagement = lazy(() => import('../pages/admin/infrastructure/LabEquipmentManagement'));
const AuditoriumBooking = lazy(() => import('../pages/admin/infrastructure/AuditoriumBooking'));

// Academic - Lazy loaded
const AcademicSupport = lazy(() => import('../pages/admin/academic/AcademicSupport'));
const LibraryManagement = lazy(() => import('../pages/admin/academic/LibraryManagement'));
const LaboratoryScheduling = lazy(() => import('../pages/admin/academic/LaboratoryScheduling'));
const LibraryScheduling = lazy(() => import('../pages/admin/academic/LibraryScheduling'));
const ITCResearch = lazy(() => import('../pages/admin/academic/ITCResearch'));
const StudentSupport = lazy(() => import('../pages/admin/academic/StudentSupport'));
const ResearchInnovation = lazy(() => import('../pages/admin/academic/ResearchInnovation'));
const LibraryCatalog = lazy(() => import('../pages/admin/academic/library/LibraryCatalog'));
const LibraryLoans = lazy(() => import('../pages/admin/academic/library/LibraryLoans'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AdminRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route element={<AdminDashboard />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverview />} />

        {/* Student Management */}
        <Route path="students">
          <Route index element={<StudentManagement />} />
          <Route path="add" element={<AddStudent />} />
          <Route path=":id/edit" element={<AddStudent />} />
          <Route path="credentials" element={<StudentCredentials />} />
        </Route>

        {/* Fees Management */}
        <Route path="fees">
          <Route index element={<FeesList />} />
          <Route path=":id" element={<FeeDetail />} />
          <Route path="new" element={<NewFeeForm />} />
          <Route path="management" element={<FeeManagement />} />
          <Route path="payments/new" element={<PaymentForm />} />
          <Route path=":id/pay" element={<PaymentForm />} />
        </Route>

        {/* HR Management */}
        <Route path="hr">
          <Route index element={<HROnboardingDashboard />} />
          <Route path="dashboard" element={<HROnboardingDashboard />} />
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="employees" element={<EmployeeList />} />
        </Route>

        {/* Notifications */}
        <Route path="notifications" element={
          <Suspense fallback={<LoadingSpinner />}>
            <NotificationManagement />
          </Suspense>
        } />

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
