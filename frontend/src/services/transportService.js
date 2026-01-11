import { supabase } from '../lib/supabase';
import { API_URL } from '../config';

class TransportService {
  // Helper method for API calls
  static async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // This is important for CORS with credentials
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error;
    }
  }
  // ====================================
  // DASHBOARD METRICS
  // ====================================

  static async getDashboardMetrics() {
    try {
      return await this.apiCall('/transport/dashboard/metrics');
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // STUDENT MANAGEMENT
  // ====================================

  static async getTransportStudents(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/transport/students${queryString ? '?' + queryString : ''}`;
      return await this.apiCall(endpoint);
    } catch (error) {
      console.error('Error fetching transport students:', error);
      return { success: false, error: error.message };
    }
  }

  static async addTransportStudent(studentData) {
    try {
      return await this.apiCall('/transport/students', {
        method: 'POST',
        body: JSON.stringify(studentData),
      });
    } catch (error) {
      console.error('Error adding transport student:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateTransportStudent(id, updates) {
    try {
      return await this.apiCall(`/transport/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating transport student:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteTransportStudent(id) {
    try {
      return await this.apiCall(`/transport/students/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting transport student:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // FACULTY MANAGEMENT
  // ====================================

  static async getTransportFaculty(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/transport/faculty${queryString ? '?' + queryString : ''}`;
      return await this.apiCall(endpoint);
    } catch (error) {
      console.error('Error fetching transport faculty:', error);
      return { success: false, error: error.message };
    }
  }

  static async addTransportFaculty(facultyData) {
    try {
      return await this.apiCall('/transport/faculty', {
        method: 'POST',
        body: JSON.stringify(facultyData),
      });
    } catch (error) {
      console.error('Error adding transport faculty:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateTransportFaculty(id, updates) {
    try {
      return await this.apiCall(`/transport/faculty/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating transport faculty:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteTransportFaculty(id) {
    try {
      return await this.apiCall(`/transport/faculty/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting transport faculty:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // BUS MANAGEMENT
  // ====================================

  static async getBuses(filters = {}) {
    try {
      const mockBuses = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        bus_number: `TN-09-AB-${String(1234 + i).padStart(4, '0')}`,
        route_id: `RT-${String((i % 15) + 1).padStart(2, '0')}`,
        route_name: `Route ${(i % 15) + 1}`,
        capacity: [40, 45, 50, 55][i % 4],
        driver_id: i + 1,
        driver_name: `Driver ${i + 1}`,
        status: i % 8 === 0 ? 'Under Maintenance' : i % 10 === 0 ? 'Inactive' : 'Active',
        last_service: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        next_service: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));

      return { success: true, data: mockBuses, total: mockBuses.length };
    } catch (error) {
      console.error('Error fetching buses:', error);
      return { success: false, error: error.message };
    }
  }

  static async addBus(busData) {
    try {
      console.log('Adding bus:', busData);
      return { success: true, data: { id: Date.now(), ...busData } };
    } catch (error) {
      console.error('Error adding bus:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateBus(id, updates) {
    try {
      console.log('Updating bus:', id, updates);
      return { success: true, data: { id, ...updates } };
    } catch (error) {
      console.error('Error updating bus:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteBus(id) {
    try {
      console.log('Deleting bus:', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting bus:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // DRIVER MANAGEMENT
  // ====================================

  static async getDrivers(filters = {}) {
    try {
      const mockDrivers = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        driver_id: `DRV${String(i + 1).padStart(3, '0')}`,
        name: `Driver ${i + 1}`,
        phone: `+91 98765${String(43210 + i).slice(-5)}`,
        license_number: `TN${String(123456789 + i)}`,
        license_expiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        blood_group: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][i % 8],
        emergency_contact: `+91 98765${String(54321 + i).slice(-5)}`,
        experience_years: Math.floor(Math.random() * 20) + 5,
        shift: ['Morning', 'Evening', 'Full Day'][i % 3],
        working_hours: '8 hours',
        assigned_bus: i < 25 ? `TN-09-AB-${String(1234 + i).padStart(4, '0')}` : 'Not Assigned',
        status: i % 15 === 0 ? 'On Leave' : 'Active',
      }));

      return { success: true, data: mockDrivers, total: mockDrivers.length };
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return { success: false, error: error.message };
    }
  }

  static async addDriver(driverData) {
    try {
      console.log('Adding driver:', driverData);
      return { success: true, data: { id: Date.now(), ...driverData } };
    } catch (error) {
      console.error('Error adding driver:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateDriver(id, updates) {
    try {
      console.log('Updating driver:', id, updates);
      return { success: true, data: { id, ...updates } };
    } catch (error) {
      console.error('Error updating driver:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteDriver(id) {
    try {
      console.log('Deleting driver:', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting driver:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // ROUTE MANAGEMENT
  // ====================================

  static async getRoutes(filters = {}) {
    try {
      // Use the real transport_routes API endpoint
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/transport-routes${queryString ? '?' + queryString : ''}`;
      return await this.apiCall(endpoint);
    } catch (error) {
      console.error('Error fetching routes:', error);
      return { success: false, error: error.message };
    }
  }

  static async getRouteById(id) {
    try {
      const endpoint = `/transport-routes/${id}`;
      return await this.apiCall(endpoint);
    } catch (error) {
      console.error('Error fetching route:', error);
      return { success: false, error: error.message };
    }
  }

  static async addRoute(routeData) {
    try {
      return await this.apiCall('/transport-routes', {
        method: 'POST',
        body: JSON.stringify(routeData),
      });
    } catch (error) {
      console.error('Error adding route:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateRoute(id, updates) {
    try {
      return await this.apiCall(`/transport-routes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating route:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteRoute(id) {
    try {
      return await this.apiCall(`/transport-routes/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting route:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // FEES MANAGEMENT
  // ====================================

  static async getTransportFees(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/transport/fees${queryString ? '?' + queryString : ''}`;
      return await this.apiCall(endpoint);
    } catch (error) {
      console.error('Error fetching transport fees:', error);
      return { success: false, error: error.message };
    }
  }

  static async recordPayment(paymentData) {
    try {
      return await this.apiCall('/transport/fees/payment', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateFeeStatus(id, status) {
    try {
      return await this.apiCall(`/transport/fees/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(status),
      });
    } catch (error) {
      console.error('Error updating fee status:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // ATTENDANCE MANAGEMENT
  // ====================================

  static async getAttendance(filters = {}) {
    try {
      const mockAttendance = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        entity_type: i % 2 === 0 ? 'Student' : 'Faculty',
        entity_id: i % 2 === 0 ? `2024${String((i / 2) + 1).padStart(3, '0')}` : `FAC${String((i / 2) + 1).padStart(3, '0')}`,
        entity_name: i % 2 === 0 ? `Student ${(i / 2) + 1}` : `Faculty ${(i / 2) + 1}`,
        route_id: `RT-${String((i % 15) + 1).padStart(2, '0')}`,
        bus_number: `TN-09-AB-${String(1234 + (i % 25)).padStart(4, '0')}`,
        status: i % 10 === 0 ? 'Absent' : 'Present',
        remarks: i % 10 === 0 ? 'Absent without notice' : '',
      }));

      return { success: true, data: mockAttendance, total: mockAttendance.length };
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return { success: false, error: error.message };
    }
  }

  static async markAttendance(attendanceData) {
    try {
      console.log('Marking attendance:', attendanceData);
      return { success: true, data: { id: Date.now(), ...attendanceData } };
    } catch (error) {
      console.error('Error marking attendance:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // LIVE TRACKING
  // ====================================

  static async getLiveLocations() {
    try {
      const mockLocations = Array.from({ length: 15 }, (_, i) => ({
        bus_id: i + 1,
        bus_number: `TN-09-AB-${String(1234 + i).padStart(4, '0')}`,
        route_id: `RT-${String(i + 1).padStart(2, '0')}`,
        latitude: 13.0827 + (Math.random() - 0.5) * 0.1,
        longitude: 80.2707 + (Math.random() - 0.5) * 0.1,
        speed: Math.floor(Math.random() * 40) + 20,
        status: i % 10 === 0 ? 'Stopped' : 'Moving',
        last_update: new Date().toISOString(),
        driver_name: `Driver ${i + 1}`,
      }));

      return { success: true, data: mockLocations };
    } catch (error) {
      console.error('Error fetching live locations:', error);
      return { success: false, error: error.message };
    }
  }

  static async getRouteHistory(busId, date) {
    try {
      const mockHistory = Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(date + ' 07:' + String(30 + i * 2).padStart(2, '0')).toISOString(),
        latitude: 13.0827 + i * 0.005,
        longitude: 80.2707 + i * 0.005,
        speed: Math.floor(Math.random() * 40) + 20,
      }));

      return { success: true, data: mockHistory };
    } catch (error) {
      console.error('Error fetching route history:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // REPORTS
  // ====================================

  static async generateReport(reportType, filters = {}) {
    try {
      const mockReports = {
        attendance: {
          title: 'Attendance Report',
          data: {
            totalDays: 30,
            presentDays: 28,
            absentDays: 2,
            percentage: 93.3,
            byRoute: Array.from({ length: 15 }, (_, i) => ({
              route_id: `RT-${String(i + 1).padStart(2, '0')}`,
              present: Math.floor(Math.random() * 50) + 40,
              absent: Math.floor(Math.random() * 5),
            })),
          },
        },
        fees: {
          title: 'Fee Collection Report',
          data: {
            totalAmount: 2125000,
            collected: 1855625,
            pending: 269375,
            collectionRate: 87.3,
            byRoute: Array.from({ length: 15 }, (_, i) => ({
              route_id: `RT-${String(i + 1).padStart(2, '0')}`,
              total: Math.floor(Math.random() * 100000) + 100000,
              collected: Math.floor(Math.random() * 80000) + 80000,
              pending: Math.floor(Math.random() * 20000),
            })),
          },
        },
        routes: {
          title: 'Route Efficiency Report',
          data: {
            totalRoutes: 15,
            activeRoutes: 14,
            avgOccupancy: 85,
            byRoute: Array.from({ length: 15 }, (_, i) => ({
              route_id: `RT-${String(i + 1).padStart(2, '0')}`,
              students: Math.floor(Math.random() * 40) + 30,
              capacity: [40, 45, 50, 55][i % 4],
              occupancy: ((Math.floor(Math.random() * 40) + 30) / [40, 45, 50, 55][i % 4] * 100).toFixed(1),
              onTimePerformance: Math.floor(Math.random() * 20) + 80,
            })),
          },
        },
        drivers: {
          title: 'Driver Performance Report',
          data: {
            totalDrivers: 30,
            activeDrivers: 28,
            avgExperience: 12,
            byDriver: Array.from({ length: 30 }, (_, i) => ({
              driver_id: `DRV${String(i + 1).padStart(3, '0')}`,
              name: `Driver ${i + 1}`,
              trips: Math.floor(Math.random() * 50) + 40,
              onTime: Math.floor(Math.random() * 20) + 80,
              rating: (Math.random() * 1 + 4).toFixed(1),
            })),
          },
        },
      };

      return { success: true, data: mockReports[reportType] || mockReports.attendance };
    } catch (error) {
      console.error('Error generating report:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // UTILITY FUNCTIONS
  // ====================================

  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  static getStatusColor(status) {
    const statusColors = {
      Active: 'success',
      Inactive: 'default',
      'Under Maintenance': 'warning',
      'On Leave': 'warning',
      Paid: 'success',
      Pending: 'warning',
      Overdue: 'error',
      Present: 'success',
      Absent: 'error',
      Moving: 'success',
      Stopped: 'warning',
    };
    return statusColors[status] || 'default';
  }
}

export default TransportService;