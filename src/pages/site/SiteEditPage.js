// src/pages/site/SiteEditPage.js
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
import { getSite, updateSite } from '../../api/siteAPI';
import SiteForm from '../../components/site/SiteForm';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

// First, update siteApi.js to add the updateSite function:
/*
export const updateSite = async (siteId, siteData) => {
  try {
    const response = await apiClient.put(`${SITES_URL}${siteId}`, siteData);
    return response.data;
  } catch (error) {
    console.error(`Error updating site ${siteId}:`, error);
    throw error;
  }
};
*/

const SiteEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const siteId = parseInt(id);

  // Fetch site details
  const { data: site, isLoading: isLoadingSite, isError, error } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => getSite(siteId),
    enabled: !!siteId && !isNaN(siteId)
  });

  // Fetch company details once we have the site
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', site?.SiteCompanyID],
    queryFn: () => getCompany(site.SiteCompanyID),
    enabled: !!site?.SiteCompanyID
  });

  // Update site mutation
  const mutation = useMutation({
    mutationFn: (data) => updateSite(siteId, data),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['site', siteId] });
      if (site?.SiteCompanyID) {
        queryClient.invalidateQueries({ queryKey: ['company-sites', site.SiteCompanyID] });
      }
      
      setSnackbar({
        open: true,
        message: 'Site updated successfully!',
        severity: 'success'
      });
      
      // Navigate back to site details after a brief delay
      setTimeout(() => {
        navigate(`/sites/${siteId}`);
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error updating site: ${error.message}`,
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

  if (isLoadingSite) {
    return <LoadingSpinner />;
  }

  if (isError || !site) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'Error loading site'} />;
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
            {!isLoadingCompany && company && (
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
              to={`/sites/${siteId}`} 
              color="inherit"
            >
              {site.SiteName}
            </Link>
            <Typography color="textPrimary">Edit</Typography>
          </Breadcrumbs>
          <Typography variant="h4">Edit {site.SiteName}</Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to={`/sites/${siteId}`} 
          startIcon={<ArrowBackIcon />}
        >
          Back to Site Details
        </Button>
      </Box>

      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {mutation.error.message}
        </Alert>
      )}

      <SiteForm 
        site={site}
        companyId={site.SiteCompanyID}
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

export default SiteEditPage;