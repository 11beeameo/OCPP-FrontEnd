// src/pages/company/CompanyEditPage.js
import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Alert,
  Breadcrumbs,
  Link,
  Button,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCompany, updateCompany } from '../../api/companyAPI';
import CompanyForm from '../../components/company/companyForm';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const CompanyEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const companyId = parseInt(id);

  // Fetch company details
  const { data: company, isLoading: isLoadingCompany, isError, error } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => getCompany(companyId),
    enabled: !!companyId && !isNaN(companyId)
  });

  // Update company mutation
  const mutation = useMutation({
    mutationFn: (data) => updateCompany(companyId, data),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['company', companyId] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      
      setSnackbar({
        open: true,
        message: 'Company updated successfully!',
        severity: 'success'
      });
      
      // Navigate back to company details after a brief delay
      setTimeout(() => {
        navigate(`/companies/${companyId}`);
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error updating company: ${error.message}`,
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

  if (isLoadingCompany) {
    return <LoadingSpinner />;
  }

  if (isError || !company) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'Error loading company'} />;
  }

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
            <Link 
              component={RouterLink} 
              to={`/companies/${companyId}`} 
              color="inherit"
            >
              {company.CompanyName}
            </Link>
            <Typography color="textPrimary">Edit</Typography>
          </Breadcrumbs>
          <Typography variant="h4">Edit {company.CompanyName}</Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to={`/companies/${companyId}`} 
          startIcon={<ArrowBackIcon />}
        >
          Back to Details
        </Button>
      </Box>

      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {mutation.error.message}
        </Alert>
      )}

      <CompanyForm 
        company={company}
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

export default CompanyEditPage;