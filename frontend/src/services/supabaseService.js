// Re-export the Supabase client from the main configuration file
// This ensures we only have one instance of the Supabase client
import supabase from '../lib/supabase';

class SupabaseService {
  // Course Methods
  static async createCourse(courseData) {
    try {
      // Ensure required fields are present
      const requiredFields = ['name', 'code', 'department_id', 'credits', 'duration_years'];
      const missingFields = requiredFields.filter(field => !courseData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const course = {
        ...courseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('courses')
        .insert([course])
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        message: 'Course created successfully',
        data 
      };
    } catch (error) {
      console.error('Error creating course:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to create course' 
      };
    }
  }

  static async updateCourse(id, updates) {
    try {
      const updatedCourse = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('courses')
        .update(updatedCourse)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        message: 'Course updated successfully',
        data 
      };
    } catch (error) {
      console.error('Error updating course:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update course' 
      };
    }
  }

  static async deleteCourse(id) {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { 
        success: true, 
        message: 'Course deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting course:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete course' 
      };
    }
  }

  static async getCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return { 
        success: true, 
        data: data || [] 
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch courses',
        data: [] 
      };
    }
  }

  // Exam Methods
  static async getExams(filters = {}) {
    try {
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
        query = query.eq('academic_year', filters.academic_year);
      }
      if (filters.exam_type) {
        query = query.eq('exam_type', filters.exam_type);
      }

      // Order by date descending by default
      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return { 
        success: true, 
        data: data || [] 
      };
    } catch (error) {
      console.error('Error fetching exams:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch exams',
        data: [] 
      };
    }
  }
}

// Export the SupabaseService class as default
export default SupabaseService;

// Also export supabase client and SupabaseService as named exports
export { supabase, SupabaseService };