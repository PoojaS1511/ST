import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { getSupabase } from '../../lib/supabase';
const supabase = getSupabase();
import { useNavigate } from 'react-router-dom';

const AdminOverview = () => {
  const { user, session, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalFaculty: 0,
    pendingFees: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('AdminOverview - isAuthenticated:', isAuthenticated, 'session:', !!session);

      if (!isAuthenticated || !session?.access_token) {
        console.log('Not authenticated or no session token, skipping data fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard data...');

        // Set the auth token for the session
        const { data: authData, error: authError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });

        if (authError) {
          throw new Error(`Auth error: ${authError.message}`);
        }

        // Use Promise.allSettled to prevent one failure from blocking others
        const [studentsRes, coursesRes, facultyRes, feesRes] = await Promise.allSettled([
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('faculty').select('*', { count: 'exact', head: true }),
          supabase.from('fees').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ]);

        // Helper function to safely extract count from response
        const getCount = (result) => {
          if (result.status !== 'fulfilled') {
            console.error('Request failed:', result.reason);
            return 0;
          }
          if (result.value.error) {
            console.error('Supabase error:', result.value.error);
            return 0;
          }
          return result.value.count || 0;
        };

        const statsData = {
          totalStudents: getCount(studentsRes),
          activeCourses: getCount(coursesRes),
          totalFaculty: getCount(facultyRes),
          pendingFees: getCount(feesRes),
        };

        console.log('Dashboard data fetched:', statsData);
        setStats(statsData);

      } catch (err) {
        console.error('Error in fetchDashboardData:', err);
        setError(err.message || 'Failed to load dashboard data');
        setStats({
          totalStudents: 0,
          activeCourses: 0,
          totalFaculty: 0,
          pendingFees: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, isAuthenticated]);

  // Handle unauthenticated state
  if (!isAuthenticated || !session) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', mt: 4 }}>
        <Alert
          severity="warning"
          sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/login', { state: { from: '/admin/dashboard' } })}
            >
              Login
            </Button>
          }
        >
          Please log in to view dashboard data
        </Alert>
      </Box>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {user?.full_name || user?.email?.split('@')[0] || 'Admin'}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">Total Students</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}>
                {stats.totalStudents}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">Active Courses</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'success.main' }}>
                {stats.activeCourses}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">Total Faculty</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'info.main' }}>
                {stats.totalFaculty}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">Pending Fees</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'warning.main' }}>
                {stats.pendingFees}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, minHeight: 200 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Recent Activity</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
                <Typography color="text.secondary">No recent activity</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminOverview;
