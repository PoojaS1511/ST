import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import { feesService } from '../../services/feesService';

const NewFeeForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    due_date: '',
    status: 'unpaid',
    fee_type: 'Tuition',
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash',
    transaction_id: '',
    late_fee: '0',
    semester: '1',
    academic_year: new Date().getFullYear().toString(),
    notes: ''
  });
  
  // Fetch students and fee types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students using the feesService
        const studentsData = await feesService.getStudents();
        
        // Define common fee types instead of fetching fee structures
        const commonFeeTypes = [
          { id: 'Tuition', name: 'Tuition Fee', amount: 50000 },
          { id: 'Hostel', name: 'Hostel Fee', amount: 25000 },
          { id: 'Library', name: 'Library Fee', amount: 5000 },
          { id: 'Lab', name: 'Laboratory Fee', amount: 10000 },
          { id: 'Transport', name: 'Transport Fee', amount: 8000 },
          { id: 'Exam', name: 'Examination Fee', amount: 3000 },
          { id: 'Sports', name: 'Sports Fee', amount: 2000 },
          { id: 'Other', name: 'Other Fee', amount: 0 }
        ];
        
        setStudents(studentsData || []);
        setFeeStructures(commonFeeTypes);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed - ${name}:`, value);
    
    // If fee type is being changed, update the amount
    if (name === 'fee_type') {
      const selectedFee = feeStructures.find(fee => fee.id === value);
      console.log('Selected fee type:', selectedFee);
      if (selectedFee) {
        setFormData(prev => ({
          ...prev,
          fee_type: value,
          amount: selectedFee.amount.toString()
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Form data before submission:', formData);
      
      // Validate required fields
      if (!formData.student_id) {
        throw new Error('Please select a student');
      }
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!formData.due_date) {
        throw new Error('Please select a due date');
      }

      // Prepare payment data matching the fee_payments table schema
      const paymentData = {
        student_id: formData.student_id,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        status: formData.status,
        fee_type: formData.fee_type,
        payment_date: formData.status === 'paid' ? formData.payment_date : null,
        payment_mode: formData.status === 'paid' ? formData.payment_mode : null,
        transaction_id: formData.status === 'paid' ? formData.transaction_id || null : null,
        late_fee: parseFloat(formData.late_fee) || 0,
        semester: parseInt(formData.semester),
        academic_year: formData.academic_year
      };
      
      console.log('Submitting payment with data:', paymentData);
      
      // Direct Supabase insertion to match table schema
      const { data, error } = await supabase
        .from('fee_payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Payment recorded successfully:', data);
      
      // Show success message and redirect
      navigate('/admin/fees', { 
        state: { 
          message: 'Fee payment recorded successfully!',
          severity: 'success'
        } 
      });
    } catch (err) {
      console.error('Error in handleSubmit:', {
        message: err.message,
        error: err,
        stack: err.stack
      });
      
      // Provide more user-friendly error messages
      let errorMessage = err.message || 'Failed to record payment';
      
      if (errorMessage.includes('violates foreign key constraint')) {
        errorMessage = 'Invalid student reference. Please check the selected student.';
      } else if (errorMessage.includes('invalid input syntax')) {
        errorMessage = 'Invalid data format. Please check your input and try again.';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (errorMessage.includes('duplicate key')) {
        errorMessage = 'A payment with these details already exists.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Fees
        </Button>
        
        <Card>
          <CardHeader 
            title="Record New Fee Payment" 
            titleTypographyProps={{ variant: 'h5' }}
          />
          
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Student</InputLabel>
                    <Select
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      label="Student"
                      required
                    >
                      {students.map((student) => (
                        <MenuItem key={student.id} value={student.id}>
                          {student.full_name} ({student.register_number})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Fee Type</InputLabel>
                    <Select
                      name="fee_type"
                      value={formData.fee_type}
                      onChange={handleChange}
                      label="Fee Type"
                      required
                    >
                      {feeStructures.map((fee) => (
                        <MenuItem key={fee.id} value={fee.id}>
                          {fee.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0, step: '0.01' }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Due Date"
                    name="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Status"
                    >
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="unpaid">Unpaid</MenuItem>
                      <MenuItem value="partial">Partial</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Late Fee"
                    name="late_fee"
                    type="number"
                    value={formData.late_fee}
                    onChange={handleChange}
                    inputProps={{ min: 0, step: '0.01' }}
                  />
                </Grid>
                
                {formData.status === 'paid' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Payment Date"
                        name="payment_date"
                        type="date"
                        value={formData.payment_date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Payment Mode</InputLabel>
                        <Select
                          name="payment_mode"
                          value={formData.payment_mode}
                          onChange={handleChange}
                          label="Payment Mode"
                        >
                          <MenuItem value="cash">Cash</MenuItem>
                          <MenuItem value="card">Card</MenuItem>
                          <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                          <MenuItem value="upi">UPI</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Transaction ID"
                        name="transaction_id"
                        value={formData.transaction_id}
                        onChange={handleChange}
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Semester</InputLabel>
                    <Select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      label="Semester"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <MenuItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Academic Year"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => navigate('/admin/fees')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Payment'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default NewFeeForm;
