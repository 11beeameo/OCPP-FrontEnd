// src/pages/company/CompanyCreatePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Alert,
  Breadcrumbs,
  Link,
  Button,
  Snackbar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createCompany } from '../../api/companyAPI';
import CompanyForm from '../../components/company/companyForm';

const CompanyCreatePage = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const mutation = useMutation({
    mutationFn: createCompany,
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: 'Company created successfully!',
        severity: 'success'
      });
      // Navigate to the company details page after creation
      setTimeout(() => {
        navigate(`/companies/${data.CompanyId}`);
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error creating company: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const handleSubmit = async (data) => {
    // Clean up empty strings to be null
    const formData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => 
        [key, value === '' ? null : value]
      )
    );
    
    try {
      await mutation.mutateAsync(formData);
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Breadcrumbs aria-label="breadcrumb" mb={1}>
            <Link component={RouterLink} to="/" color="inherit">
              Dashboard
            </Link>
            <Link component={RouterLink} to="/companies" color="inherit">
              Companies
            </Link>
            <Typography color="textPrimary">Create</Typography>
          </Breadcrumbs>
          <Typography variant="h4">Create New Company</Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to="/companies" 
          startIcon={<ArrowBackIcon />}
        >
          Back to Companies
        </Button>
      </Box>

      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {mutation.error.message}
        </Alert>
      )}

      <CompanyForm 
        onSubmit={handleSubmit} 
        isLoading={mutation.isPending}
      />

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

export default CompanyCreatePage;