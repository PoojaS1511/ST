import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Card, CardContent, Divider,
  Tabs, Tab, Grid, Chip, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`semester-tabpanel-${index}`}
      aria-labelledby={`semester-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `semester-tab-${index}`,
    'aria-controls': `semester-tabpanel-${index}`,
  };
}

const StudentResults = () => {
  console.log('[StudentResults] Component rendering');
  const [results, setResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const { user } = useAuth();
  
  // Log user authentication status
  console.log('[StudentResults] User auth status:', user ? 'Authenticated' : 'Not authenticated');
  if (user) {
    console.log('[StudentResults] User ID:', user.id);
    console.log('[StudentResults] User email:', user.email);
  }

  // Log when component mounts and unmounts
  useEffect(() => {
    console.log('[StudentResults] Component mounted');
    console.log('[StudentResults] Starting to fetch results...');
    fetchResults();
    
    return () => {
      console.log('[StudentResults] Component unmounting');
    };
  }, []);
  
  // Log when results or semesters change
  useEffect(() => {
    console.log('[StudentResults] Results updated:', {
      resultsCount: results.length,
      semesters: semesters,
      currentSemester: value,
      loading: loading,
      error: error
    });
  }, [results, semesters, value, loading, error]);

  const fetchResults = async () => {
    try {
      console.log('[StudentResults] Starting to fetch results...');
      setLoading(true);
      setError(null);

      if (!user) {
        const errorMsg = 'User not authenticated';
        console.error('[StudentResults]', errorMsg);
        throw new Error(errorMsg);
      }
      console.log('[StudentResults] User authenticated with ID:', user.id);

      // Fetch student's academic records
      console.log('[StudentResults] Fetching student data for user:', user.id);
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, enrollment_number, current_semester')
        .eq('user_id', user.id)
        .single();

      if (studentError) {
        console.error('[StudentResults] Error fetching student data:', studentError);
        throw studentError;
      }
      
      if (!studentData) {
        const errorMsg = 'Student record not found';
        console.error('[StudentResults]', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('[StudentResults] Student data retrieved:', {
        id: studentData.id,
        enrollment_number: studentData.enrollment_number,
        current_semester: studentData.current_semester
      });

      // Fetch internal marks for the student
      console.log('[StudentResults] Fetching internal marks for student ID:', studentData.id);
      const { data: internalMarks, error: marksError } = await supabase
        .from('internal_marks')
        .select(`
          id,
          assessment_type,
          marks_obtained,
          max_marks,
          entered_at,
          remarks,
          exam:exams(
            id,
            name,
            exam_type:exam_types(name),
            subject:subjects(name, code, semester)
          ),
          faculty_subject:faculty_subject_assignments(
            faculty:faculty(
              id,
              name
            ),
            subject:subjects!faculty_subject_assignments_subject_id_fkey(
              id,
              name,
              code,
              semester
            )
          )
        `)
        .eq('student_id', studentData.id)
        .order('entered_at', { ascending: false });

      if (marksError) {
        console.error('[StudentResults] Error fetching internal marks:', marksError);
        throw marksError;
      }

      console.log('[StudentResults] Raw internal marks data:', internalMarks);

      // Transform the data to match the expected format
      const formattedResults = internalMarks.map(mark => {
        const subject = mark.exam?.subject || mark.faculty_subject?.subject;
        const examType = mark.assessment_type || mark.exam?.exam_type?.name || 'Internal Assessment';
        const semester = subject?.semester || studentData.current_semester || 1;
        
        const formatted = {
          id: mark.id,
          student_id: studentData.enrollment_number,
          subject_id: subject?.name || 'Unknown Subject',
          subject_code: subject?.code || '',
          exam_type: examType,
          max_marks: mark.max_marks || 0,
          marks_obtained: mark.marks_obtained,
          grade: calculateGrade(mark.marks_obtained, mark.max_marks),
          exam_date: mark.entered_at,
          semester: semester,
          remarks: mark.remarks || '',
          _raw: mark // Keep raw data for debugging
        };

        console.log('[StudentResults] Formatted mark:', formatted);
        return formatted;
      });

      console.log('[StudentResults] All formatted results:', formattedResults);
      setResults(formattedResults);
      
      // Extract unique semesters
      const uniqueSemesters = [...new Set(formattedResults.map(item => item.semester))]
        .sort((a, b) => a - b);
      
      console.log('[StudentResults] Unique semesters found:', uniqueSemesters);
      setSemesters(uniqueSemesters);
      
      if (uniqueSemesters.length > 0) {
        console.log(`[StudentResults] Setting active semester to: ${uniqueSemesters[0]}`);
        setValue(uniqueSemesters[0]);
      } else {
        console.log('[StudentResults] No semesters found with marks');
      }
      
    } catch (error) {
      const errorMsg = error.message || 'Failed to load results. Please try again later.';
      console.error('[StudentResults] Error in fetchResults:', {
        error,
        message: error.message,
        stack: error.stack
      });
      
      setError(errorMsg);
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      console.log('[StudentResults] Finished loading results');
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    console.log(`[StudentResults] Semester tab changed from ${value} to ${newValue}`);
    setValue(newValue);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'success';
      case 'A': return 'success';
      case 'B': return 'primary';
      case 'C': return 'warning';
      case 'D': return 'error';
      case 'F': return 'error';
      default: return 'default';
    }
  };

  const getSubjectResults = (subject, semester) => {
    const subjectResults = results.filter(
      result => result.subject_id === subject && result.semester === semester
    );
    console.log(`[StudentResults] getSubjectResults - Subject: ${subject}, Semester: ${semester}, Found: ${subjectResults.length} results`);
    return subjectResults;
  };

  // Helper function to calculate grade based on marks
  const calculateGrade = (marksObtained, maxMarks) => {
    if (!marksObtained || !maxMarks) return 'N/A';
    
    const percentage = (marksObtained / maxMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getSubjects = (semester) => {
    const subjects = [...new Set(
      results
        .filter(result => result.semester === semester)
        .map(result => result.subject_id)
    )];
    console.log(`[StudentResults] getSubjects - Semester: ${semester}, Found: ${subjects.length} subjects`);
    return subjects;
  };

  const calculateSGPA = (semester) => {
    const semesterResults = results.filter(result => result.semester === semester);
    const gradePoints = {
      'A+': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'F': 0
    };
    
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    // Assuming each subject has 4 credits (you may need to adjust this)
    const creditsPerSubject = 4;
    
    const subjects = getSubjects(semester);
    
    subjects.forEach(subject => {
      const subjectResults = getSubjectResults(subject, semester);
      const bestResult = subjectResults.reduce((best, current) => {
        return (best.marks_obtained > current.marks_obtained) ? best : current;
      }, { marks_obtained: 0 });
      
      if (bestResult.grade && gradePoints[bestResult.grade] !== undefined) {
        totalGradePoints += gradePoints[bestResult.grade] * creditsPerSubject;
        totalCredits += creditsPerSubject;
      }
    });
    
    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 'N/A';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const currentSemesterResults = results.filter(
    result => result.semester === semesters[value]
  );

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Academic Results
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {results.length > 0 
              ? `Showing results for ${results[0]?.student_name || 'student'}`
              : 'No results found'}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          {semesters && semesters.length > 0 ? (
            <>
              <Tabs
                value={value}
                onChange={(e, newValue) => setValue(newValue)}
                aria-label="semester tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3 }}
              >
                {semesters.map((semester, index) => (
                  <Tab 
                    key={semester} 
                    label={`Semester ${semester}`} 
                    value={semester}
                    {...a11yProps(index)} 
                  />
                ))}
              </Tabs>

              {currentSemesterResults && currentSemesterResults.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Subject Code</TableCell>
                        <TableCell>Exam Type</TableCell>
                        <TableCell align="right">Marks Obtained</TableCell>
                        <TableCell align="right">Max Marks</TableCell>
                        <TableCell align="center">Grade</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentSemesterResults.map((result) => (
                        <TableRow key={`${result.subject_code}-${result.exam_type}-${result.exam_date}`}>
                          <TableCell>{result.subject_id || 'N/A'}</TableCell>
                          <TableCell>{result.subject_code || 'N/A'}</TableCell>
                          <TableCell>{result.exam_type || 'N/A'}</TableCell>
                          <TableCell align="right">{result.marks_obtained ?? 'N/A'}</TableCell>
                          <TableCell align="right">{result.max_marks ?? 'N/A'}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={result.grade || 'N/A'} 
                              color={getGradeColor(result.grade || '')} 
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {result.exam_date ? new Date(result.exam_date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No results found for this semester.
                </Alert>
              )}
            </>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No academic records found for this student.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentResults;
