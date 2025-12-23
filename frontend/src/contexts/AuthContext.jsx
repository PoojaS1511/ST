import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
  PARENT: 'parent',
  DRIVER: 'driver'
};

// Cache for user data to prevent duplicate fetches
const userDataCache = new Map();

const fetchUserData = async (userId, userEmail) => {
  if (!userId) return { role: null, userData: null };
  
  const cacheKey = `${userId}:${userEmail}`;
  
  // Return cached data if available
  if (userDataCache.has(cacheKey)) {
    console.log('[Auth] Using cached user data for:', cacheKey);
    return userDataCache.get(cacheKey);
  }
  
  try {
    console.log(`[Auth] Fetching user data for ID: ${userId}`);
    
    // Get the current session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.warn('[Auth] No active session found');
      return { role: null, userData: null };
    }
    
    if (!userEmail) {
      userEmail = session.user?.email;
      if (!userEmail) {
        console.warn('[Auth] No email found in session');
        return { role: null, userData: null };
      }
    }
    
    // Get user's role from app_metadata or user_metadata
    const userRole = session.user?.user_metadata?.role || 
                    session.user?.app_metadata?.role ||
                    (userEmail.endsWith('@college.edu') ? 'admin' : 'student');
    
    // For admin users, return early with admin role
    if (userRole === 'admin') {
      const adminData = {
        role: 'admin',
        userData: {
          id: userId,
          email: userEmail,
          role: 'admin',
          name: session.user.user_metadata?.full_name || userEmail.split('@')[0]
        }
      };
      userDataCache.set(cacheKey, adminData);
      return adminData;
    }
    
    // For non-admin users, check the students table
    console.log('[Auth] Checking students table for user:', userEmail);
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('id, name, email, user_id')
      .eq('email', userEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (studentError) {
      console.warn('[Auth] Student query error:', studentError);
      return { role: null, userData: null };
    }
    
    if (studentData) {
      const result = { 
        role: 'student',
        userData: { 
          id: studentData.id,
          name: studentData.name,
          email: studentData.email,
          role: 'student',
          user_id: studentData.user_id
        }
      };
      userDataCache.set(cacheKey, result);
      return result;
    }
    
    // If we get here, the user is authenticated but not in the students table
    console.log('[Auth] User not found in students table');
    return { role: null, userData: null };
    
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    return { role: null, userData: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMounted = useRef(true);
  const authListener = useRef(null);

  const updateUserState = useCallback(async (newSession) => {
    if (!isMounted.current) return null;
    
    setLoading(true);
    
    try {
      // If no session, clear everything
      if (!newSession?.user) {
        setUser(null);
        setSession(null);
        return null;
      }

      // Store the access token in localStorage
      const accessToken = newSession.access_token || newSession.session?.access_token;
      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
      }
      
      const userEmail = newSession.user.email?.toLowerCase();
      const currentPath = window.location.pathname;
      
      // Check for admin email first
      const isAdminEmail = userEmail?.endsWith('@college.edu') || userEmail === 'admin@college.edu';
      
      if (isAdminEmail) {
        const adminUser = {
          ...newSession.user,
          role: 'admin',
          name: newSession.user.user_metadata?.full_name || userEmail.split('@')[0],
          email: userEmail,
          id: newSession.user.id
        };
        
        if (isMounted.current) {
          setUser(adminUser);
          setSession(newSession);
          
          // Only redirect if not already on an admin route
          if (!currentPath.startsWith('/admin')) {
            navigate('/admin/dashboard', { replace: true });
          }
        }
        return adminUser;
      }
      
      // For non-admin users, fetch user data
      const { role, userData } = await fetchUserData(newSession.user.id, userEmail);
      const userWithRole = {
        ...newSession.user,
        role: role || 'student',
        ...(userData || {})
      };
      
      if (isMounted.current) {
        setUser(userWithRole);
        setSession(newSession);
      }
      
      return userWithRole;
      
    } catch (error) {
      console.error('Error updating user state:', error);
      if (isMounted.current) {
        setUser(null);
        setSession(null);
      }
      return null;
    } finally {
      if (isMounted.current) {
        if (!isInitialized) {
          setIsInitialized(true);
        }
        setLoading(false);
      }
    }
  }, [isInitialized, navigate]);

  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      const errorMsg = 'Email and password are required';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Clear any previous errors
    setError('');
    setLoading(true);
    
    try {
      // Trim and normalize email
      email = email.trim().toLowerCase();
      console.log('[Auth] Attempting login for:', email);
      
      // Sign in with email and password
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: password.trim(),
      });

      if (signInError) {
        console.error('[Auth] Sign in error:', signInError);
        let errorMsg = 'An error occurred during login';
        
        // Handle specific error cases
        if (signInError.message.includes('Invalid login credentials')) {
          errorMsg = 'Invalid email or password';
        } else if (signInError.message.includes('Email not confirmed')) {
          errorMsg = 'Please verify your email before logging in';
        } else if (signInError.message) {
          errorMsg = signInError.message;
        }
        
        throw new Error(errorMsg);
      }
      
      if (!authData?.session) {
        throw new Error('No session returned from authentication');
      }
      
      // Update user state with the new session
      const updatedUser = await updateUserState(authData.session);
      
      return {
        success: true,
        user: updatedUser,
        session: authData.session
      };
      
    } catch (error) {
      console.error('Login error:', error);
      if (isMounted.current) {
        setError(error.message || 'An unexpected error occurred during login');
      }
      throw error; // Re-throw to allow calling code to handle
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [updateUserState]);

  const logout = useCallback(async () => {
    if (!isMounted.current) return { success: false, error: 'Component unmounted' };
    
    setLoading(true);
    
    try {
      // Clear any cached data
      userDataCache.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear local state
      if (isMounted.current) {
        setUser(null);
        setSession(null);
        setError('');
        
        // Clear sensitive data from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('userRole');
        
        // Navigate to login page
        navigate('/login', { replace: true });
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Logout error:', error);
      if (isMounted.current) {
        setError(error.message || 'Failed to log out');
      }
      return { 
        success: false, 
        error: error.message || 'Failed to log out' 
      };
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [navigate]);

  const signUp = useCallback(async (email, password, userData = {}) => {
    if (!isMounted.current) return { success: false, error: 'Component unmounted' };
    
    setLoading(true);
    setError('');
    
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Normalize email
      email = email.trim().toLowerCase();
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password.trim(),
        options: {
          data: {
            ...userData,
            role: userData.role || 'student',
            full_name: userData.name || email.split('@')[0],
            updated_at: new Date().toISOString()
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        },
      });

      if (error) throw error;
      
      // Clear any cached data
      userDataCache.clear();
      
      // If this is a new user, you might want to create additional records
      // For example, in a students or profiles table
      if (data?.user) {
        const role = data.user.user_metadata?.role || 'student';
        
        if (role === 'student') {
          const { error: profileError } = await supabase
            .from('students')
            .upsert([
              {
                user_id: data.user.id,
                email: data.user.email,
                name: userData.name || email.split('@')[0],
                // Add other student-specific fields here
              }
            ], {
              onConflict: 'user_id'
            });
            
          if (profileError) {
            console.error('Error creating student profile:', profileError);
            // Don't fail the signup if profile creation fails
          }
        }
      }
      
      return { 
        success: true, 
        user: data.user,
        session: data.session
      };
      
    } catch (error) {
      console.error('Signup error:', error);
      if (isMounted.current) {
        setError(error.message || 'Failed to create account');
      }
      return { 
        success: false, 
        error: error.message || 'Failed to create account' 
      };
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    isMounted.current = true;
    let mounted = true;
    
    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        
        console.log('Initial session:', session ? 'found' : 'not found');
        
        if (session) {
          await updateUserState(session);
        } else if (mounted) {
          setUser(null);
          setSession(null);
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setLoading(false);
        }
      }
    };
    
    // Set up auth state change listener
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event);
      
      try {
        switch (event) {
          case 'SIGNED_IN':
            if (session) {
              const updatedUser = await updateUserState(session);
              if (updatedUser?.role === 'admin' && location.pathname !== '/admin/dashboard') {
                navigate('/admin/dashboard', { replace: true });
              }
            }
            break;
            
          case 'SIGNED_OUT':
            if (mounted) {
              setUser(null);
              setSession(null);
              userDataCache.clear(); // Clear cache on sign out
            }
            break;
            
          case 'TOKEN_REFRESHED':
            if (session) {
              // Update session in state without triggering full re-fetch
              if (mounted) {
                setSession(prev => ({ ...prev, ...session }));
              }
            }
            break;
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setLoading(false);
        }
      }
    });
    
    authListener.current = data;
    
    // Initialize auth state
    initializeAuth();
    
    // Cleanup function
    return () => {
      mounted = false;
      isMounted.current = false;
      if (authListener.current?.subscription) {
        authListener.current.subscription.unsubscribe();
      }
    };
  }, [updateUserState, location.pathname, navigate]);

  /**
   * Checks if the current user has any of the specified roles
   * @param {string|string[]} roles - Single role or array of roles to check against
   * @returns {boolean} True if user has any of the specified roles or is an admin
   */
  const hasAnyRole = useCallback((roles) => {
    if (!user?.role) return false;
    // Convert single role to array for consistent handling
    if (!Array.isArray(roles)) roles = [roles];
    // Admin users have access to everything
    if (user.role === ROLES.ADMIN) return true;
    // Check if user has any of the required roles
    return roles.some(role => role === user.role);
  }, [user]);

  // Alias for hasAnyRole with a single role for backward compatibility
  const hasRole = useCallback((role) => hasAnyRole(role), [hasAnyRole]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isLoading: loading,
    error,
    login,
    logout,
    signUp,
    updateUser: updateUserState,
    isAuthenticated: !!user,
    isInitialized,
    isInitializing: !isInitialized,
    hasAnyRole,
    hasRole,
  }), [user, session, loading, error, login, logout, signUp, updateUserState, isInitialized, hasAnyRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const withAuth = (Component, allowedRoles = []) => {
  return function WithAuthWrapper(props) {
    const { isAuthenticated, loading, hasAnyRole } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return null;
    if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
      return <div>You don't have permission to access this page.</div>;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;