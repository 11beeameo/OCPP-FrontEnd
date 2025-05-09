// src/pages/site/SiteCreatePage.js
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
import { getCompany } from '../../api/companyAPI';
import { createSite } from '../../api/siteAPI';
import SiteForm from '../../components/site/SiteForm';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

// First, let's update the siteApi.js to add the createSite function
// This should be added to your siteApi.js file:
/*
export const createSite = async (siteData) => {
  try {
    const response = await apiClient.post(SITES_URL, siteData);
    return response.data;
  } catch (error) {
    console.error('Error creating site:', error);
    throw error;
  }
};
*/

const SiteCreatePage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const companyIdNum = parseInt(companyId);

  // Fetch company details to display company name
  const { data: company, isLoading: isLoadingCompany, isError: isCompanyError, error: companyError } = useQuery({
    queryKey: ['company', companyIdNum],
    queryFn: () => getCompany(companyIdNum),
    enabled: !!companyIdNum && !isNaN(companyIdNum)
  });

  // Create site mutation
  const mutation = useMutation({
    mutationFn: createSite,
    onSuccess: (data) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['company-sites', companyIdNum] });
      
      setSnackbar({
        open: true,
        message: 'Site created successfully!',
        severity: 'success'
      });
      
      // Navigate back to company details after a brief delay
      setTimeout(() => {
        navigate(`/companies/${companyIdNum}`);
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error creating site: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const handleSubmit = async (data) => {
    try {
      await mutation.mutateAsync(data);
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

  if (isCompanyError || !company) {
    return <ErrorAlert message={companyError instanceof Error ? companyError.message : 'Error loading company'} />;
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
              to={`/companies/${companyIdNum}`} 
              color="inherit"
            >
              {company.CompanyName}
            </Link>
            <Typography color="textPrimary">New Site</Typography>
          </Breadcrumbs>
          <Typography variant="h4">Create New Site for {company.CompanyName}</Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to={`/companies/${companyIdNum}`} 
          startIcon={<ArrowBackIcon />}
        >
          Back to Company
        </Button>
      </Box>

      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {mutation.error.message}
        </Alert>
      )}

      <SiteForm 
        companyId={companyIdNum}
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

export default SiteCreatePage;