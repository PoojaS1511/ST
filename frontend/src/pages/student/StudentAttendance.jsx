import React, { useState, useEffect } from 'react';
import { useStudent } from '../../contexts/StudentContext';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  AcademicCapIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { getStudentAttendance, getAttendanceStatistics } from '../../services/attendanceService';

const StudentAttendance = () => {
  const { student } = useStudent();
  const [attendanceData, setAttendanceData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalClasses: 0,
    presentCount: 0,
    absentCount: 0,
    attendancePercentage: 0,
    bySubject: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'month', 'week'
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Fetch attendance data
  useEffect(() => {
    const fetchData = async () => {
      if (!student?.id) return;
      
      try {
        setLoading(true);
        
        // Calculate date range
        let startDate, endDate;
        const today = new Date();
        
        if (timeRange === 'month') {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        } else if (timeRange === 'week') {
          const firstDay = today.getDate() - today.getDay(); // Sunday
          startDate = new Date(today.setDate(firstDay)).toISOString().split('T')[0];
          endDate = new Date(today.setDate(today.getDate() + 6)).toISOString().split('T')[0];
        }
        
        // Fetch attendance records
        const [records, stats] = await Promise.all([
          getStudentAttendance(student.id, { 
            startDate: timeRange === 'all' ? undefined : startDate,
            endDate: timeRange === 'all' ? undefined : endDate,
            subjectId: selectedSubject === 'all' ? undefined : selectedSubject
          }),
          getAttendanceStatistics(student.id)
        ]);
        
        setAttendanceData(records);
        setStatistics(stats);
        setError(null);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [student?.id, timeRange, selectedSubject]);
  
  // Get unique subjects for filter
  const subjects = React.useMemo(() => {
    const subjectSet = new Set();
    attendanceData.forEach(record => {
      if (record.subject) {
        subjectSet.add(JSON.stringify({
          id: record.subject_id,
          name: record.subject,
          code: record.subjectCode
        }));
      }
    });
    return Array.from(subjectSet).map(s => JSON.parse(s));
  }, [attendanceData]);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading student data...</div>
      </div>
    );
  }
  
  const { totalClasses, presentCount, absentCount, attendancePercentage } = statistics;

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and track your attendance records
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div>
              <label htmlFor="time-range" className="sr-only">Time Range</label>
              <select
                id="time-range"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="subject-filter" className="sr-only">Filter by Subject</label>
              <select
                id="subject-filter"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-sm font-medium">Total Classes</h2>
            </div>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {presentCount}
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <h2 className="text-sm font-medium">Absent</h2>
            </div>
            <p className="text-2xl font-bold text-red-700 mt-2">
              {absentCount}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-sm font-medium">Attendance %</h2>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-2xl font-bold text-purple-700">
                {attendancePercentage}%
              </span>
              <span className={`ml-2 text-xs font-medium ${attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                {attendancePercentage >= 75 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Attendance by Subject */}
        {Object.keys(statistics.bySubject).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance by Subject</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(statistics.bySubject).map(([subjectId, subjectData]) => (
                <div key={subjectId} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{subjectData.name}</h3>
                      <p className="text-sm text-gray-500">
                        {subjectData.present} of {subjectData.total} classes
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      subjectData.percentage >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subjectData.percentage}%
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${subjectData.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${subjectData.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Attendance */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Attendance</h2>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setTimeRange('all')}
            >
              View All
            </button>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {attendanceData.length > 0 ? (
                attendanceData.slice(0, 5).map((record) => (
                  <li key={`${record.id}-${record.date}-${record.subject_id}`}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            record.status === 'present' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {record.status === 'present' ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{record.subject}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                weekday: 'short'
                              })}
                              {record.classTime && ` • ${record.classTime}`}
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-2 text-sm text-gray-500">
                          <p>{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 sm:px-6 text-center text-gray-500">
                  No attendance records found for the selected filters.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
