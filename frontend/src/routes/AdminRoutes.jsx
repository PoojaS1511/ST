import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AdminDashboard from '../pages/admin/AdminDashboard';

// Core Components
import AdminOverview from '../components/admin/AdminOverview';
import StudentManagement from '../components/admin/StudentManagement';
import AddStudent from '../components/admin/AddStudent';
import StudentCredentials from '../components/admin/StudentCredentials';
import FeesList from '../components/admin/FeesListWithErrorBoundary';
import FeeDetail from '../components/admin/FeeDetail';
import PaymentForm from '../components/admin/PaymentForm';
import FeeManagement from '../components/admin/FeeManagement';
import NewFeeForm from '../components/admin/NewFeeForm';
import NotificationManagement from '../pages/admin/notifications/NotificationManagement';
import AttendanceManagement from '../components/admin/AttendanceManagement';
import MarksEntry from '../components/admin/MarksEntry';
import Admissions from '../components/admin/Admissions';
import HostelManagement from '../components/admin/HostelManagement';
import ReportsAnalytics from '../components/admin/ReportsAnalytics';
import AIAssistant from '../components/admin/AIAssistant';
import Settings from '../components/admin/Settings';
import TestComponent from '../components/admin/TestComponent';

// Faculty
import FacultyDashboard from '../pages/faculty/admin faculty/admin/Dashboard';
import FacultyManagement from '../pages/faculty/admin faculty/admin/FacultyManagement';
import FacultyAttendance from '../pages/faculty/admin faculty/admin/Attendance';
// Infrastructure & Facilities
import FacilitiesManagement from '../pages/admin/FacilitiesManagement';
import InfrastructureFacilities from '../pages/admin/infrastructure/InfrastructureFacilities';
import CampusMap from '../pages/admin/infrastructure/CampusMap';
import ClassroomAllocation from '../pages/admin/infrastructure/ClassroomAllocation';
import SmartClassroomTracking from '../pages/admin/infrastructure/SmartClassroomTracking';
import LabEquipmentManagement from '../pages/admin/infrastructure/LabEquipmentManagement';
import AuditoriumBooking from '../pages/admin/infrastructure/AuditoriumBooking';

// Academic
import AcademicSupport from '../pages/admin/academic/AcademicSupport';
import LibraryManagement from '../pages/admin/academic/LibraryManagement';
import LaboratoryScheduling from '../pages/admin/academic/LaboratoryScheduling';
import LibraryScheduling from '../pages/admin/academic/LibraryScheduling';
import ITCResearch from '../pages/admin/academic/ITCResearch';
import StudentSupport from '../pages/admin/academic/StudentSupport';
import ResearchInnovation from '../pages/admin/academic/ResearchInnovation';
import LibraryCatalog from '../pages/admin/academic/library/LibraryCatalog';
import LibraryLoans from '../pages/admin/academic/library/LibraryLoans';
import LibraryFines from '../pages/admin/academic/library/LibraryFines';
import LibraryMembers from '../pages/admin/academic/library/LibraryMembers';
import LibraryReservations from '../pages/admin/academic/library/LibraryReservations';

// Health & Safety
import HealthSafety from '../pages/admin/health/HealthSafety';
import HealthCenter from '../pages/admin/health/HealthCenter';
import Security from '../pages/admin/health/Security';
import LostFound from '../pages/admin/health/LostFound';
import SecurityDashboard from '../pages/admin/security/SecurityDashboard';

// Sports & Recreation
import SportsManagement from '../pages/admin/sports/SportsManagement';
import EquipmentBooking from '../pages/admin/sports/EquipmentBooking';
import GroundReservation from '../pages/admin/sports/GroundReservation';
import FitnessLog from '../pages/admin/sports/FitnessLog';
import EventTracker from '../pages/admin/sports/EventTracker';

