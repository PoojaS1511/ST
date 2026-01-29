import SupabaseService from './supabaseService';
import clubsService from './clubsService';
import academicService from './academicService';
import { supabase } from '../lib/supabase';

class ApiService {
  // ====================================
  // Clubs & Activities Methods
  // ====================================

  // Club Methods
  static async getClubs() {
    return await clubsService.getClubs();
  }

  static async getClub(id) {
    return await clubsService.getClub(id);
  }

  static async createClub(clubData) {
    return await clubsService.createClub(clubData);
  }

  static async updateClub(id, updates) {
    return await clubsService.updateClub(id, updates);
  }

  static async deleteClub(id) {
    return await clubsService.deleteClub(id);
  }

  // Club Categories
  static async getClubCategories() {
    return await clubsService.getClubCategories();
  }

  // Faculty
  static async getFaculty() {
    try {
      // First check if faculty table exists and has data
      const { data: countData, error: countError } = await supabase
        .from('faculty')
        .select('id', { count: 'exact', head: true });

      if (countError) {
        console.warn('Faculty table might not exist or have issues:', countError.message);
        // Return empty array if table doesn't exist yet
        return { success: true, data: [] };
      }

      if (!countData || countData.length === 0) {
        console.log('No faculty records found');
        return { success: true, data: [] };
      }

      // Get faculty data - try ordering by different columns
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getFaculty:', error);
      return { success: false, message: error.message };
    }
  }

