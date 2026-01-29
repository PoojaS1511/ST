import { supabase } from '../lib/supabase';

/**
 * Creates a new auth user in Supabase with admin privileges
 * @param {Object} userData - User data including email, password, and user_metadata
 * @returns {Promise<Object>} - The created user data or error
 */
export const createAuthUser = async (userData) => {
  try {
    const { email, password, user_metadata } = userData;
    
    // First, check if user already exists using auth API
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser.users.some(user => user.email === email);

    if (userExists) {
      throw new Error('A user with this email already exists');
    }

    // Create the user using Supabase Admin API for full control
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: password || `${user_metadata.full_name.substring(0, 4).toLowerCase()}@${(user_metadata.phone || '1234').slice(-4)}`,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        ...user_metadata,
        role: 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      email_confirm: true
    });

    if (authError) throw authError;
    
    return {
      success: true,
      user: authData.user,
      session: authData.session
    };
  } catch (error) {
    console.error('Error creating auth user:', error);
    return {
      success: false,
      error: error.message || 'Failed to create auth user'
    };
  }
};

/**
 * Creates a new student user with both auth and profile data
 * @param {Object} studentData - Student data including email and password
 * @returns {Promise<Object>} - The created student data or error
 */
export const createStudentWithAuth = async (studentData) => {
  try {
    const { email, password, ...profileData } = studentData;
    
    // 1. First create the auth user with all required fields
    const authResult = await createAuthUser({
      email,
      password: password || `${profileData.full_name.substring(0, 4).toLowerCase()}@${(profileData.phone || '1234').slice(-4)}`,
      user_metadata: {
        full_name: profileData.full_name,
        role: 'student',
        student_id: profileData.register_number,
        phone: profileData.phone,
        department_id: profileData.department_id,
        course_id: profileData.course_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });

    if (!authResult.success) {
      throw new Error(authResult.error);
    }

    const userId = authResult.user.id;

    // 2. Create the student profile
    const { data: studentProfile, error: profileError } = await supabase
      .from('students')
      .insert([{
        ...profileData,
        id: userId, // Use the same ID as auth user
        email,
        user_id: userId, // Link to auth user
        auth_user_id: userId, // Alternative link
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (profileError) {
      // Cleanup auth user if student creation fails
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(`Student profile creation failed: ${profileError.message}`);
    }

    // 3. Create credentials record
    const { error: credentialsError } = await supabase
      .from('manage_credentials')
      .insert({
        id: userId,
        student_id: userId,
        username: email,
        email: email,
        is_initial_password: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (credentialsError) {
      console.error('Credentials creation error (non-fatal):', credentialsError);
      // Don't fail the entire operation for credentials error
    }

    // 4. Update the auth user with the student ID
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...authResult.user.user_metadata,
        student_profile_id: studentProfile.id,
        updated_at: new Date().toISOString()
      }
    });

    if (updateError) {
      console.error('Failed to update auth user metadata:', updateError);
      // Non-fatal error, continue
    }

    return {
      success: true,
      data: {
        ...studentProfile,
        auth_user_id: userId
      }
    };

  } catch (error) {
    console.error('Error creating student with auth:', error);
    return {
      success: false,
      error: error.message || 'Failed to create student with authentication'
    };
  }
};
