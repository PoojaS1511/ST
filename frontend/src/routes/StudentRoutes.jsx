import { Routes, Route } from 'react-router-dom';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../components/student/StudentProfile';
import StudentAttendance from '../components/student/StudentAttendance';
import StudentMarks from '../components/student/StudentMarks';
import StudentTimetable from '../components/student/StudentTimetable';
import StudentFees from '../components/student/StudentFees';
import StudentExaminations from '../components/student/StudentExaminations';
import StudentHostel from '../components/student/StudentHostel';
import StudentTransport from '../components/student/StudentTransport';
import StudentCalendar from '../components/student/StudentCalendar';
import StudentNotifications from '../components/student/StudentNotifications';
import StudentInternships from '../components/student/StudentInternships';
import StudentCareerInsights from '../components/student/StudentCareerInsights';
import StudentCareerAssistant from '../components/student/StudentCareerAssistant';
import StudentSettings from '../components/student/StudentSettings';
import Resume from '../pages/student/Resume';
import StudentAcademicOverview from '../components/student/StudentAcademicOverview';
import CareerPrepCourses from '../components/student/CareerPrepCourses';

// Create a layout component for career-related routes
const CareerLayout = ({ children }) => (
  <div className="career-layout">
    {children}
  </div>
);

const StudentRoutes = () => {
  return (
    <Routes>
      <Route index element={<StudentProfile />} />
      <Route path="dashboard" element={<StudentProfile />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="academic" element={<StudentAcademicOverview />} />
      <Route path="attendance" element={<StudentAttendance />} />
      <Route path="marks" element={<StudentMarks />} />
      <Route path="timetable" element={<StudentTimetable />} />
      <Route path="fees" element={<StudentFees />} />
      <Route path="examinations" element={<StudentExaminations />} />
      <Route path="hostel" element={<StudentHostel />} />
      <Route path="transport" element={<StudentTransport />} />
      <Route path="calendar" element={<StudentCalendar />} />
      <Route path="notifications" element={<StudentNotifications />} />
      <Route path="settings" element={<StudentSettings />} />
      
      {/* Nested career routes */}
      <Route path="career">
        <Route index element={<StudentCareerInsights />} />
        <Route path="insights" element={<StudentCareerInsights />} />
        <Route path="resume" element={<Resume />} />
        <Route path="internships" element={<StudentInternships />} />
        <Route 
          path="courses" 
          element={
            <Suspense fallback={<div>Loading career courses...</div>}>
              <CareerPrepCourses />
            </Suspense>
          } 
        />
        <Route path="assistant" element={<StudentCareerAssistant />} />
      </Route>
      
      {/* Keep backward compatibility for old routes */}
      <Route path="resume" element={<Resume />} />
      <Route path="internships" element={<StudentInternships />} />
      <Route path="career-assistant" element={<StudentCareerAssistant />} />
      <Route path="career-insights" element={<StudentCareerInsights />} />
    </Routes>
  );
};

export default StudentRoutes;