// IT & Digital Services
import ITDigitalServices from '../pages/admin/it/ITDigitalServices';
import WifiAccess from '../pages/admin/it/WifiAccess';
import DeviceManagement from '../pages/admin/it/DeviceManagement';
import ComputerLabs from '../pages/admin/it/ComputerLabs';
import SoftwareLicenses from '../pages/admin/it/SoftwareLicenses';

// Academic Management
import Departments from '../components/academics/Departments';
import Courses from '../components/academics/Courses';
import Subjects from '../components/academics/Subjects';
import Exams from '../components/academics/Exams';
import StudentResults from '../components/academics/StudentResults';
import MarksStagingResults from '../components/academics/MarksStagingResults';
import ExamAnalytics from '../pages/admin/academics/ExamAnalytics';

// Clubs
import ClubsDashboard from '../components/admin/clubs/ClubsDashboard';
import ClubMembers from '../components/admin/clubs/ClubMembers';
import ClubEvents from '../components/admin/clubs/ClubEvents';
import ClubGallery from '../components/admin/clubs/ClubGallery';
import ClubAwards from '../components/admin/clubs/ClubAwards';
import ClubForm from '../components/admin/clubs/ClubForm';
import ResumeUpload from '../components/student/ResumeUpload';
import RealReportsAnalytics from '../pages/admin/analytics/RealReportsAnalytics';
import AnalyticsDashboard from '../pages/admin/analytics/AnalyticsDashboard';
import AdmissionAnalytics from '../pages/admin/analytics/AdmissionAnalytics';
import PerformanceAnalytics from '../pages/admin/analytics/PerformanceAnalytics';
import FeeAnalytics from '../pages/admin/analytics/FeeAnalytics';
import EnrollmentAnalytics from '../pages/admin/analytics/EnrollmentAnalytics';
import UtilizationAnalytics from '../pages/admin/analytics/UtilizationAnalytics';

