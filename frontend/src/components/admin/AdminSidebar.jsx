import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/adminSidebar.css';
// Import all icons from heroicons
import {
  // Outline Icons
  AcademicCapIcon,
  BanknotesIcon,
  BellAlertIcon,
  BookOpenIcon,
  BookmarkSquareIcon,
  CalculatorIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  KeyIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CalendarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentCheckIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  FireIcon,
  HomeIcon,
  LightBulbIcon,
  PencilSquareIcon,
  PhotoIcon,
  ServerIcon,
  ShieldCheckIcon,
  TrophyIcon,
  TruckIcon,
  UserCircleIcon,
  UserGroupIcon as UserGroupOutlineIcon,
  UserIcon,
  UserPlusIcon,
  WifiIcon,
  WrenchScrewdriverIcon,
  // Aliases for outline icons
  ChartBarIcon as ChartBarOutlineIcon,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckOutlineIcon,
  CurrencyDollarIcon as CurrencyDollarOutlineIcon,
  HomeIcon as HomeOutlineIcon,
  ShieldCheckIcon as ShieldCheckOutlineIcon
} from '@heroicons/react/24/outline';

// Solid Icons
import {
  BookOpenIcon as BookOpenSolidIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckSolidIcon,
  CurrencyDollarIcon as CurrencyDollarSolidIcon,
  HomeIcon as HomeSolidIcon,
  UserGroupIcon as UserGroupSolidIcon
} from '@heroicons/react/24/solid';

