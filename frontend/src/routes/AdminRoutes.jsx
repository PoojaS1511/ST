import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AdminLayout from '../components/admin/AdminLayout';
import AdminOverview from '../components/admin/AdminOverview';
import StudentManagement from '../components/admin/StudentManagement';
import FacultyManagement from '../components/admin/FacultyManagement';
import FeeManagement from '../components/admin/FeeManagement';
import AttendanceManagement from '../components/admin/AttendanceManagement';
import ExamManagement from '../components/admin/ExamManagement';
import HostelManagement from '../components/admin/HostelManagement';
import TransportManagement from '../pages/admin/TransportManagement';
import TransportDashboard from '../components/transport/TransportDashboard';
import StudentManagementTransport from '../components/transport/StudentManagement';
import FacultyManagementTransport from '../components/transport/FacultyManagement';
import BusManagement from '../components/transport/BusManagement';
import DriverManagement from '../components/transport/DriverManagement';
import RouteManagement from '../components/transport/RouteManagement';
import FeesManagement from '../components/transport/FeesManagement';
import AttendanceManagementTransport from '../components/transport/AttendanceManagement';
import LiveTracking from '../components/transport/LiveTracking';
import Reports from '../components/transport/Reports';
import CourseManagement from '../components/admin/CourseManagement';
import SubjectManagement from '../components/admin/SubjectManagement';
import NotificationScheduler from '../components/admin/NotificationScheduler';
import ReportManager from '../components/admin/ReportManager';
import AdminSettings from '../components/admin/AdminSettings';

// Finance
import FinanceDashboard from '../components/finance/FinanceDashboard';
import Expenses from '../components/finance/Expenses';
import BudgetAllocation from '../components/finance/BudgetAllocation';
import StaffPayroll from '../components/finance/StaffPayroll';
import StudentFees from '../components/finance/StudentFees';
import Vendors from '../components/finance/Vendors';
import Maintenance from '../components/finance/Maintenance';
import AIAssistant from '../components/finance/AIAssistant';

// Payroll
import PayrollDashboard from '../pages/hr/PayrollDashboard';
import PayrollList from '../pages/hr/PayrollList';
import PayrollCalculation from '../pages/hr/PayrollCalculation';
import HRApprovalWorkflow from '../pages/hr/HRApprovalWorkflow';
import PayslipGeneration from '../pages/hr/PayslipGeneration';
import NotificationCenter from '../pages/hr/NotificationCenter';
import HROnboardingRoutes from './HROnboardingRoutes';

// Quality
import QualityDashboard from '../pages/quality/Dashboard';
import QualityAnalytics from '../pages/quality/Analytics';
import QualityAudits from '../pages/quality/Audits';
import QualityFaculty from '../pages/quality/Faculty';
import QualityGrievances from '../pages/quality/Grievances';
import QualityPolicies from '../pages/quality/Policies';
import QualityAccreditation from '../pages/quality/Accreditation';

