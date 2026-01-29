import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  CakeIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  BellAlertIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const HostelManagement = () => {
  const [activeTab, setActiveTab] = useState('rooms')

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
        <p className="text-gray-600">Manage room allocations, wardens, and hostel operations</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Announcements Card */}
        <div 
          onClick={() => navigate('/admin/hostel/announcements')}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <BellAlertIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Announcements</h3>
              <p className="text-sm text-gray-500">Manage hostel announcements</p>
            </div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </div>

        {/* Menu Items Management Card */}
        <div 
          onClick={() => navigate('/admin/hostel/menu-items')}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <ClipboardDocumentCheckIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Menu Items Management</h3>
              <p className="text-sm text-gray-500">Manage hostel menu items and specials</p>
            </div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </div>

        {/* Food Menu Card */}
        <div 
          onClick={() => navigate('/admin/hostel/food-menu')}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-lg mr-4">
              <CakeIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Food Menu</h3>
              <p className="text-sm text-gray-500">Manage weekly meal plans</p>
            </div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </div>

        {/* Hostel Rules Card */}
        <div 
          onClick={() => navigate('/admin/hostel/rules')}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Hostel Rules</h3>
              <p className="text-sm text-gray-500">Manage hostel rules and regulations</p>
            </div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </div>

        {/* Allocations Card */}
        <div 
          onClick={() => navigate('/admin/hostel/allocations')}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Room Allocations</h3>
              <p className="text-sm text-gray-500">Manage student room and bed allocations</p>
            </div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </div>

        {/* Polls Management Card */}
        <div 
          onClick={() => navigate('/admin/hostel/polls')}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg mr-4">
              <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Polls Management</h3>
              <p className="text-sm text-gray-500">Create and manage hostel polls and surveys</p>
            </div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rooms' ? 'border-royal-500 text-royal-600' : 'border-transparent text-gray-500'
              }`}
            >
              Room Management
            </button>
            <button
              onClick={() => setActiveTab('wardens')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wardens' ? 'border-royal-500 text-royal-600' : 'border-transparent text-gray-500'
              }`}
            >
              Warden Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports' ? 'border-royal-500 text-royal-600' : 'border-transparent text-gray-500'
              }`}
            >
              Occupancy Reports
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'rooms' && (
            <div className="text-center py-12">
              <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Room allocation and management interface</p>
            </div>
          )}

          {activeTab === 'wardens' && (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Warden assignment and contact management</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Hostel occupancy and utilization reports</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HostelManagement
