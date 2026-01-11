import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, CircularProgress, Alert, List, ListItem, ListItemText
} from '@mui/material';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import TransportService from '../../services/transportService';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    bus_name: '', route: '', capacity: '', driver_name: '', faculty_id: '',
  });

  useEffect(() => { loadRoutes(); }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const result = await TransportService.getRoutes();
      if (!result.success) throw new Error(result.error);
      setRoutes(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        bus_name: route.bus_name, route: route.route, capacity: route.capacity.toString(),
        driver_name: route.driver_name, faculty_id: route.faculty_id || '',
      });
    } else {
      setEditingRoute(null);
      setFormData({
        bus_name: '', route: '', capacity: '', driver_name: '', faculty_id: '',
      });
    }
    setOpenDialog(true);
  };

  const handleViewRoute = async (route) => {
    const result = await TransportService.getRouteById(route.id);
    if (result.success) {
      setSelectedRoute(result.data);
      setViewDialog(true);
    }
  };

  const handleCloseDialog = () => { setOpenDialog(false); setEditingRoute(null); };
  const handleCloseViewDialog = () => { setViewDialog(false); setSelectedRoute(null); };

  const handleSubmit = async () => {
    try {
      if (editingRoute) {
        await TransportService.updateRoute(editingRoute.id, formData);
      } else {
        await TransportService.addRoute(formData);
      }
      handleCloseDialog();
      loadRoutes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await TransportService.deleteRoute(id);
        loadRoutes();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredRoutes = routes.filter(route =>
    route.bus_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Box className="flex items-center justify-center min-h-screen"><CircularProgress /></Box>;
  }

  return (
    <Box className="p-6 space-y-6">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold mb-2">Route Management</Typography>
          <Typography variant="body1" color="text.secondary">Manage transport routes and stops</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700">Add Route</Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Card><CardContent>
        <TextField placeholder="Search routes..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <Search size={20} className="mr-2 text-gray-400" /> }}
          className="w-full" size="small" />
      </CardContent></Card>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold">ID</TableCell>
                <TableCell className="font-semibold">Bus Name</TableCell>
                <TableCell className="font-semibold">Route</TableCell>
                <TableCell className="font-semibold">Capacity</TableCell>
                <TableCell className="font-semibold">Driver Name</TableCell>
                <TableCell className="font-semibold">Faculty ID</TableCell>
                <TableCell className="font-semibold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id} hover className="cursor-pointer" onClick={() => handleViewRoute(route)}>
                  <TableCell>{route.id}</TableCell>
                  <TableCell className="font-medium">{route.bus_name}</TableCell>
                  <TableCell>{route.route}</TableCell>
                  <TableCell>{route.capacity}</TableCell>
                  <TableCell>{route.driver_name}</TableCell>
                  <TableCell>{route.faculty_id || 'N/A'}</TableCell>
                  <TableCell>
                    <Box className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={() => handleOpenDialog(route)} className="text-blue-600">
                        <Edit size={18} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(route.id)} className="text-red-600">
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">{editingRoute ? 'Edit Route' : 'Add Route'}</Typography>
          <IconButton onClick={handleCloseDialog} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField label="Bus Name" value={formData.bus_name}
              onChange={(e) => setFormData({ ...formData, bus_name: e.target.value })} fullWidth required />
            <TextField label="Route" value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })} fullWidth required />
            <TextField label="Capacity" type="number" value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} fullWidth required />
            <TextField label="Driver Name" value={formData.driver_name}
              onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })} fullWidth required />
            <TextField label="Faculty ID (Optional)" value={formData.faculty_id}
              onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {editingRoute ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">Route Details</Typography>
          <IconButton onClick={handleCloseViewDialog} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedRoute && (
            <Box className="space-y-4">
              <Box className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <Box>
                  <Typography variant="body2" color="text.secondary">ID</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Bus Name</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.bus_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Route</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.route}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Capacity</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.capacity}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Driver Name</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.driver_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Faculty ID</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.faculty_id || 'N/A'}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RouteManagement;