// src/pages/charger/ChargerCreatePage.js
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
import { getSite } from '../../api/siteAPI';
import { createCharger } from '../../api/chargerAPI';
import ChargerForm from '../../components/charger/ChargerForm';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

// First, update chargerApi.js to add the createCharger function:
/*
export const createCharger = async (chargerData) => {
  try {
    const response = await apiClient.post(CHARGERS_URL, chargerData);
    return response.data;
  } catch (error) {
    console.error('Error creating charger:', error);
    throw error;
  }
};
*/

const ChargerCreatePage = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const siteIdNum = parseInt(siteId);

  // Fetch site details
  const { data: site, isLoading: isLoadingSite, isError: isSiteError, error: siteError } = useQuery({
    queryKey: ['site', siteIdNum],
    queryFn: () => getSite(siteIdNum),
    enabled: !!siteIdNum && !isNaN(siteIdNum)
  });

  // Fetch company details once we have the site
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', site?.SiteCompanyID],
    queryFn: () => getCompany(site.SiteCompanyID),
    enabled: !!site?.SiteCompanyID
  });

  // Create charger mutation
  const mutation = useMutation({
    mutationFn: createCharger,
    onSuccess: (data) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['site-chargers', siteIdNum, site?.SiteCompanyID] });
      
      setSnackbar({
        open: true,
        message: 'Charger created successfully!',
        severity: 'success'
      });
      
      // Navigate back to site details after a brief delay
      setTimeout(() => {
        navigate(`/sites/${siteIdNum}`);
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error creating charger: ${error.message}`,
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

  if (isLoadingSite || isLoadingCompany) {
    return <LoadingSpinner />;
  }

  if (isSiteError || !site) {
    return <ErrorAlert message={siteError instanceof Error ? siteError.message : 'Error loading site'} />;
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
            {company && (
              <Link 
                component={RouterLink} 
                to={`/companies/${site.SiteCompanyID}`} 
                color="inherit"
              >
                {company.CompanyName}
              </Link>
            )}
            <Link 
              component={RouterLink} 
              to={`/sites/${siteIdNum}`} 
              color="inherit"
            >
              {site.SiteName}
            </Link>
            <Typography color="textPrimary">New Charger</Typography>
          </Breadcrumbs>
          <Typography variant="h4">Create New Charger for {site.SiteName}</Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to={`/sites/${siteIdNum}`} 
          startIcon={<ArrowBackIcon />}
        >
          Back to Site
        </Button>
      </Box>

      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {mutation.error.message}
        </Alert>
      )}

      <ChargerForm 
        companyId={site.SiteCompanyID}
        siteId={siteIdNum}
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

export default ChargerCreatePage;