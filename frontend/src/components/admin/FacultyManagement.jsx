import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import FacultyForm from './FacultyForm';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setEditFaculty(null);
    setShowForm(false);
  };

  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (editFaculty) {
        // For updates
        const updateData = { ...data };
        delete updateData.password; // Password updates handled separately if needed
        response = await apiService.update(`/faculty/${editFaculty.id}`, updateData);
      } else {
        // For new faculty
        response = await apiService.post('/faculty', data);
      }

      if (response) {
        alert(`Faculty ${editFaculty ? 'updated' : 'created'} successfully`);
        resetForm();
        fetchFaculty();
      }
    } catch (error) {
      console.error('Error saving faculty:', error);
      setError(error.response?.data?.message || 'Failed to save faculty. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Fetch faculty and departments on component mount
  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await apiService.getAllFaculty();
      if (response && Array.isArray(response)) {
        // Direct array response from getFaculty()
        setFaculty(response);
      } else if (response && response.success) {
        // Legacy response format with success/data structure
        setFaculty(response.data);
      } else {
        setFaculty([]);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setError('Failed to load faculty data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getAllDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments');
    }
  };

  const handleAddFaculty = () => {
    setEditFaculty(null);
    setShowForm(true);
  };

  const handleEditFaculty = (facultyMember) => {
    setEditFaculty(facultyMember);
    setShowForm(true);
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        setFormLoading(true);
        const response = await apiService.deleteFaculty(facultyId);
        if (response.success) {
          alert('Faculty member deleted successfully!');
          fetchFaculty();
        }
      } catch (error) {
        console.error('Error deleting faculty:', error);
        setError('Failed to delete faculty member');
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditFaculty(null);
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading faculty..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right font-bold text-red-700"
          >
            &times;
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
              <p className="text-gray-600 mt-1">Manage faculty members and staff</p>
            </div>
            <button
              onClick={handleAddFaculty}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              disabled={formLoading}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Faculty
            </button>
          </div>
        </div>

        {/* Faculty Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faculty.length > 0 ? (
                faculty.map((facultyMember) => (
                  <tr key={facultyMember.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {facultyMember.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {facultyMember.employee_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {facultyMember.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {facultyMember.departments?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {facultyMember.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          facultyMember.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : facultyMember.status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {facultyMember.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditFaculty(facultyMember)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        disabled={formLoading}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaculty(facultyMember.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={formLoading}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No faculty members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Faculty Form Modal */}
      {showForm && (
        <FacultyForm
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          departments={departments}
          initialValues={editFaculty || {}}
          formLoading={formLoading}
          isEdit={false} // Always set to false to show password fields for all faculty
        />
      )}
    </div>
  );
};

export default FacultyManagement;