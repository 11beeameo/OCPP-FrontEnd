// src/pages/site/SiteStandaloneCreatePage.js
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Alert,
  Breadcrumbs,
  Link,
  Button,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCompanies } from '../../api/companyAPI';
import { createSite } from '../../api/siteAPI';
import SiteForm from '../../components/site/SiteForm';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const SiteStandaloneCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch companies for the dropdown
  const { data: companies, isLoading: isLoadingCompanies, isError: isCompaniesError, error: companiesError } = useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies()
  });

  // Create site mutation
  const mutation = useMutation({
    mutationFn: createSite,
    onSuccess: (data) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['company-sites', data.SiteCompanyID] });
      
      setSnackbar({
        open: true,
        message: 'Site created successfully!',
        severity: 'success'
      });
      
      // Navigate to site details page after creation
      setTimeout(() => {
        navigate(`/sites/${data.SiteId}`);
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

  const handleCompanyChange = (event) => {
    setSelectedCompanyId(event.target.value);
  };

  const handleSubmit = async (data) => {
    if (!selectedCompanyId) {
      setSnackbar({
        open: true,
        message: 'Please select a company',
        severity: 'error'
      });
      return;
    }
    
    try {
      const siteData = {
        ...data,
        SiteCompanyID: parseInt(selectedCompanyId)
      };
      await mutation.mutateAsync(siteData);
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoadingCompanies) {
    return <LoadingSpinner />;
  }

  if (isCompaniesError) {
    return <ErrorAlert message={companiesError instanceof Error ? companiesError.message : 'Error loading companies'} />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Breadcrumbs aria-label="breadcrumb" mb={1}>
            <Link component={RouterLink} to="/" color="inherit">
              Dashboard
            </Link>
            <Link component={RouterLink} to="/sites" color="inherit">
              Sites
            </Link>
            <Typography color="textPrimary">Create</Typography>
          </Breadcrumbs>
          <Typography variant="h4">Create New Site</Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to="/sites" 
          startIcon={<ArrowBackIcon />}
        >
          Back to Sites
        </Button>
      </Box>

      {/* Company Selection */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Select Company</Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="company-select-label">Company</InputLabel>
          <Select
            labelId="company-select-label"
            value={selectedCompanyId}
            label="Company"
            onChange={handleCompanyChange}
            error={mutation.isError && !selectedCompanyId}
          >
            <MenuItem value="" disabled>
              <em>Select a company</em>
            </MenuItem>
            {companies && companies.map((company) => (
              <MenuItem key={company.CompanyId} value={company.CompanyId}>
                {company.CompanyName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Show site form only if a company is selected */}
      {selectedCompanyId && (
        <>
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {mutation.error.message}
            </Alert>
          )}
          
          <SiteForm 
            companyId={parseInt(selectedCompanyId)}
            onSubmit={handleSubmit} 
            isLoading={mutation.isPending}
          />
        </>
      )}

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

export default SiteStandaloneCreatePage;