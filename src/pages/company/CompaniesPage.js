// src/pages/company/CompaniesPage.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getCompanies, deleteCompany } from '../../api/companyAPI';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const CompaniesPage = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch companies with enabled=true
  const { data: companies, isLoading, isError, error } = useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies(true)
  });

  // Delete company mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setSnackbar({
        open: true,
        message: 'Company deleted successfully',
        severity: 'success'
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error deleting company: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const handleDeleteClick = (companyId) => {
    setCompanyToDelete(companyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (companyToDelete) {
      deleteMutation.mutate(companyToDelete);
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'Failed to load companies'} />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Companies</Typography>
        <Button 
          component={Link} 
          to="/companies/new" 
          variant="contained" 
          startIcon={<AddIcon />}
        >
          Add Company
        </Button>
      </Box>

      {companies && companies.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No companies found
          </Typography>
          <Button 
            component={Link} 
            to="/companies/new" 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add Your First Company
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {companies && companies.map((company) => (
            <Grid item xs={12} md={6} lg={4} key={company.CompanyId}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {company.CompanyName}
                    </Typography>
                    <Chip 
                      label={company.CompanyEnabled ? "Active" : "Inactive"} 
                      color={company.CompanyEnabled ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ID: {company.CompanyId}
                  </Typography>
                  
                  {company.CompanyBrandColour && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary" mr={1}>
                        Brand Color:
                      </Typography>
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          bgcolor: company.CompanyBrandColour,
                          borderRadius: 1,
                          border: '1px solid #ccc'
                        }} 
                      />
                    </Box>
                  )}
                  
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <IconButton 
                      component={Link} 
                      to={`/companies/${company.CompanyId}`}
                      aria-label="view"
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      component={Link} 
                      to={`/companies/${company.CompanyId}/edit`}
                      aria-label="edit"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete"
                      color="error"
                      onClick={() => handleDeleteClick(company.CompanyId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Company</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this company? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompaniesPage;