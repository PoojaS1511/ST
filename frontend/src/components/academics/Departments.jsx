import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Alert, CircularProgress, Snackbar, Tooltip, Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { API_URL } from '../../config';
import axios from 'axios';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState(() => ({
    name: '',
    code: '',
    head_of_department: '',
    duration: '4 years',
    duration_years: 4,
    total_semesters: 8
  }));

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/academics/departments`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        withCredentials: true
      });

      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError(error.response?.data?.error || 'Failed to fetch departments');
      showSnackbar('Error fetching departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - departments.length) : 0;

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value || '')
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      head_of_department: '',
      duration: '4 years',
      duration_years: 4,
      total_semesters: 8
    });
    setEditingId(null);
  };

  const handleOpenDialog = (dept = null) => {
    if (dept) {
      setFormData({
        name: dept.name || '',
        code: dept.code || '',
        head_of_department: dept.head_of_department || '',
        duration: dept.duration || '4 years',
        duration_years: dept.duration_years || 4,
        total_semesters: dept.total_semesters || 8
      });
      setEditingId(dept.id);
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const url = `${API_URL}/academics/departments`;
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await axios({
        method,
        url: editingId ? `${url}/${editingId}` : url,
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        withCredentials: true
      });

      if (response.data.success) {
        showSnackbar(
          editingId ? 'Department updated successfully' : 'Department created successfully'
        );
        fetchDepartments();
        handleCloseDialog();
      }

      if (response.data.success) {
        setOpen(false);
        setFormData({ name: '', code: '', head_of_department: '' });
        setEditingId(null);
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error saving department:', error);
      setError(error.response?.data?.error || 'Failed to save department');
    }
  };

  const handleEdit = (dept) => {
    handleOpenDialog(dept);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department? This will also delete all associated courses, subjects, and exams.')) {
      try {
        const response = await axios.delete(`${API_URL}/academics/departments/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          withCredentials: true
        });

        if (response.data.success) {
          showSnackbar('Department deleted successfully');
          fetchDepartments();
        }
      } catch (error) {
        console.error('Error deleting department:', error);
        showSnackbar(error.response?.data?.error || 'Failed to delete department', 'error');
      }
    }
  };


  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Departments Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Department
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Years</TableCell>
                    <TableCell>Semesters</TableCell>
                    <TableCell>Head of Department</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.length > 0 ? (
                    departments
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((dept) => (
                        <TableRow key={dept.id} hover>
                          <TableCell>{dept.name}</TableCell>
                          <TableCell>{dept.code}</TableCell>
                          <TableCell>{dept.duration || 'N/A'}</TableCell>
                          <TableCell>{dept.duration_years || 'N/A'}</TableCell>
                          <TableCell>{dept.total_semesters || 'N/A'}</TableCell>
                          <TableCell>{dept.head_of_department || 'N/A'}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEdit(dept)} size="small">
                                <EditIcon color="primary" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => handleDelete(dept.id)} size="small">
                                <DeleteIcon color="error" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        No departments found. Start by adding a new department.
                      </TableCell>
                    </TableRow>
                  )}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={7} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={departments.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Department Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Department' : 'Add New Department'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="name"
                  label="Department Name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="code"
                  label="Department Code"
                  value={formData.code || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="duration"
                  label="Duration"
                  value={formData.duration}
                  onChange={handleChange}
                  helperText="e.g., 4 years"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="duration_years"
                  label="Duration (Years)"
                  type="number"
                  value={formData.duration_years}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="total_semesters"
                  label="Total Semesters"
                  type="number"
                  value={formData.total_semesters}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 20 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="head_of_department"
                  label="Head of Department"
                  value={formData.head_of_department || ''}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={!formData.name || !formData.code}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Departments;
