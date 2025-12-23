import apiService from './api';

class NotificationService {
  // Send notification for upcoming exams
  static async sendExamNotification(examId, notificationType = 'email') {
    try {
      const response = await apiService.sendNotification({
        type: 'exam_reminder',
        targetType: notificationType, // 'email' or 'sms'
        examId,
        sendImmediately: true
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error sending exam notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification for fee dues
  static async sendFeeDueNotification(studentId, feeDetails, notificationType = 'email') {
    try {
      const response = await apiService.sendNotification({
        type: 'fee_due_reminder',
        targetType: notificationType, // 'email' or 'sms'
        studentId,
        feeDetails,
        sendImmediately: true
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error sending fee due notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send payment receipt
  static async sendPaymentReceipt(paymentId, notificationType = 'email') {
    try {
      const response = await apiService.sendNotification({
        type: 'payment_receipt',
        targetType: notificationType, // 'email' or 'sms'
        paymentId,
        sendImmediately: true
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error sending payment receipt:', error);
      return { success: false, error: error.message };
    }
  }

  // Get notification history with filters
  static async getNotificationHistory(filters = {}) {
    try {
      const response = await apiService.getNotifications(filters);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule a notification for future delivery
  static async scheduleNotification(notificationData) {
    try {
      const response = await apiService.sendNotification({
        ...notificationData,
        sendImmediately: false
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get notification templates
  static async getTemplates() {
    try {
      const response = await apiService.request('/notification-templates');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      return { success: false, error: error.message };
    }
  }

  // Update notification template
  static async updateTemplate(templateId, templateData) {
    try {
      const response = await apiService.request(`/notification-templates/${templateId}`, {
        method: 'PUT',
        body: templateData
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating notification template:', error);
      return { success: false, error: error.message };
    }
  }
}

export default NotificationService;