const AdminRoutes = () => {
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
        
        {/* Notifications */}
        <Route path="notifications" element={<NotificationManagement />} />
        
        {/* Faculty Management */}
        <Route path="faculty">
          <Route index element={<FacultyDashboard />} />
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="management" element={<FacultyManagement />} />
          <Route path="attendance" element={<FacultyAttendance />} />
        </Route>
        
        {/* Test Route */}
        <Route 
          path="test-attendance" 
          element={
            <div className="p-4 bg-yellow-100 border border-yellow-500 rounded">
              <h1 className="text-2xl font-bold mb-4">Test Route - This should appear</h1>
              <p>If you can see this, routing is working!</p>
              <button 
                onClick={() => alert('Test button clicked!')}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Button
              </button>
            </div>
          } 
        />
        
        {/* Attendance Management */}
        <Route path="attendance" element={<AttendanceManagement />} />
        
        {/* Admissions */}
        <Route path="admissions" element={<Admissions />} />
        
        {/* Infrastructure */}
        <Route path="infrastructure">
          <Route index element={<InfrastructureFacilities />} />
          <Route path="campus-map" element={<CampusMap />} />
          <Route path="classroom-allocation" element={<ClassroomAllocation />} />
          <Route path="smart-classroom" element={<SmartClassroomTracking />} />
          <Route path="lab-equipment" element={<LabEquipmentManagement />} />
          <Route path="auditorium" element={<AuditoriumBooking />} />
        </Route>
        
        {/* Academic Support */}
        <Route path="academic">
          <Route index element={<AcademicSupport />} />
          
          {/* Library Routes */}
          <Route path="library" element={<LibraryManagement />}>
            <Route index element={<Navigate to="catalog" replace />} />
            <Route path="catalog" element={<LibraryCatalog />} />
            <Route path="loans" element={<LibraryLoans />} />
            <Route path="fines" element={<LibraryFines />} />
            <Route path="members" element={<LibraryMembers />} />
            <Route path="reservations" element={<LibraryReservations />} />
            <Route path="scheduling" element={<LibraryScheduling />} />
          </Route>
          
          {/* Other Academic Routes */}
          <Route path="laboratories" element={<LaboratoryScheduling />} />
          <Route path="itc-research" element={<ITCResearch />} />
          <Route path="student-support" element={<StudentSupport />} />
          <Route path="research" element={<ResearchInnovation />} />
        </Route>
        
        {/* Health & Safety */}
        <Route path="health">
          <Route index element={<HealthSafety />} />
          <Route path="health-center" element={<HealthCenter />} />
          <Route path="lost-found" element={<LostFound />} />
        </Route>
        
        {/* Security */}
        <Route path="security">
          <Route index element={<SecurityDashboard />} />
          <Route path="incidents" element={<Security />} />
        </Route>
        
        {/* Facilities Management */}
        <Route path="facilities" element={<FacilitiesManagement />} />
        
        {/* Hostel */}
        <Route path="hostel" element={<HostelManagement />} />
        
        {/* Main Analytics Dashboard */}
        <Route path="analytics" element={<AnalyticsDashboard />}>
          <Route index element={<Navigate to="performance" replace />} />
          <Route path="performance" element={<PerformanceAnalytics />} />
          <Route path="fee" element={<FeeAnalytics />} />
          <Route path="admission" element={<AdmissionAnalytics />} />
          <Route path="enrollment" element={<EnrollmentAnalytics />} />
          <Route path="utilization" element={<UtilizationAnalytics />} />
        </Route>
        
        {/* Redirect all old report paths to the new analytics dashboard */}
        <Route path="reports" element={<Navigate to="/admin/analytics/admission" replace />} />
        <Route path="reports/*" element={<Navigate to="/admin/analytics/admission" replace />} />
        <Route path="real-reports" element={<Navigate to="/admin/analytics/admission" replace />} />
        <Route path="real-reports/*" element={<Navigate to="/admin/analytics/admission" replace />} />
        
        {/* AI Assistant */}
        <Route path="ai-assistant" element={<AIAssistant />} />
        
        {/* Settings */}
        <Route path="settings" element={<Settings />} />
        
        {/* Sports & Recreation */}
        <Route path="sports">
          <Route index element={<SportsManagement />} />
          <Route path="equipment" element={<EquipmentBooking />} />
          <Route path="grounds" element={<GroundReservation />} />
          <Route path="fitness" element={<FitnessLog />} />
          <Route path="events" element={<EventTracker />} />
        </Route>
        
        {/* IT & Digital Services */}
        <Route path="it">
          <Route index element={<ITDigitalServices />} />
          <Route path="wifi" element={<WifiAccess />} />
          <Route path="devices" element={<DeviceManagement />} />
          <Route path="labs" element={<ComputerLabs />} />
          <Route path="software" element={<SoftwareLicenses />} />
        </Route>
        
        {/* Academics */}
        <Route path="academics">
          <Route index element={<Navigate to="departments" replace />} />
          <Route path="departments" element={<Departments />} />
          <Route path="courses" element={<Courses />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exam-analytics" element={<ExamAnalytics />} />
          <Route path="results">
            <Route index element={<StudentResults />} />
            <Route path="staging" element={<MarksStagingResults />} />
          </Route>
          <Route path="marks" element={<MarksEntry />} />
        </Route>
        
        {/* Clubs & Activities */}
        <Route path="clubs">
          <Route index element={<ClubsDashboard />} />
          <Route path="new" element={<ClubForm />} />
          <Route path=":clubId/members" element={<ClubMembers />} />
          <Route path=":clubId/events" element={<ClubEvents />} />
          <Route path=":clubId/gallery" element={<ClubGallery />} />
          <Route path=":clubId/awards" element={<ClubAwards />} />
          <Route path=":clubId/edit" element={<ClubForm />} />
        </Route>
        
        {/* Test Component */}
        <Route path="test" element={<TestComponent />} />
        
        {/* Resume Analyzer */}
        <Route path="resume-analyzer" element={<ResumeUpload />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