const AdminSidebar = () => {
  const location = useLocation();

  const [expandedSections, setExpandedSections] = useState({
    academic: location.pathname.startsWith('/admin/academic'),
    academics: location.pathname.startsWith('/admin/academics'),
    clubs: location.pathname.startsWith('/admin/academics/clubs'),
    infrastructure: location.pathname.startsWith('/admin/infrastructure'),
    it: location.pathname.startsWith('/admin/it'),
    sports: location.pathname.startsWith('/admin/sports'),
    hr: location.pathname.startsWith('/admin/hr'),
    finance: location.pathname.startsWith('/admin/finance'),
    payroll: location.pathname.startsWith('/admin/payroll'),
    quality: location.pathname.startsWith('/admin/quality')
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path, fullPath = null, exact = false) => {
    // If fullPath is provided, use it for exact matching
    if (fullPath) {
      return location.pathname === fullPath;
    }
    
    // For exact matching
    if (exact) {
      return location.pathname === `/admin/${path}`.replace(/\/+$/, '');
    }
    
    // Special case for analytics
    if (path === 'analytics') {
      return location.pathname.startsWith('/admin/analytics');
    }
    
    // For nested paths like 'results/staging', check if pathname contains the path
    if (path.includes('/')) {
      return location.pathname.includes(path);
    }
    
    // Special case for dashboard
    if (path === 'dashboard' || path === '') {
      return location.pathname === '/admin' || 
             location.pathname === '/admin/' || 
             location.pathname === '/admin/dashboard';
    }
    
    // For non-exact matching, check if the current path starts with the given path
    // but ensure we're not matching partial path segments
    const pathToCheck = `/admin/${path}`;
    return location.pathname === pathToCheck || 
           (location.pathname.startsWith(`${pathToCheck}/`) && path !== '');
  };

  const isExactActive = (path) => {
    // Remove any trailing slashes for consistent comparison
    const normalizedPathname = location.pathname.replace(/\/$/, '');
    const normalizedComparePath = `/admin/${path}`.replace(/\/$/, '');
    return normalizedPathname === normalizedComparePath;
  };

  const navItems = [
    { 
      name: 'Overview', 
      path: '',
      icon: ChartBarOutlineIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      exact: true
    },
    { 
      name: 'Dashboard', 
      path: 'dashboard',
      icon: HomeOutlineIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      exact: true
    },
    { 
      name: 'Student Management', 
      path: 'students',
      icon: UserGroupOutlineIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      exact: false,
      hasChildren: true,
      children: [
        { 
          name: 'All Students',
          path: 'students',
          fullPath: '/admin/students',
          exact: true
        },
        {
          name: 'Manage Credentials',
          path: 'students/credentials',
          fullPath: '/admin/students/credentials',
          icon: KeyIcon
        }
      ]
    },
    {
      name: 'Faculty Management',
      path: 'faculty',
      icon: UserCircleIcon,
      color: 'text-white',
      bgColor: 'bg-indigo-100',
      external: true,
      externalUrl: 'http://localhost:8082',
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Open faculty admin system on port 8082 in a new tab
        const newWindow = window.open('http://localhost:8082', '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null;
      }
    },
    {
      name: 'HR Onboarding',
      path: 'hr',
      icon: BriefcaseIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      hasChildren: true,
      children: [
        { name: 'Dashboard', path: 'hr', fullPath: '/admin/hr', icon: ChartBarIcon },
        { name: 'Registration', path: 'hr/registration', fullPath: '/admin/hr/registration', icon: PencilSquareIcon },
        { name: 'Documents', path: 'hr/documents', fullPath: '/admin/hr/documents', icon: DocumentDuplicateIcon },
        { name: 'Role Assignment', path: 'hr/role-assignment', fullPath: '/admin/hr/role-assignment', icon: UserPlusIcon },
        { name: 'Work Policy', path: 'hr/work-policy', fullPath: '/admin/hr/work-policy', icon: ShieldCheckIcon },
        { name: 'Salary Setup', path: 'hr/salary-setup', fullPath: '/admin/hr/salary-setup', icon: BanknotesIcon },
        { name: 'System Access', path: 'hr/system-access', fullPath: '/admin/hr/system-access', icon: ComputerDesktopIcon }
      ]
    },
    { 
      name: 'Academic Management', 
      path: 'academics',
      icon: AcademicCapIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      hasChildren: true,
      children: [
        { 
          name: 'Courses',
          path: 'courses',
          icon: BookOpenIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        { 
          name: 'Subjects',
          path: 'subjects',
          icon: BookmarkSquareIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        { 
          name: 'Exams', 
          path: 'exams',
          icon: ClipboardDocumentCheckOutlineIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        },
        { 
          name: 'Departments',
          path: 'departments',
          icon: BuildingOffice2Icon,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          fullPath: '/admin/academics/departments'
        },
        { 
          name: 'Marks Staging', 
          path: 'results/staging',
          icon: DocumentTextIcon,
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
          fullPath: '/admin/academics/results/staging'
        }
      ]
    },
    { 
      name: 'Attendance', 
      path: 'attendance',
      icon: CalendarDaysIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      name: 'Hostel', 
      path: 'hostel',
      icon: HomeOutlineIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Transport',
      path: 'transport',
      icon: TruckIcon,
      color: 'text-white',
      bgColor: 'bg-amber-100'
    },
    {
      name: 'Finance',
      path: 'finance',
      icon: CurrencyDollarOutlineIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      hasChildren: true,
      children: [
        {
          name: 'Dashboard',
          path: 'finance/dashboard',
          fullPath: '/admin/finance/dashboard'
        },
        {
          name: 'Student Fees',
          path: 'finance/student-fees',
          fullPath: '/admin/finance/student-fees'
        },
        {
          name: 'Staff Payroll',
          path: 'finance/staff-payroll',
          fullPath: '/admin/finance/staff-payroll'
        },
        {
          name: 'Expenses',
          path: 'finance/expenses',
          fullPath: '/admin/finance/expenses'
        },
        {
          name: 'Vendors',
          path: 'finance/vendors',
          fullPath: '/admin/finance/vendors'
        },
        {
          name: 'Budget Allocation',
          path: 'finance/budget',
          fullPath: '/admin/finance/budget'
        },
        {
          name: 'Maintenance',
          path: 'finance/maintenance',
          fullPath: '/admin/finance/maintenance'
        },
        {
          name: 'AI Assistant',
          path: 'finance/ai-assistant',
          fullPath: '/admin/finance/ai-assistant'
        }
      ]
    },
    {
      name: 'Payroll Management',
      path: 'payroll',
      icon: CurrencyDollarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      hasChildren: true,
      children: [
        {
          name: 'Dashboard',
          path: 'dashboard',
          fullPath: '/admin/payroll/dashboard',
          icon: ChartBarIcon
        },
        {
          name: 'Payroll List',
          path: 'list',
          fullPath: '/admin/payroll/list',
          icon: ClipboardDocumentCheckIcon
        },
        {
          name: 'Calculation',
          path: 'calculation',
          fullPath: '/admin/payroll/calculation',
          icon: Cog6ToothIcon
        },
        {
          name: 'Approval',
          path: 'approval',
          fullPath: '/admin/payroll/approval',
          icon: ClipboardDocumentCheckIcon
        },
        {
          name: 'Payslip',
          path: 'payslip',
          fullPath: '/admin/payroll/payslip',
          icon: DocumentTextIcon
        },
        {
          name: 'Notifications',
          path: 'notifications',
          fullPath: '/admin/payroll/notifications',
          icon: BellAlertIcon
        }
      ]
    },
    {
      name: 'Quality Management',
      path: 'quality',
      icon: ShieldCheckIcon,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      hasChildren: true,
      children: [
        {
          name: 'Dashboard',
          path: 'quality/dashboard',
          fullPath: '/admin/quality/dashboard',
          icon: ChartBarIcon
        },
        {
          name: 'Faculty',
          path: 'quality/faculty',
          fullPath: '/admin/quality/faculty',
          icon: UserGroupOutlineIcon
        },
        {
          name: 'Analytics',
          path: 'quality/analytics',
          fullPath: '/admin/quality/analytics',
          icon: ChartBarIcon
        },
        {
          name: 'Audits',
          path: 'quality/audits',
          fullPath: '/admin/quality/audits',
          icon: ClipboardDocumentCheckIcon
        },
        {
          name: 'Grievances',
          path: 'quality/grievances',
          fullPath: '/admin/quality/grievances',
          icon: BellAlertIcon
        },
        {
          name: 'Policies',
          path: 'quality/policies',
          fullPath: '/admin/quality/policies',
          icon: DocumentTextIcon
        },
        {
          name: 'Accreditation',
          path: 'quality/accreditation',
          fullPath: '/admin/quality/accreditation',
          icon: TrophyIcon
        }
      ]
    },
    {
      name: 'Fees',
      path: 'fees',
      icon: CurrencyDollarOutlineIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      name: 'Admissions',
      path: 'admissions',
      icon: UserGroupOutlineIcon,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
    {
      name: 'Clubs',
      path: 'clubs',
      icon: UserGroupOutlineIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      fullPath: '/admin/academics/clubs'
    },
    { 
      name: 'Infrastructure',
      path: 'infrastructure',
      icon: BuildingOffice2Icon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      hasChildren: true,
      children: [
        { 
          name: 'Overview', 
          path: 'infrastructure',
          fullPath: '/admin/infrastructure',
          exact: true
        },
        { 
          name: 'Campus Map', 
          path: 'campus-map',
          fullPath: '/admin/infrastructure/campus-map'
        },
        { 
          name: 'Classroom Allocation', 
          path: 'classroom-allocation',
          fullPath: '/admin/infrastructure/classroom-allocation'
        },
        { 
          name: 'Smart Classroom', 
          path: 'smart-classroom',
          fullPath: '/admin/infrastructure/smart-classroom'
        },
        { 
          name: 'Lab Equipment', 
          path: 'lab-equipment',
          fullPath: '/admin/infrastructure/lab-equipment'
        },
        { 
          name: 'Auditorium Booking', 
          path: 'auditorium',
          fullPath: '/admin/infrastructure/auditorium'
        }
      ]
    },
    { 
      name: 'Notifications', 
      path: 'notifications',
      icon: BellAlertIcon,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100'
    },
    { 
      name: 'AI Assistant', 
      path: 'ai-assistant',
      icon: CpuChipIcon,
      color: 'text-fuchsia-600',
      bgColor: 'bg-fuchsia-100'
    },
    {
      name: 'IT & Digital Services',
      path: 'it',
      icon: CpuChipIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      hasChildren: true,
      children: [
        { 
          name: 'WiFi Access', 
          path: 'it/wifi',
          icon: WifiIcon,
          fullPath: '/admin/it/wifi'
        },
        { 
          name: 'Device Management', 
          path: 'it/devices',
          icon: DevicePhoneMobileIcon,
          fullPath: '/admin/it/devices'
        },
        { 
          name: 'Computer Labs', 
          path: 'it/labs',
          icon: ComputerDesktopIcon,
          fullPath: '/admin/it/labs'
        },
        { 
          name: 'Software Licenses', 
          path: 'it/software',
          icon: ServerIcon,
          fullPath: '/admin/it/software'
        }
      ]
    },
    { 
      name: 'Sports & Recreation', 
      path: 'sports',
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      hasChildren: true,
      children: [
        { 
          name: 'Equipment Booking', 
          path: 'equipment',
          icon: WrenchScrewdriverIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          fullPath: '/admin/sports/equipment'
        },
        { 
          name: 'Ground Reservation', 
          path: 'grounds',
          icon: UserGroupSolidIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          fullPath: '/admin/sports/grounds'
        },
        { 
          name: 'Fitness Logs', 
          path: 'fitness',
          icon: FireIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          fullPath: '/admin/sports/fitness'
        },
        { 
          name: 'Event Tracker', 
          path: 'events',
          icon: CalendarDaysIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          fullPath: '/admin/sports/events'
        }
      ]
    },
    { 
      name: 'Analytics Dashboard', 
      path: 'analytics',
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      exact: false,
      hasChildren: true,
      children: [
        {
          name: 'Performance Analytics',
          path: 'analytics/performance',
          fullPath: '/admin/analytics/performance'
        },
        {
          name: 'Enrollment Analytics',
          path: 'analytics/enrollment',
          fullPath: '/admin/analytics/enrollment'
        },
        {
          name: 'Fee Analytics',
          path: 'analytics/fee',
          fullPath: '/admin/analytics/fee'
        }
      ]
    },
    { 
      name: 'Settings', 
      path: 'settings',
      icon: Cog6ToothIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ];

  // Filter out the Overview item from navigation
  const filteredNavItems = navItems.filter(item => item.name !== 'Overview');


  return (
    <div
      className="flex flex-col bg-[#1d395e] border-r border-gray-200 w-64 fixed left-0 top-0 z-40 h-screen admin-sidebar"
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-300 border-opacity-20">
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold text-white">Cube Arts</h1>
          <p className="text-xs text-gray-300">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {filteredNavItems.map((item) => (
            <div key={item.name}>
              {item.hasChildren ? (
                <>
                  <button
                    onClick={() => toggleSection(item.path.split('/')[0] || item.path)}
                    className={`group w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${
                      isActive(item.path) 
                        ? 'bg-white bg-opacity-20 font-semibold'
                        : 'hover:bg-[#2b4a74]'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon 
                        className="mr-3 h-6 w-6 flex-shrink-0 text-white" 
                        aria-hidden="true" 
                      />
                      {item.name}
                    </div>
                    {expandedSections[item.path.split('/')[0] || item.path] ? (
                      <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections[item.path.split('/')[0] || item.path] && item.children && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.fullPath || `/admin/${item.path}/${child.path}`}
                          className={`group flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${
                            isActive(child.path, child.fullPath)
                              ? 'bg-white bg-opacity-20 font-semibold'
                              : 'hover:bg-[#2b4a74]'
                          }`}
                        >
                          {child.icon && (
                            <child.icon
                              className="mr-3 h-5 w-5 flex-shrink-0 text-white"
                              aria-hidden="true"
                            />
                          )}
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : item.external ? (
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center px-4 py-3 text-sm font-medium text-white rounded-md ${
                    isActive(item.path, null, item.exact) 
                      ? 'bg-white bg-opacity-20 font-semibold'
                      : 'hover:bg-[#2b4a74]'
                  }`}
                >
                  <item.icon 
                    className="mr-3 h-6 w-6 flex-shrink-0 text-white" 
                    aria-hidden="true" 
                  />
                  {item.name}
                  <span className="ml-auto">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </span>
                </a>
              ) : (
                <Link
                  to={item.path.startsWith('http') ? '#' : `/admin/${item.path}`}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.path, null, item.exact)
                      ? 'text-white bg-opacity-20 font-semibold'
                      : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                  }`}
                  onClick={item.onClick}
                  target={item.external ? '_blank' : '_self'}
                  rel={item.external ? 'noopener noreferrer' : ''}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      isActive(item.path, null, item.exact) ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Profile - Compact */}
      <div className="p-2 border-t border-gray-100 mt-auto border-opacity-20">
        <div className="flex items-center">
          <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-xs font-medium">AU</span>
          </div>
          <div className="ml-2 overflow-hidden">
            <p className="text-xs font-medium text-gray-200 truncate">Admin User</p>
            <p className="text-[10px] text-gray-400 truncate">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
