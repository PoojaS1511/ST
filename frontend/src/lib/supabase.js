import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// Create a custom storage handler with error handling and minimal logging
const storage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Storage read error:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Storage write error:', error);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
};

// Parse the URL safely
let storageKey = 'sb-auth-token';
try {
  const url = new URL(supabaseUrl);
  storageKey = `sb-${url.hostname}-auth-token`;
} catch (error) {
  console.warn('Invalid Supabase URL, using default storage key');
}

// Create the Supabase client with proper configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          // Check if we're in a browser environment
          if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
          }
          return null;
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      },
    },
    storageKey,
  },
});

// Log initialization in development
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase client initialized with URL:', supabaseUrl);
  console.log('Using anon key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'Not set');
  console.log('Supabase client initialized with storage key:', storageKey);
}

// Database Tables
export const TABLES = {
  USERS: 'users',
  STUDENTS: 'students',
  FACULTY: 'faculty',
  DEPARTMENTS: 'departments',
  COURSES: 'courses',
  STUDENT_COURSES: 'student_courses',
  SUBJECTS: 'subjects',
  EXAMS: 'exams',
  EXAM_RESULTS: 'exam_results',
  ATTENDANCE: 'attendance',
  FEES: 'fees',
  FEE_PAYMENTS: 'fee_payments',
  ADMISSION_APPLICATIONS: 'admission_applications',
  MARKS: 'marks'
};

// Utility functions for common operations
export const database = {
  // Fetch all records from a table
  fetchAll: async (table) => {
    const { data, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) throw error;
    return data;
  },
  
  // Fetch a single record by ID
  fetchById: async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Insert a new record
  insert: async (table, record) => {
    const { data, error } = await supabase
      .from(table)
      .insert([record])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },
  
  // Update a record
  update: async (table, id, updates) => {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },
  
  // Delete a record
  delete: async (table, id) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Custom query
  query: async (table, queryFn) => {
    let query = supabase.from(table).select('*');
    query = queryFn(query);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

// Export the Supabase client
export { supabase };

export const getSupabase = () => supabase;

export default supabase;