  static async uploadClubLogo(file, filename) {
    try {
      // Upload the file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${filename}.${fileExt}`;
      const filePath = `club-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('club-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('club-media')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Error in uploadClubLogo:', error);
      return { success: false, message: error.message };
    }
  }

  // Club Members
  static async getClubMembers(clubId) {
    return await clubsService.getClubMembers(clubId);
  }

  static async inviteClubMember(inviteData) {
    return await clubsService.inviteClubMember(inviteData);
  }

  static async updateClubMemberRole(clubId, memberId, role) {
    return await clubsService.updateClubMemberRole(clubId, memberId, role);
  }

  static async removeClubMember(clubId, memberId) {
    return await clubsService.removeClubMember(clubId, memberId);
  }

  // Club Events
  static async getClubEvents(clubId, options = {}) {
    return await clubsService.getClubEvents(clubId, options);
  }

  static async getEvent(eventId) {
    return await clubsService.getEvent(eventId);
  }

  static async createEvent(eventData) {
    return await clubsService.createEvent(eventData);
  }

  static async updateEvent(eventId, updates) {
    return await clubsService.updateEvent(eventId, updates);
  }

  static async deleteEvent(eventId) {
    return await clubsService.deleteEvent(eventId);
  }

  // Event Attendance
  static async getEventAttendance(eventId) {
    return await clubsService.getEventAttendance(eventId);
  }

  static async markAttendance(attendanceData) {
    return await clubsService.markAttendance(attendanceData);
  }

  // Club Gallery
  static async getClubGallery(clubId, options = {}) {
    return await clubsService.getClubGallery(clubId, options);
  }

  static async uploadClubMedia(mediaData) {
    return await clubsService.uploadGalleryMedia(mediaData);
  }

  static async deleteClubMedia(mediaId) {
    return await clubsService.deleteGalleryMedia(mediaId);
  }

  // Club Awards
  static async getClubAwards(clubId) {
    return await clubsService.getClubAwards(clubId);
  }

  static async createAward(awardData) {
    return await clubsService.createAward(awardData);
  }

  static async deleteAward(awardId) {
    return await clubsService.deleteAward(awardId);
  }
  // ====================================
  // Course Methods
  // ====================================
  static async getCourses() {
    try {
      const response = await SupabaseService.getCourses();
      if (response && response.success) {
        return { 
          success: true, 
          data: Array.isArray(response.data) ? response.data : [] 
        };
      }
      return { 
        success: false, 
        data: [], 
        message: response?.message || 'No courses found' 
      };
    } catch (error) {
      console.error('Error in getCourses:', error);
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch courses' 
      };
    }
  }

  static async createCourse(courseData) {
    try {
      const response = await SupabaseService.createCourse(courseData);
      if (response && response.success) {
        return { 
          success: true, 
          data: response.data,
          message: response.message || 'Course created successfully'
        };
      }
      return { 
        success: false, 
        message: response?.message || 'Failed to create course' 
      };
    } catch (error) {
      console.error('Error in createCourse:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to create course' 
      };
    }
  }

  static async updateCourse(id, updates) {
    try {
      const response = await SupabaseService.updateCourse(id, updates);
      if (response && response.success) {
        return { 
          success: true, 
          data: response.data,
          message: response.message || 'Course updated successfully'
        };
      }
      return { 
        success: false, 
        message: response?.message || 'Failed to update course' 
      };
    } catch (error) {
      console.error('Error in updateCourse:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update course' 
      };
    }
  }

  static async deleteCourse(id) {
    try {
      const response = await SupabaseService.deleteCourse(id);
      if (response && response.success) {
        return { 
          success: true, 
          message: response.message || 'Course deleted successfully' 
        };
      }
      return { 
        success: false, 
        message: response?.message || 'Failed to delete course' 
      };
    } catch (error) {
      console.error('Error in deleteCourse:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete course' 
      };
    }
  }

  // ====================================
  // Student Methods
  // ====================================
  static async getStudents(filters = {}) {
    return SupabaseService.getStudents(filters);
  }

  static async getStudent(id) {
    try {
      return await SupabaseService.getStudent(id);
    } catch (error) {
      console.error('Error in getStudent:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to fetch student' 
      };
    }
  }

  static async createStudent(studentData) {
    return SupabaseService.createStudent(studentData);
  }

  static async updateStudent(id, updates) {
    try {
      return await SupabaseService.updateStudent(id, updates);
    } catch (error) {
      console.error('Error in updateStudent:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to update student' 
      };
    }
  }

  static async deleteStudent(id) {
    try {
      return await SupabaseService.deleteStudent(id);
    } catch (error) {
      console.error('Error in deleteStudent:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete student' 
      };
    }
  }

  // ====================================
  // Course Methods
  // ====================================
  static async createCourse(courseData) {
    try {
      const response = await SupabaseService.createCourse(courseData);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Failed to create course' };
    } catch (error) {
      console.error('Error in createCourse:', error);
      return { success: false, message: error.message };
    }
  }

  static async updateCourse(id, updates) {
    try {
      const response = await SupabaseService.updateCourse(id, updates);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Failed to update course' };
    } catch (error) {
      console.error('Error in updateCourse:', error);
      return { success: false, message: error.message };
    }
  }

  static async deleteCourse(id) {
    try {
      const response = await SupabaseService.deleteCourse(id);
      if (response && response.success) {
        return { success: true, message: response.message };
      }
      return { success: false, message: response?.message || 'Failed to delete course' };
    } catch (error) {
      console.error('Error in deleteCourse:', error);
      return { success: false, message: error.message };
    }
  }

  static async checkCourseCodeExists(code, excludeId = null) {
    try {
      return await SupabaseService.checkCourseCodeExists(code, excludeId);
    } catch (error) {
      console.error('Error in checkCourseCodeExists:', error);
      return { exists: false, error: error.message };
    }
  }

  // ====================================
  // Department Methods
  // ====================================
  static async getAllDepartments() {
    return SupabaseService.getAllDepartments();
  }

  // ====================================
  // Subject Methods
  // ====================================
  static async getSubjectsByDepartment(departmentId) {
    try {
      if (!departmentId) {
        console.warn('No department ID provided to getSubjectsByDepartment');
        return {
          success: false,
          data: [],
          message: 'Department ID is required'
        };
      }

      console.log('Fetching subjects for department ID:', departmentId);

      // First get courses for this department
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id')
        .eq('department_id', departmentId);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        return {
          success: false,
          data: [],
          message: coursesError.message
        };
      }

      if (!courses || courses.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No courses found for this department'
        };
      }

      const courseIds = courses.map(c => c.id);

      // Then get subjects for these courses
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          id,
          name,
          code,
          semester,
          credits,
          subject_type,
          is_elective,
          description,
          course_id,
          subject_uuid,
          created_at,
          courses!fk_subject_course(
            id,
            name,
            code
          )
        `)
        .in('course_id', courseIds)
        .order('name');

      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError);
        return {
          success: false,
          data: [],
          message: subjectsError.message
        };
      }

      console.log(`Found ${subjects?.length || 0} subjects for department ${departmentId}`);
      return {
        success: true,
        data: subjects || [],
        message: 'Subjects retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getSubjectsByDepartment:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch subjects for this department'
      };
    }
  }

  static async getSubjects(filters = {}) {
    try {
      // If department_id is provided, use the department-based method
      if (filters.department_id) {
        return await this.getSubjectsByDepartment(filters.department_id);
      }

      // Otherwise, fall back to the general subjects query using academicService
      const response = await academicService.getSubjects(filters);
      if (response && response.success) {
        return {
          success: true,
          data: response.data || [],
          message: response.message
        };
      }
      return {
        success: false,
        data: [],
        message: response?.error || response?.message || 'No subjects found'
      };
    } catch (error) {
      console.error('Error in getSubjects:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch subjects'
      };
    }
  }

  static async getSubject(id) {
    try {
      const response = await academicService.getSubject(id);
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      }
      return {
        success: false,
        data: null,
        message: response?.error || 'Failed to fetch subject'
      };
    } catch (error) {
      console.error('Error in getSubject:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch subject'
      };
    }
  }

  static async createSubject(subjectData) {
    try {
      return await academicService.createSubject(subjectData);
    } catch (error) {
      console.error('Error in createSubject:', error);
      return {
        success: false,
        error: error.message || 'Failed to create subject'
      };
    }
  }

  static async updateSubject(id, updates) {
    try {
      const response = await academicService.updateSubject(id, updates);
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      }
      return {
        success: false,
        data: null,
        message: response?.error || 'Failed to update subject'
      };
    } catch (error) {
      console.error('Error in updateSubject:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update subject'
      };
    }
  }

  static async deleteSubject(id) {
    try {
      const response = await academicService.deleteSubject(id);
      if (response && response.success) {
        return {
          success: true,
          message: response.message
        };
      }
      return {
        success: false,
        message: response?.error || 'Failed to delete subject'
      };
    } catch (error) {
      console.error('Error in deleteSubject:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete subject'
      };
    }
  }

  // ====================================
  // Exam Methods
  // ====================================
  static async getExams(filters = {}) {
    try {
      const response = await SupabaseService.getExams(filters);
      if (response && response.success) {
        return { 
          success: true, 
          data: Array.isArray(response.data) ? response.data : [] 
        };
      }
      return { 
        success: false, 
        data: [], 
        message: response?.message || 'No exams found' 
      };
    } catch (error) {
      console.error('Error in getExams:', error);
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch exams' 
      };
    }
  }

  static async getExam(id) {
    try {
      return await SupabaseService.getExam(id);
    } catch (error) {
      console.error('Error in getExam:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to fetch exam' 
      };
    }
  }

  static async createExam(examData) {
    return SupabaseService.createExam(examData);
  }

  static async updateExam(id, updates) {
    try {
      return await SupabaseService.updateExam(id, updates);
    } catch (error) {
      console.error('Error in updateExam:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to update exam' 
      };
    }
  }

  static async deleteExam(id) {
    try {
      return await SupabaseService.deleteExam(id);
    } catch (error) {
      console.error('Error in deleteExam:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete exam' 
      };
    }
  }

  // ====================================
  // Exam Results Methods
  // ====================================
  static async getExamResults(filters = {}) {
    try {
      const response = await SupabaseService.getExamResults(filters);
      if (response && response.success) {
        return { 
          success: true, 
          data: Array.isArray(response.data) ? response.data : [] 
        };
      }
      return { 
        success: false, 
        data: [], 
        message: response?.message || 'No exam results found' 
      };
    } catch (error) {
      console.error('Error in getExamResults:', error);
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch exam results' 
      };
    }
  }

  static async upsertExamResult(resultData) {
    try {
      return await SupabaseService.upsertExamResult(resultData);
    } catch (error) {
      console.error('Error in upsertExamResult:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to save exam result' 
      };
    }
  }

  static async getStudentsForMarks(examId, subjectId) {
    try {
      return await SupabaseService.getStudentsForMarks(examId, subjectId);
    } catch (error) {
      console.error('Error in getStudentsForMarks:', error);
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch students for marks entry' 
      };
    }
  }

  static async getSubject(id) {
    try {
      return await SupabaseService.getSubject(id);
    } catch (error) {
      console.error('Error in getSubject:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to fetch subject' 
      };
    }
  }

  static async createSubject(subjectData) {
    try {
      return await SupabaseService.createSubject(subjectData);
    } catch (error) {
      console.error('Error in createSubject:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create subject'
      };
    }
  }

  static async updateSubject(id, updates) {
    try {
      return await SupabaseService.updateSubject(id, updates);
    } catch (error) {
      console.error('Error in updateSubject:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update subject'
      };
    }
  }

  static async deleteSubject(id) {
    try {
      return await SupabaseService.deleteSubject(id);
    } catch (error) {
      console.error('Error in deleteSubject:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete subject'
      };
    }
  }

  // Attendance
  static async getStudentAttendance(studentId, filters = {}) {
    return SupabaseService.getStudentAttendance(studentId, filters);
  }

  static async getAttendanceRecords(filters = {}) {
    try {
      const response = await SupabaseService.getAttendanceRecords(filters);
      console.log('Attendance records API response:', response);
      
      if (response && response.success) {
        return { 
          success: true, 
          data: response.data || [],
          message: response.message || ''
        };
      }
      
      return { 
        success: false, 
        data: [], 
        message: response?.message || 'No attendance records found'
      };
    } catch (error) {
      console.error('Error in getAttendanceRecords:', error);
      
      // In development, return sample data if there's an error
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using sample attendance data in development');
        return {
          success: true,
          data: [
            {
              id: '1',
              date: new Date().toISOString().split('T')[0],
              subject: { id: '1', name: 'Mathematics', code: 'MATH101' },
              course: { id: '1', name: 'B.Tech CSE', code: 'CSE' },
              present_count: 25,
              total_students: 30,
              status: 'completed'
            },
            {
              id: '2',
              date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
              subject: { id: '2', name: 'Physics', code: 'PHY101' },
              course: { id: '1', name: 'B.Tech CSE', code: 'CSE' },
              present_count: 28,
              total_students: 30,
              status: 'completed'
            }
          ],
          message: 'Using sample attendance data'
        };
      }
      
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch attendance records'
      };
    }
  }

  static async getStudentResults(studentId) {
    try {
      const response = await SupabaseService.getMarks({ student_id: studentId });
      if (response && response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [], message: response?.message || 'No results found' };
    } catch (error) {
      console.error('Error in getStudentResults:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  // Marks Management
  static async getMarks(filters = {}) {
    try {
      const response = await SupabaseService.getMarks(filters);
      if (response && response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [], message: response?.message || 'No marks found' };
    } catch (error) {
      console.error('Error in getMarks:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  static async upsertMarks(marksData) {
    try {
      const response = await SupabaseService.upsertMarks(marksData);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Failed to save marks' };
    } catch (error) {
      console.error('Error in upsertMarks:', error);
      return { success: false, message: error.message };
    }
  }

  static async getStudentsForMarks(examId, subjectId) {
    try {
      const response = await SupabaseService.getStudentsForMarks(examId, subjectId);
      if (response && response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [], message: response?.message || 'No students found' };
    } catch (error) {
      console.error('Error in getStudentsForMarks:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  // Exams
  static async getExams(filters = {}) {
    try {
      const response = await SupabaseService.getExams(filters);
      if (response && response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [], message: response?.message || 'No exams found' };
    } catch (error) {
      console.error('Error in getExams:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  static async getExam(id) {
    try {
      const response = await SupabaseService.getExam(id);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Exam not found' };
    } catch (error) {
      console.error('Error in getExam:', error);
      return { success: false, message: error.message };
    }
  }

  static async createExam(examData) {
    try {
      const response = await SupabaseService.createExam(examData);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Failed to create exam' };
    } catch (error) {
      console.error('Error in createExam:', error);
      return { success: false, message: error.message };
    }
  }

  static async updateExam(id, examData) {
    try {
      const response = await SupabaseService.updateExam(id, examData);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Failed to update exam' };
    } catch (error) {
      console.error('Error in updateExam:', error);
      return { success: false, message: error.message };
    }
  }

  static async deleteExam(id) {
    try {
      const response = await SupabaseService.deleteExam(id);
      if (response && response.success) {
        return { success: true };
      }
      return { success: false, message: response?.message || 'Failed to delete exam' };
    } catch (error) {
      console.error('Error in deleteExam:', error);
      return { success: false, message: error.message };
    }
  }

  // ====================================
  // Attendance Methods
  // ====================================
  static async getAttendanceRecords(filters = {}) {
    try {
      const response = await SupabaseService.getAttendanceRecords(filters);
      if (response && response.success) {
        return { 
          success: true, 
          data: Array.isArray(response.data) ? response.data : [] 
        };
      }
      return { 
        success: false, 
        data: [], 
        message: response?.message || 'No attendance records found' 
      };
    } catch (error) {
      console.error('Error in getAttendanceRecords:', error);
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch attendance records' 
      };
    }
  }

  // ====================================
  // Resume Methods
  // ====================================
  static async getStudentResume(studentId) {
    try {
      return await SupabaseService.getStudentResume(studentId);
    } catch (error) {
      console.error('Error in getStudentResume:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Failed to fetch student resume' 
      };
    }
  }

  static async uploadResume(studentId, file) {
    try {
      return await SupabaseService.uploadResume(studentId, file);
    } catch (error) {
      console.error('Error in uploadResume:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Failed to upload resume' 
      };
    }
  }

  static async deleteResume(studentId) {
    try {
      return await SupabaseService.deleteResume(studentId);
    } catch (error) {
      console.error('Error in deleteResume:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Failed to delete resume' 
      };
    }
  }

  // Generic request method for any remaining API calls
  static async request(endpoint, options = {}) {
    console.warn(`Direct API call to ${endpoint} not implemented. Using Supabase methods directly.`);
    throw new Error('API endpoint not implemented. Use Supabase methods directly.');
  }

  // ====================================
  // Hall Ticket Methods
  // ====================================
  static async generateHallTicket(studentId, examId) {
    try {
      console.log(`Generating hall ticket for student ${studentId}, exam ${examId}`);
      
      // Make the request - authentication is handled by session cookies
      const response = await fetch(`/api/student_dashboard/hall-ticket?exam_id=${examId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf, application/json',
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest' // Helps identify AJAX requests on the server
        },
        credentials: 'include' // Include cookies for session handling
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));

      const contentType = response.headers['content-type'];
      console.log('Content-Type:', contentType);

      // First check for error responses
      if (!response.ok) {
        let errorMessage = `Server returned ${response.status} status`;
        
        try {
          // Try to parse error as JSON
          const errorData = await response.data.text();
          errorMessage = errorData;
        } catch (e) {
          // If not JSON, try to get text error
          const errorText = await response.data.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Handle successful PDF response
      if (contentType.includes('application/pdf')) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `hall_ticket_${examId}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return { 
          success: true, 
          message: 'Hall ticket downloaded successfully' 
        };
      }
      
      // Handle JSON response (should only happen in case of errors, but we'll handle it)
      if (contentType.includes('application/json')) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Unexpected response from server');
      }
      
      // Handle HTML response (likely an error page)
      if (contentType.includes('text/html')) {
        const html = await response.text();
        // Try to extract error message from HTML if possible
        const errorMatch = html.match(/<div[^>]*class=["']error-message["'][^>]*>([\s\S]*?)<\/div>/i);
        const errorMessage = errorMatch ? 
          `Server error: ${errorMatch[1].trim()}` : 
          'An error occurred while generating the hall ticket. Please try again later.';
        throw new Error(errorMessage);
      }
      
      // Handle any other content types
      const responseText = await response.text();
      console.error('Unexpected response type:', contentType, 'Content:', responseText);
      throw new Error('Unexpected response format from server');
    } catch (error) {
      console.error('Error in generateHallTicket:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to generate hall ticket',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  }
}

export default ApiService;
