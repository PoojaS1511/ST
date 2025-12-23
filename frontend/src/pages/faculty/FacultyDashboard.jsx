import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const FacultyDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">Faculty Portal</h1>
        </div>
        <nav className="mt-4">
          <Link to="/faculty" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link to="/faculty/courses" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            My Courses
          </Link>
          <Link to="/faculty/attendance" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            Attendance
          </Link>
          <Link to="/faculty/grades" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            Gradebook
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-gray-800">Faculty Dashboard</h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <span className="sr-only">Notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">F</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
