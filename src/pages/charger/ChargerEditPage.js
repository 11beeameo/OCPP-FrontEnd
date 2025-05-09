// src/pages/charger/ChargerEditPage.js
import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
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
import { getCharger, updateCharger } from '../../api/chargerAPI';
import ChargerForm from '../../components/charger/ChargerForm';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

// First, update chargerApi.js to add the updateCharger function:
/*
export const updateCharger = async (chargerId, companyId, siteId, chargerData) => {
  try {
    const response = await apiClient.put(`${CHARGERS_URL}${chargerId}`, chargerData, {
      params: { company_id: companyId, site_id: siteId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating charger ${chargerId}:`, error);
    throw error;
  }
};
*/

const ChargerEditPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const chargerId = parseInt(id);
  const companyId = parseInt(searchParams.get('company') || '0');
  const siteId = parseInt(searchParams.get('site') || '0');

  // Fetch charger details
  const { data: charger, isLoading: isLoadingCharger, isError, error } = useQuery({
    queryKey: ['charger', chargerId, companyId, siteId],
    queryFn: () => getCharger(chargerId, companyId, siteId),
    enabled: !!chargerId && !!companyId && !!siteId && !isNaN(chargerId) && !isNaN(companyId) && !isNaN(siteId)
  });

  // Fetch company details
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => getCompany(companyId),
    enabled: !!companyId && !isNaN(companyId)
  });

  // Fetch site details
  const { data: site, isLoading: isLoadingSite } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => getSite(siteId),
    enabled: !!siteId && !isNaN(siteId)
  });

  // Update charger mutation
  const mutation = useMutation({
    mutationFn: (data) => updateCharger(chargerId, companyId, siteId, data),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['charger', chargerId, companyId, siteId] });
      queryClient.invalidateQueries({ queryKey: ['site-chargers', siteId, companyId] });
      
      setSnackbar({
        open: true,
        message: 'Charger updated successfully!',
        severity: 'success'
      });
      
      // Navigate back to charger details after a brief delay
      setTimeout(() => {
        navigate(`/chargers/${chargerId}?company=${companyId}&site=${siteId}`);
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error updating charger: ${error.message}`,
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

  if (isLoadingCharger || isLoadingCompany || isLoadingSite) {
    return <LoadingSpinner />;
  }

  if (isError || !charger) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'Error loading charger'} />;
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
                to={`/companies/${companyId}`} 
                color="inherit"
              >
                {company.CompanyName}
              </Link>
            )}
            {site && (
              <Link 
                component={RouterLink} 
                to={`/sites/${siteId}`} 
                color="inherit"
              >
                {site.SiteName}
              </Link>
            )}
            <Link 
              component={RouterLink} 
              to={`/chargers/${chargerId}?company=${companyId}&site=${siteId}`} 
              color="inherit"
            >
              {charger.ChargerName}
            </Link>
            <Typography color="textPrimary">Edit</Typography>
          </Breadcrumbs>
          <Typography variant="h4">Edit {charger.ChargerName}</Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to={`/chargers/${chargerId}?company=${companyId}&site=${siteId}`} 
          startIcon={<ArrowBackIcon />}
        >
          Back to Charger Details
        </Button>
      </Box>

      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {mutation.error.message}
        </Alert>
      )}

      <ChargerForm 
        charger={charger}
        companyId={companyId}
        siteId={siteId}
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

export default ChargerEditPage;