import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: `${API_URL}/finance`,
  headers: {
    'Content-Type': 'application/json',
  },
});

class FinanceService {
  // ==================== DASHBOARD ====================
  
  async getDashboardMetrics(filters = {}) {
    try {
      const response = await api.get('/dashboard/metrics', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return { success: false, error: error.message };
    }
  }

  async getRevenueExpensesData(filters = {}) {
    try {
      const response = await api.get('/dashboard/revenue-expenses', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching revenue/expenses data:', error);
      return { success: false, error: error.message };
    }
  }

  async getFeeCollectionData(filters = {}) {
    try {
      const response = await api.get('/dashboard/fee-collection', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching fee collection data:', error);
      return { success: false, error: error.message };
    }
  }

  async getBudgetAnalysisData(filters = {}) {
    try {
      const response = await api.get('/dashboard/budget-analysis', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching budget analysis data:', error);
      return { success: false, error: error.message };
    }
  }

  async getFinancialTrendsData(filters = {}) {
    try {
      const response = await api.get('/dashboard/financial-trends', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching financial trends data:', error);
      return { success: false, error: error.message };
    }
  }

  async getSalaryDistributionData(filters = {}) {
    try {
      const response = await api.get('/dashboard/salary-distribution', { params: filters });
      return { success: true, data: response.data };
      } catch (error) {
      console.error('Error fetching salary distribution data:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== STUDENT FEES ====================
  
  async getStudentFees(filters = {}) {
    try {
      const response = await api.get('/student-fees', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching student fees:', error);
      return { success: false, error: error.message };
    }
  }

  async getStudentFee(id) {
    try {
      const response = await api.get(`/student-fees/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching student fee:', error);
      return { success: false, error: error.message };
    }
  }

  async createStudentFee(feeData) {
    try {
      const response = await api.post('/student-fees', feeData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating student fee:', error);
      return { success: false, error: error.message };
    }
  }

  async updateStudentFee(id, updates) {
    try {
      const response = await api.put(`/student-fees/${id}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating student fee:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteStudentFee(id) {
    try {
      await api.delete(`/student-fees/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting student fee:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== STAFF PAYROLL ====================
  
  async getStaffPayroll(filters = {}) {
    try {
      const response = await api.get('/staff-payroll', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching staff payroll:', error);
      return { success: false, error: error.message };
    }
  }

  async getPayrollRecord(id) {
    try {
      const response = await api.get(`/staff-payroll/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching payroll record:', error);
      return { success: false, error: error.message };
    }
  }

  async createPayrollRecord(payrollData) {
    try {
      const response = await api.post('/staff-payroll', payrollData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating payroll record:', error);
      return { success: false, error: error.message };
    }
  }

  async updatePayrollRecord(id, updates) {
    try {
      const response = await api.put(`/staff-payroll/${id}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating payroll record:', error);
      return { success: false, error: error.message };
    }
  }

  async deletePayrollRecord(id) {
    try {
      await api.delete(`/staff-payroll/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting payroll record:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== EXPENSES ====================
  
  async getExpenses(filters = {}) {
    try {
      const response = await api.get('/expenses', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return { success: false, error: error.message };
    }
  }

  async getExpense(id) {
    try {
      const response = await api.get(`/expenses/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching expense:', error);
      return { success: false, error: error.message };
    }
  }

  async createExpense(expenseData) {
    try {
      const response = await api.post('/expenses', expenseData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating expense:', error);
      return { success: false, error: error.message };
    }
  }

  async updateExpense(id, updates) {
    try {
      const response = await api.put(`/expenses/${id}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating expense:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteExpense(id) {
    try {
      await api.delete(`/expenses/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting expense:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== VENDORS ====================
  
  async getVendors(filters = {}) {
    try {
      const response = await api.get('/vendors', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return { success: false, error: error.message };
    }
  }

  async getVendor(id) {
    try {
      const response = await api.get(`/vendors/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching vendor:', error);
      return { success: false, error: error.message };
    }
  }

  async createVendor(vendorData) {
    try {
      const response = await api.post('/vendors', vendorData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating vendor:', error);
      return { success: false, error: error.message };
    }
  }

  async updateVendor(id, updates) {
    try {
      const response = await api.put(`/vendors/${id}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating vendor:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteVendor(id) {
    try {
      await api.delete(`/vendors/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting vendor:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== BUDGET ALLOCATION ====================
  
  async getBudgetAllocations(filters = {}) {
    try {
      const response = await api.get('/budget-allocation', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching budget allocations:', error);
      return { success: false, error: error.message };
    }
  }

  async getBudgetAllocation(id) {
    try {
      const response = await api.get(`/budget-allocation/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching budget allocation:', error);
      return { success: false, error: error.message };
    }
  }

  async createBudgetAllocation(budgetData) {
    try {
      const response = await api.post('/budget-allocation', budgetData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating budget allocation:', error);
      return { success: false, error: error.message };
    }
  }

  async updateBudgetAllocation(id, updates) {
    try {
      const response = await api.put(`/budget-allocation/${id}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating budget allocation:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteBudgetAllocation(id) {
    try {
      await api.delete(`/budget-allocation/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting budget allocation:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== MAINTENANCE ====================
  
  async getMaintenanceRequests(filters = {}) {
    try {
      const response = await api.get('/maintenance', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      return { success: false, error: error.message };
    }
  }

  async getMaintenanceRequest(id) {
    try {
      const response = await api.get(`/maintenance/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching maintenance request:', error);
      return { success: false, error: error.message };
    }
  }

  async createMaintenanceRequest(requestData) {
    try {
      const response = await api.post('/maintenance', requestData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      return { success: false, error: error.message };
    }
  }

  async updateMaintenanceRequest(id, updates) {
    try {
      const response = await api.put(`/maintenance/${id}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteMaintenanceRequest(id) {
    try {
      await api.delete(`/maintenance/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== AI ASSISTANT ====================
  
  async sendMessage(message, conversationHistory = []) {
    try {
      const response = await api.post('/ai-assistant/chat', {
        message,
        conversationHistory,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending message to AI assistant:', error);
      return { success: false, error: error.message };
    }
  }

  async getConversationHistory(sessionId) {
    try {
      const response = await api.get(`/ai-assistant/history/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FinanceService();