import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { examService } from '../../services/examService';
import { 
  DocumentArrowDownIcon, 
  CalendarIcon, 
  ClockIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const StudentExaminations = () => {
  const { user } = useAuth()
  
  // Log user data for debugging
  useEffect(() => {
    console.log('Current user data:', {
      id: user?.id,
      email: user?.email,
      department_id: user?.department_id,
      semester: user?.semester,
      role: user?.role,
      rawUser: user
    });
  }, [user]);
  
  const [examSchedule, setExamSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('schedule') // schedule, hallticket

  useEffect(() => {
    fetchExamData()
  }, [user])

  const fetchExamData = async () => {
    try {
      if (!user) {
        console.log('No user found');
        return;
      }
      
      // Get department_id and semester from the user object
      const userDepartmentId = user.department_id || user.current_department_id;
      const userSemester = user.semester || user.current_semester || 1; // Default to 1 if not found
      
      console.log('Fetching exam data for user:', {
        userId: user.id,
        email: user.email,
        departmentId: userDepartmentId,
        semester: userSemester,
        rawUser: user // Log the entire user object for debugging
      });
      
      setLoading(true);
      
      // Fetch all exams
      const allExams = await examService.getAllExams();
      console.log('All exams from API:', allExams);
      
      if (!allExams || allExams.length === 0) {
        console.log('No exams found in the system');
        setExamSchedule([]);
        setExamResults([]);
        return;
      }
      
      // Filter exams for the current student's department and semester
      const studentExams = allExams.filter(exam => {
        // If department_id is missing, we'll show all exams for the semester
        const departmentMatch = !userDepartmentId || exam.department_id === userDepartmentId;
        // If semester is missing, we'll show all semesters
        const semesterMatch = !userSemester || exam.semester === userSemester;
        
        const matches = departmentMatch && semesterMatch && 
                       (!exam.end_date || new Date(exam.end_date) >= new Date());
        
        console.log(`Exam ${exam.id} - Department: ${exam.department_id} (${exam.department_id === user.department_id ? 'match' : 'no match'}), ` +
                   `Semester: ${exam.semester} (${exam.semester === user.semester ? 'match' : 'no match'}), ` +
                   `End Date: ${exam.end_date} (${new Date(exam.end_date) >= new Date() ? 'upcoming' : 'past'})`);
        
        return matches;
      });
      
      console.log('Filtered student exams:', studentExams);
      
      if (studentExams.length === 0) {
        console.log('No matching exams found for the current student');
        setExamSchedule([]);
        setExamResults([]);
        return;
      }
      
      // Format the exam data for display
      const formattedExams = studentExams.map(exam => {
        const formatted = {
          id: exam.id,
          exam_date: exam.start_date,
          start_date: exam.start_date,
          end_date: exam.end_date,
          exam_type: exam.exam_type || 'Regular',
          name: exam.subject?.name || exam.name || 'Unnamed Exam',
          subject_id: exam.subject_id,
          subject_code: exam.subject?.code || `SUBJ${exam.subject_id}`,
          hall_number: exam.hall_number || 'To be announced',
          total_marks: exam.total_marks || 100,
          academic_year: exam.academic_year || '2023-24',
          semester: exam.semester || user.semester,
          department_id: exam.department_id,
          // Add raw exam data for debugging
          _raw: exam
        };
        
        console.log('Formatted exam:', formatted);
        return formatted;
      });
      
      setExamSchedule(formattedExams);
      
      
    } catch (error) {
      console.error('Error in fetchExamData:', {
        error,
        message: error.message,
        stack: error.stack
      });
      toast.error('Failed to load exam data. Please try again later.');
    } finally {
      console.log('Finished loading exam data');
      setLoading(false);
    }
  }


  const downloadHallTicket = async (examId) => {
    // Don't proceed if already loading
    if (loading) return;

    try {
      if (!user) {
        toast.error('You must be logged in to download hall tickets');
        return;
      }

      // Get the student ID from the user object
      const studentId = user.id;

      // Show loading state
      setLoading(true);
      toast.info('Generating hall ticket...');

      console.log(`Generating hall ticket for student ${studentId}, exam ${examId}...`);

      // Call our backend API to get the hall ticket PDF
      // Pass student_id as query parameter for public access
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/student_dashboard/hall-ticket?exam_id=${examId}&student_id=${studentId}`;
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        }
      });

      if (!response.ok) {
        // Try to parse error as JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.error || `Failed to generate hall ticket: HTTP ${response.status}`);
        } else {
          throw new Error(`Failed to generate hall ticket: HTTP ${response.status}`);
        }
      }

      // Get the PDF blob
      const blob = await response.blob();
      console.log('Hall ticket PDF received, size:', blob.size);

      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `hall_ticket_${examId}.pdf`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Also open in new tab for viewing
      window.open(blobUrl, '_blank');

      // Clean up the blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      toast.success('Hall ticket downloaded successfully!');

    } catch (error) {
      console.error('Error in downloadHallTicket:', error);
      
      // Handle specific error cases
      if (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')) {
        // Redirect to login if unauthorized
        window.location.href = '/login?session_expired=1&redirect=' + encodeURIComponent(window.location.pathname);
      } else if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
        toast.error('The requested hall ticket was not found or is no longer available.');
      } else if (error.message.includes('500') || error.message.toLowerCase().includes('server')) {
        toast.error('A server error occurred. Please try again later or contact support if the problem persists.');
      } else {
        toast.error(error.message || 'Failed to download hall ticket. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-royal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading exam schedule...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Examinations</h2>
        <p className="text-gray-600">Exam schedules and hall ticket downloads</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-royal-500 text-royal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Exam Schedule
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hallticket'
                  ? 'border-royal-500 text-royal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('hallticket')}
            >
              Hall Ticket
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Exam Schedule</h3>
                  {examSchedule.length > 0 && (
                    <span className="text-sm text-gray-600">
                      Semester {examSchedule[0].semester} • Academic Year {examSchedule[0].academic_year}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600">Semester 5 • Academic Year 2024-25</span>
              </div>

              {examSchedule.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No exam schedule available yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Please check back later or contact your department.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hall
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {examSchedule.map((exam) => {
                          const startDate = new Date(exam.start_date);
                          const endDate = new Date(exam.end_date);
                          const durationHours = Math.round((endDate - startDate) / (1000 * 60 * 60));
                          
                          return (
                            <tr key={exam.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {startDate.toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {exam.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {exam.exam_type} • {exam.total_marks || 100} marks
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {exam.subject_code}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {durationHours} {durationHours === 1 ? 'hour' : 'hours'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  exam.hall_number 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {exam.hall_number || 'TBA'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => downloadHallTicket(exam.id)}
                                  className="text-royal-600 hover:text-royal-900 flex items-center"
                                  disabled={loading}
                                  title="Download Hall Ticket"
                                >
                                  <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                                  <span className="sr-only">Download Hall Ticket</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Exam Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Exam Instructions:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Report to the exam hall 15 minutes before the scheduled time</li>
                  <li>• Bring your hall ticket and ID card</li>
                  <li>• Mobile phones and electronic devices are not allowed</li>
                  <li>• Use only blue/black pen for writing</li>
                  <li>• Follow all COVID-19 safety protocols</li>
                </ul>
              </div>
            </div>
          )}

          {/* Hall Ticket Tab */}
          {activeTab === 'hallticket' && (
            <div className="space-y-6">
              <div className="text-center">
                <AcademicCapIcon className="h-16 w-16 text-royal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hall Ticket Download</h3>
                <p className="text-gray-600 mb-6">
                  Download your hall ticket for the upcoming examinations
                </p>
                
                {console.log('Exam Schedule:', examSchedule)}
                
                {examSchedule && examSchedule.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Hall Tickets</h4>
                      <ul className="space-y-4">
                        {examSchedule.map((exam) => (
                          <li key={exam.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-base font-medium text-gray-900">{exam.exam_name}</p>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                                  <span className="mx-2">•</span>
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  <span>{exam.exam_time}</span>
                                  <span className="mx-2">•</span>
                                  <span>Room: {exam.room_number}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  console.log('Downloading hall ticket for exam:', exam);
                                  downloadHallTicket(exam.id);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-black text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
                              >
                                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                Download Hall Ticket
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          No upcoming exams found. Hall tickets will be available once the exam schedule is published.
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-yellow-600">
                            If you believe this is an error, please contact the examination department.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Important Notes:</h4>
                    <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                      <li>• Hall ticket will be available 1 week before exams</li>
                      <li>• Ensure all fee payments are completed</li>
                      <li>• Contact admin if you face any issues downloading</li>
                      <li>• Carry a printed copy to the examination hall</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentExaminations
