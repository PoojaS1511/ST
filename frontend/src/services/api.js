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

  // Student Fees
  static async getStudentFees(studentId) {
    try {
      // First, get the student's fee record
      const { data: feeRecord, error: feeError } = await supabase
        .from('student_fees')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (feeError) throw feeError;
      
      // If no fee record exists, return default values
      if (!feeRecord) {
        return { 
          success: true, 
          data: {
            fee_structure: {
              tuition_fee: 0,
              lab_fee: 0,
              hostel_fee: 0,
              total_fee: 0
            },
            paid_amount: 0,
            due_amount: 0,
            last_payment_date: null,
            next_due_date: null,
            payment_status: 'unpaid'
          }
        };
      }

      // If fee structure ID exists, fetch the fee structure
      let feeStructure = {
        tuition_fee: 0,
        lab_fee: 0,
        hostel_fee: 0,
        total_fee: 0
      };

      if (feeRecord.fee_structure_id) {
        const { data: structureData, error: structureError } = await supabase
          .from('fee_structures')
          .select('*')
          .eq('id', feeRecord.fee_structure_id)
          .single();

        if (!structureError && structureData) {
          feeStructure = structureData;
        }
      }
      
      return { 
        success: true, 
        data: {
          fee_structure: feeStructure,
          paid_amount: feeRecord.paid_amount || 0,
          due_amount: feeRecord.due_amount || 0,
          last_payment_date: feeRecord.last_payment_date,
          next_due_date: feeRecord.next_due_date,
          payment_status: feeRecord.payment_status || 'unpaid'
        }
      };
    } catch (error) {
      console.error('Error fetching student fees:', error);
      return { 
        success: false, 
        message: error.message,
        data: null
      };
    }
  }

  // Get Fee Structure for Student
  static async getStudentFeeStructure(studentId) {
    try {
      // First get student details without relationship
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          id,
          full_name,
          register_number,
          current_semester,
          course_id,
          department_id
        `)
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      if (!student) {
        return { 
          success: false, 
          message: 'Student not found',
          data: null
        };
      }

      // Get course details separately
      let courseName = 'N/A';
      if (student.course_id) {
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('name')
          .eq('id', student.course_id)
          .single();
        
        if (!courseError && course) {
          courseName = course.name;
        }
      }

      // Get current academic year - adjust to match database data (2025-2026)
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear - 1}-${currentYear}`; // Changed to 2025-2026

      // Fetch fee structures for the student's course and academic year
      const { data: feeStructures, error: feeError } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('course_id', student.course_id)
        .eq('academic_year', academicYear)
        .order('created_at', { ascending: true });

      // If no fee structures found for current year, try the previous year
      let finalFeeStructures = feeStructures || [];
      if ((!finalFeeStructures || finalFeeStructures.length === 0) && feeError) {
        const fallbackYear = `${currentYear - 2}-${currentYear - 1}`;
        const { data: fallbackFeeStructures } = await supabase
          .from('fee_structures')
          .select('*')
          .eq('course_id', student.course_id)
          .eq('academic_year', fallbackYear)
          .order('created_at', { ascending: true });
        
        if (fallbackFeeStructures && fallbackFeeStructures.length > 0) {
          finalFeeStructures = fallbackFeeStructures;
          console.log(`Using fallback fee structures from ${fallbackYear}`);
        }
      }

      if (feeError) throw feeError;

      return {
        success: true,
        data: {
          student: {
            full_name: student.full_name,
            register_number: student.register_number,
            course: courseName,
            semester: student.current_semester,
            course_id: student.course_id,
            department_id: student.department_id
          },
          fee_structures: finalFeeStructures || [],
          academic_year: academicYear
        }
      };

    } catch (error) {
      console.error('Error fetching student fee structure:', error);
      return { 
        success: false, 
        message: error.message,
        data: null
      };
    }
  }

  // Faculty
  static async getFacultyAssignments(facultyId) {
    try {
      const { data, error } = await supabase
        .from('faculty_subject_assignments')
        .select(`
          *,
          subject:subject_id (id, name, code),
          course:course_id (id, name, code)
        `)
        .eq('faculty_id', facultyId)
        .eq('is_active', true);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching faculty assignments:', error);
      return { success: false, message: error.message };
    }
  }

  static async getFacultyStudents({ facultyId, semester, section, subjectId }) {
    try {
      // First get the class assignments for the faculty
      const { data: assignments, error: assignError } = await supabase
        .from('faculty_subject_assignments')
        .select('course_id, subject_id, academic_year, semester, section')
        .eq('faculty_id', facultyId)
        .eq('is_active', true);

      if (assignError) throw assignError;

      if (!assignments || assignments.length === 0) {
        console.log('No active assignments found for faculty:', facultyId);
        return { success: true, data: [] };
      }

      // Find the matching assignment based on filters
      const assignment = assignments.find(a => 
        (!semester || a.semester === parseInt(semester)) &&
        (!section || a.section === section) &&
        (!subjectId || a.subject_id === subjectId)
      );

      if (!assignment) {
        console.log('No matching assignment found for filters:', { semester, section, subjectId });
        return { success: true, data: [] };
      }

      console.log('Fetching students for assignment:', assignment);

      // Get students for the matched assignment - simplified query without the user join
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          roll_no,
          full_name,
          email,
          phone,
          register_number,
          current_semester,
          section,
          course_id
        `)
        .eq('course_id', assignment.course_id)
        .eq('current_semester', assignment.semester)
        .eq('section', assignment.section)
        .order('roll_no', { ascending: true });

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      console.log(`Found ${students?.length || 0} students`);

      // Get attendance data for each student
      const studentsWithAttendance = await Promise.all(
        students.map(async (student) => {
          // Convert academic year (e.g., '2025-2026') to date range (2025-06-01 to 2026-05-31)
          const [startYear] = assignment.academic_year.split('-').map(Number);
          const startDate = `${startYear}-06-01`;
          const endDate = `${startYear + 1}-05-31`;

          const { data: attendance, error: attendanceError } = await supabase
            .from('attendance')
            .select('status, date')
            .eq('student_id', student.id)
            .eq('subject_id', assignment.subject_id)
            .gte('date', startDate)
            .lte('date', endDate);

          if (attendanceError) {
            console.error('Error fetching attendance:', attendanceError);
            return { ...student, attendance_percentage: 0 };
          }

          if (!attendance || attendance.length === 0) {
            return { ...student, attendance_percentage: 0 };
          }

          const totalClasses = attendance.length;
          const presentClasses = attendance.filter(a => a.status === 'present').length;
          const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

          return { 
            ...student, 
            attendance_percentage: attendancePercentage,
            name: student.full_name // Ensure the name field is set for the UI
          };
        })
      );

      return { success: true, data: studentsWithAttendance };
    } catch (error) {
      console.error('Error in getFacultyStudents:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch students' 
      };
    }
  }

  // Faculty
  static async getFaculty() {
    try {
      // First check if faculty table exists and has data
      const { data: countData, error: countError } = await supabase
        .from('faculties')
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
        .from('faculties')
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
      console.log('Fetching exams with filters:', JSON.stringify(filters, null, 2));
      
      // First, let's get a count of all exams to see if the table has data
      const { count: totalExams } = await supabase
        .from('exams')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Total exams in database: ${totalExams}`);
      
      // If no filters, just get all exams for debugging
      if (Object.keys(filters).length === 0) {
        const { data: allExams, error: allExamsError } = await supabase
          .from('exams')
          .select('*')
          .limit(5);
        
        if (allExamsError) throw allExamsError;
        
        console.log('Sample of all exams (first 5):', allExams);
        return { 
          success: true, 
          data: allExams || [] 
        };
      }
      
      // Build query with filters
      let query = supabase
        .from('exams')
        .select('*');
      
      // Apply filters
      if (filters.course_id) {
        query = query.eq('course_id', filters.course_id);
      }
      if (filters.subject_id) {
        query = query.eq('subject_id', filters.subject_id);
      }
      if (filters.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters.academic_year) {
        // Try both the full academic year and just the start year
        const startYear = filters.academic_year.split('-')[0];
        query = query.or(`academic_year.eq.${filters.academic_year},academic_year.eq.${startYear}`);
      }
      if (filters.exam_type) {
        query = query.eq('exam_type', filters.exam_type);
      }

      // Order by exam_date descending by default
      query = query.order('exam_date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error in exam query:', error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} matching exams`);
      
      return { 
        success: true, 
        data: data || [] 
      };
    } catch (error) {
      console.error('Error in getExams:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch exams',
        data: [] 
      };
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
  // Internal Marks Methods
  // ====================================

  static async saveInternalMarks(marksData) {
    try {
      console.log('Saving internal marks:', marksData);
      
      // Handle both single object and array of objects
      const isBatch = Array.isArray(marksData);
      const records = isBatch ? marksData : [marksData];
      
      // Validate all records first
      const validatedRecords = records.map((record, index) => {
        // Validate required fields with better error messages
        const requiredFields = {
          student_id: 'Student ID is required',
          exam_id: 'Exam ID is required',
          marks_obtained: 'Marks obtained is required',
          max_marks: 'Maximum marks is required',
          entered_by_faculty_id: 'Faculty ID is required'
        };

        // Check for missing required fields
        for (const [field, message] of Object.entries(requiredFields)) {
          if (record[field] === undefined || record[field] === null) {
            throw new Error(
              isBatch 
                ? `Record ${index + 1}: ${message}` 
                : message
            );
          }
        }

        // Validate numeric fields
        if (isNaN(record.marks_obtained) || isNaN(record.max_marks)) {
          throw new Error(
            isBatch
              ? `Record ${index + 1}: Marks must be valid numbers` 
              : 'Marks must be valid numbers'
          );
        }

        const marksObtained = parseFloat(record.marks_obtained);
        const maxMarks = parseFloat(record.max_marks);

        // Validate marks range
        if (marksObtained < 0 || marksObtained > maxMarks) {
          throw new Error(
            isBatch
              ? `Record ${index + 1}: Marks obtained must be between 0 and ${maxMarks}` 
              : `Marks obtained must be between 0 and ${maxMarks}` 
          );
        }

        // Create record without updated_at since it doesn't exist in the schema
        const preparedRecord = {
          ...record,
          marks_obtained: marksObtained,
          max_marks: maxMarks,
          remarks: record.remarks?.trim() || null,
          faculty_subject_assignment_id: record.faculty_subject_assignment_id || null,
          assessment_type: record.assessment_type || 'Internal'
        };
        
        // Only include fields that exist in the schema
        return Object.fromEntries(
          Object.entries(preparedRecord).filter(([key]) => 
            key !== 'updated_at' && key !== 'created_at'
          )
        );
      });

      // First, fetch all existing records to identify updates vs inserts
      const studentIds = [...new Set(validatedRecords.map(r => r.student_id))];
      const examIds = [...new Set(validatedRecords.map(r => r.exam_id))];
      
      const { data: existingRecords, error: fetchError } = await supabase
        .from('internal_marks')
        .select('id, student_id, exam_id')
        .in('student_id', studentIds)
        .in('exam_id', examIds);

      if (fetchError) throw fetchError;

      // Create a map for quick lookup of existing records
      const existingRecordsMap = new Map(
        existingRecords.map(rec => [`${rec.student_id}-${rec.exam_id}`, rec.id])
      );

      // Separate records into updates and inserts
      const recordsToUpdate = [];
      const recordsToInsert = [];
      const now = new Date().toISOString();

      validatedRecords.forEach(record => {
        const recordKey = `${record.student_id}-${record.exam_id}`;
        if (existingRecordsMap.has(recordKey)) {
          recordsToUpdate.push({
            ...record,
            id: existingRecordsMap.get(recordKey)
          });
        } else {
          recordsToInsert.push({
            ...record,
            entered_at: now
          });
        }
      });

      // Process updates in batches if needed (Supabase has a limit on batch size)
      const BATCH_SIZE = 50;
      const updateResults = [];
      
      for (let i = 0; i < recordsToUpdate.length; i += BATCH_SIZE) {
        const batch = recordsToUpdate.slice(i, i + BATCH_SIZE);
        const { data: updated, error: updateError } = await supabase
          .from('internal_marks')
          .upsert(batch, { onConflict: 'id' });
          
        if (updateError) throw updateError;
        updateResults.push(...(updated || []));
      }

      // Process inserts in a single batch
      let insertResults = [];
      if (recordsToInsert.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from('internal_marks')
          .insert(recordsToInsert)
          .select();
          
        if (insertError) {
          // Handle specific PostgREST error for unique constraint violation
          if (insertError.code === '23505') {
            throw new Error('A record with these details already exists');
          }
          throw insertError;
        }
        insertResults = inserted || [];
      }

      // Combine results
      const allResults = [
        ...updateResults.map(r => ({ success: true, data: r })),
        ...insertResults.map(r => ({ success: true, data: r }))
      ];

      // If we have fewer results than expected, some operations might have failed
      const expectedCount = recordsToUpdate.length + recordsToInsert.length;
      if (allResults.length < expectedCount) {
        console.warn(`Expected ${expectedCount} results but got ${allResults.length}`);
      }

      const allSuccessful = allResults.length === expectedCount;
      
      return {
        success: allSuccessful,
        data: isBatch ? allResults.map(r => r.data) : allResults[0]?.data,
        message: allSuccessful 
          ? isBatch 
            ? 'All marks saved successfully' 
            : 'Marks saved successfully'
          : 'Some marks could not be saved',
        details: isBatch ? allResults : undefined
      };
    } catch (error) {
      console.error('Error in saveInternalMarks:', error);
      return {
        success: false,
        message: error.message || 'An error occurred while saving marks',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      };
    }
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

  // ====================================
  // Internal Marks Methods
  // ====================================

  /**
   * Fetches internal marks with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<{success: boolean, data: Array, message: string}>}
   */
  static async getInternalMarks(filters = {}) {
    try {
      let query = supabase
        .from('internal_marks')
        .select(`
          *,
          student:student_id (id, name, email, roll_no),
          faculty:entered_by_faculty_id (id, name, email),
          exam:exam_id (id, name, exam_date),
          assignment:faculty_subject_assignment_id (id, subject_id, subject:subject_id (name, code))
        `)
        .order('entered_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(
          `student.name.ilike.${searchTerm},student.roll_no.ilike.${searchTerm}`
        );
      }

      if (filters.assessmentType) {
        query = query.eq('assessment_type', filters.assessmentType);
      }

      if (filters.examId) {
        query = query.eq('exam_id', filters.examId);
      }

      if (filters.facultyId) {
        query = query.eq('entered_by_faculty_id', filters.facultyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to a more usable format
      const transformedData = data.map(mark => ({
        ...mark,
        student_name: mark.student?.name || 'N/A',
        student_roll_no: mark.student?.roll_no || 'N/A',
        faculty_name: mark.faculty?.name || 'N/A',
        exam_name: mark.exam?.name || 'N/A',
        subject_name: mark.assignment?.subject?.name || 'N/A',
        subject_code: mark.assignment?.subject?.code || 'N/A'
      }));

      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Error fetching internal marks:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Saves internal marks for students
   * @param {Array} marksData - Array of mark objects to save
   * @returns {Promise<{success: boolean, data: Array, message: string}>}
   */
  static async saveInternalMarks(marksData) {
    try {
      const { data, error } = await supabase
        .from('internal_marks')
        .insert(marksData)
        .select();

      if (error) throw error;

      return { 
        success: true, 
        data,
        message: 'Marks saved successfully' 
      };
    } catch (error) {
      console.error('Error saving internal marks:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to save marks' 
      };
    }
  }

  /**
   * Updates an internal mark entry
   * @param {string} markId - ID of the mark to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<{success: boolean, data: Object, message: string}>}
   */
  static async updateInternalMark(markId, updates) {
    try {
      const { data, error } = await supabase
        .from('internal_marks')
        .update(updates)
        .eq('id', markId)
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        data,
        message: 'Mark updated successfully' 
      };
    } catch (error) {
      console.error('Error updating internal mark:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update mark' 
      };
    }
  }

  /**
   * Deletes an internal mark entry
   * @param {string} markId - ID of the mark to delete
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async deleteInternalMark(markId) {
    try {
      const { error } = await supabase
        .from('internal_marks')
        .delete()
        .eq('id', markId);

      if (error) throw error;

      return { 
        success: true, 
        message: 'Mark deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting internal mark:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete mark' 
      };
    }
  }

  // ====================================
  // Internal Marks Methods
  // ====================================

  /**
   * Fetches internal marks with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<{success: boolean, data: Array, message: string}>}
   */
  static async getInternalMarks(filters = {}) {
    try {
      let query = supabase
        .from('internal_marks')
        .select(`
          *,
          student:student_id (id, name, email, roll_no),
          faculty:entered_by_faculty_id (id, name, email),
          exam:exam_id (id, name, exam_date),
          assignment:faculty_subject_assignment_id (id, subject_id, subject:subject_id (name, code))
        `)
        .order('entered_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(
          `student.name.ilike.${searchTerm},student.roll_no.ilike.${searchTerm}`
        );
      }

      if (filters.assessmentType) {
        query = query.eq('assessment_type', filters.assessmentType);
      }

      if (filters.examId) {
        query = query.eq('exam_id', filters.examId);
      }

      if (filters.facultyId) {
        query = query.eq('entered_by_faculty_id', filters.facultyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to a more usable format
      const transformedData = data.map(mark => ({
        ...mark,
        student_name: mark.student?.name || 'N/A',
        student_roll_no: mark.student?.roll_no || 'N/A',
        faculty_name: mark.faculty?.name || 'N/A',
        exam_name: mark.exam?.name || 'N/A',
        subject_name: mark.assignment?.subject?.name || 'N/A',
        subject_code: mark.assignment?.subject?.code || 'N/A'
      }));

      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Error fetching internal marks:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Saves internal marks for students
   * @param {Array} marksData - Array of mark objects to save
   * @returns {Promise<{success: boolean, data: Array, message: string}>}
   */
  static async saveInternalMarks(marksData) {
    try {
      const { data, error } = await supabase
        .from('internal_marks')
        .insert(marksData)
        .select();

      if (error) throw error;

      return { 
        success: true, 
        data,
        message: 'Marks saved successfully' 
      };
    } catch (error) {
      console.error('Error saving internal marks:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to save marks' 
      };
    }
  }

  /**
   * Updates an internal mark entry
   * @param {string} markId - ID of the mark to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<{success: boolean, data: Object, message: string}>}
   */
  static async updateInternalMark(markId, updates) {
    try {
      const { data, error } = await supabase
        .from('internal_marks')
        .update(updates)
        .eq('id', markId)
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        data,
        message: 'Mark updated successfully' 
      };
    } catch (error) {
      console.error('Error updating internal mark:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update mark' 
      };
    }
  }

  /**
   * Deletes an internal mark entry
   * @param {string} markId - ID of the mark to delete
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async deleteInternalMark(markId) {
    try {
      const { error } = await supabase
        .from('internal_marks')
        .delete()
        .eq('id', markId);

      if (error) throw error;

      return { 
        success: true, 
        message: 'Mark deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting internal mark:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete mark' 
      };
    }
  }

  // ====================================
  // Mess Status Methods
  // ====================================

  /**
   * Fetches all mess statuses
   * @returns {Promise<Array>} Array of mess statuses
   */
  static async getMessStatuses() {
    try {
      const { data, error } = await supabase
        .from('mess_status')
        .select('*')
        .order('meal_type', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching mess statuses:', error);
      throw error;
    }
  }

  /**
   * Creates a new mess status
   * @param {Object} statusData - The status data to create
   * @returns {Promise<Object>} The created status
   */
  static async createMessStatus(statusData) {
    try {
      const { data, error } = await supabase
        .from('mess_status')
        .insert([statusData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating mess status:', error);
      throw error;
    }
  }

  /**
   * Updates an existing mess status
   * @param {number} id - The ID of the status to update
   * @param {Object} updates - The fields to update
   * @returns {Promise<Object>} The updated status
   */
  static async updateMessStatus(id, updates) {
    try {
      const { data, error } = await supabase
        .from('mess_status')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating mess status:', error);
      throw error;
    }
  }

  /**
   * Deletes a mess status
   * @param {number} id - The ID of the status to delete
   * @returns {Promise<boolean>} True if successful
   */
  static async deleteMessStatus(id) {
    try {
      const { error } = await supabase
        .from('mess_status')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting mess status:', error);
      throw error;
    }
  }

  // ====================================
  // Menu Items Management
  // ====================================

  /**
   * Fetches all menu items
   * @returns {Promise<Array>} Array of menu items
   */
  static async getMenuItems() {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('day', { ascending: true })
        .order('meal', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  /**
   * Fetches a single menu item by ID
   * @param {string} id - The ID of the menu item to fetch
   * @returns {Promise<Object>} The menu item data
   */
  static async getMenuItem(id) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching menu item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new menu item
   * @param {Object} menuData - The menu item data to create
   * @returns {Promise<Object>} The created menu item
   */
  static async createMenuItem(menuData) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([menuData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  /**
   * Updates an existing menu item
   * @param {string} id - The ID of the menu item to update
   * @param {Object} updates - The fields to update
   * @returns {Promise<Object>} The updated menu item
   */
  static async updateMenuItem(id, updates) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating menu item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a menu item
   * @param {string} id - The ID of the menu item to delete
   * @returns {Promise<boolean>} True if successful
   */
  static async deleteMenuItem(id) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting menu item ${id}:`, error);
      throw error;
    }
  }
}

export default ApiService;