const LoadingScreen = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function AdminRoutes() {
  console.log('🟪 AdminRoutes component is mounting...');
  
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminOverview />
          </Suspense>
        } />
        <Route path="students" element={
          <Suspense fallback={<LoadingScreen />}>
            <StudentManagement />
          </Suspense>
        } />
        <Route path="faculty" element={
          <Suspense fallback={<LoadingScreen />}>
            <FacultyManagement />
          </Suspense>
        } />
        <Route path="fees" element={
          <Suspense fallback={<LoadingScreen />}>
            <FeeManagement />
          </Suspense>
        } />
        <Route path="attendance" element={
          <Suspense fallback={<LoadingScreen />}>
            <AttendanceManagement />
          </Suspense>
        } />
        <Route path="exams" element={
          <Suspense fallback={<LoadingScreen />}>
            <ExamManagement />
          </Suspense>
        } />
        <Route path="hostel" element={
          <Suspense fallback={<LoadingScreen />}>
            <HostelManagement />
          </Suspense>
        } />
        <Route path="transport" element={
          <Suspense fallback={<LoadingScreen />}>
            <TransportManagement />
          </Suspense>
        }>
          <Route index element={<TransportDashboard />} />
          <Route path="students" element={<StudentManagementTransport />} />
          <Route path="faculty" element={<FacultyManagementTransport />} />
          <Route path="buses" element={<BusManagement />} />
          <Route path="drivers" element={<DriverManagement />} />
          <Route path="routes" element={<RouteManagement />} />
          <Route path="fees" element={<FeesManagement />} />
          <Route path="attendance" element={<AttendanceManagementTransport />} />
          <Route path="tracking" element={<LiveTracking />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="courses" element={
          <Suspense fallback={<LoadingScreen />}>
            <CourseManagement />
          </Suspense>
        } />
        <Route path="subjects" element={
          <Suspense fallback={<LoadingScreen />}>
            <SubjectManagement />
          </Suspense>
        } />
        <Route path="notifications" element={
          <Suspense fallback={<LoadingScreen />}>
            <NotificationScheduler />
          </Suspense>
        } />
        <Route path="reports" element={
          <Suspense fallback={<LoadingScreen />}>
            <ReportManager />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminSettings />
          </Suspense>
        } />

        {/* HR Onboarding */}
        <Route path="hr/*" element={
          <Suspense fallback={<LoadingScreen />}>
            <HROnboardingRoutes />
          </Suspense>
        } />

        {/* Finance Management */}
        <Route path="finance">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<LoadingScreen />}>
              <FinanceDashboard />
            </Suspense>
          } />
          <Route path="student-fees" element={
            <Suspense fallback={<LoadingScreen />}>
              <StudentFees />
            </Suspense>
          } />
          <Route path="staff-payroll" element={
            <Suspense fallback={<LoadingScreen />}>
              <StaffPayroll />
            </Suspense>
          } />
          <Route path="expenses" element={
            <Suspense fallback={<LoadingScreen />}>
              <Expenses />
            </Suspense>
          } />
          <Route path="vendors" element={
            <Suspense fallback={<LoadingScreen />}>
              <Vendors />
            </Suspense>
          } />
          <Route path="budget" element={
            <Suspense fallback={<LoadingScreen />}>
              <BudgetAllocation />
            </Suspense>
          } />
          <Route path="maintenance" element={
            <Suspense fallback={<LoadingScreen />}>
              <Maintenance />
            </Suspense>
          } />
          <Route path="ai-assistant" element={
            <Suspense fallback={<LoadingScreen />}>
              <AIAssistant />
            </Suspense>
          } />
        </Route>

        {/* Payroll Management */}
        <Route path="payroll">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<LoadingScreen />}>
              <PayrollDashboard />
            </Suspense>
          } />
          <Route path="list" element={
            <Suspense fallback={<LoadingScreen />}>
              <PayrollList />
            </Suspense>
          } />
          <Route path="calculation" element={
            <Suspense fallback={<LoadingScreen />}>
              <PayrollCalculation />
            </Suspense>
          } />
          <Route path="approval" element={
            <Suspense fallback={<LoadingScreen />}>
              <HRApprovalWorkflow />
            </Suspense>
          } />
          <Route path="payslip" element={
            <Suspense fallback={<LoadingScreen />}>
              <PayslipGeneration />
            </Suspense>
          } />
          <Route path="notifications" element={
            <Suspense fallback={<LoadingScreen />}>
              <NotificationCenter />
            </Suspense>
          } />
        </Route>

        {/* Quality Management */}
        <Route path="quality">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<LoadingScreen />}>
              <QualityDashboard />
            </Suspense>
          } />
          <Route path="faculty" element={
            <Suspense fallback={<LoadingScreen />}>
              <QualityFaculty />
            </Suspense>
          } />
          <Route path="analytics" element={
            <Suspense fallback={<LoadingScreen />}>
              <QualityAnalytics />
            </Suspense>
          } />
          <Route path="audits" element={
            <Suspense fallback={<LoadingScreen />}>
              <QualityAudits />
            </Suspense>
          } />
          <Route path="grievances" element={
            <Suspense fallback={<LoadingScreen />}>
              <QualityGrievances />
            </Suspense>
          } />
          <Route path="policies" element={
            <Suspense fallback={<LoadingScreen />}>
              <QualityPolicies />
            </Suspense>
          } />
          <Route path="accreditation" element={
            <Suspense fallback={<LoadingScreen />}>
              <QualityAccreditation />
            </Suspense>
          } />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="finance" replace />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
