// src/pages/site/SitesPage.js
import React, { useState, useEffect } from 'react';
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
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import { getSites, deleteSite, getCompanySites } from '../../api/siteAPI';
import { getCompanies } from '../../api/companyAPI';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const SitesPage = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filters, setFilters] = useState({
    companyId: '',
    enabled: '',
    search: ''
  });

  // Fetch all companies for the filter dropdown
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies()
  });

  // Set default company ID when companies are loaded
  useEffect(() => {
    if (companies && companies.length > 0 && !filters.companyId) {
      setFilters(prev => ({
        ...prev,
        companyId: companies[0].CompanyId.toString()
      }));
    }
  }, [companies]);

  // Fetch sites using company-specific endpoint
  const { data: sites, isLoading: isLoadingSites, isError: isSitesError, error: sitesError } = useQuery({
    queryKey: ['sites', filters],
    queryFn: () => {
      if (filters.companyId) {
        return getCompanySites(
          parseInt(filters.companyId),
          filters.enabled !== '' ? filters.enabled === 'true' : undefined
        );
      } else if (companies && companies.length > 0) {
        // No company selected but companies exist, use the first company
        return getCompanySites(
          companies[0].CompanyId,
          filters.enabled !== '' ? filters.enabled === 'true' : undefined
        );
      }
      return [];
    },
    enabled: !isLoadingCompanies && (!!filters.companyId || (companies && companies.length > 0))
  });

  // Delete site mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSite,
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      
      setSnackbar({
        open: true,
        message: 'Site deleted successfully',
        severity: 'success'
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error deleting site: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const handleDeleteClick = (siteId) => {
    setSiteToDelete(siteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (siteToDelete) {
      try {
        await deleteMutation.mutateAsync(siteToDelete);
      } catch (err) {
        // Error is handled by the mutation
      }
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter sites by search term
  const filteredSites = sites && sites.filter(site => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      site.SiteName?.toLowerCase().includes(searchTerm) ||
      site.SiteAddress?.toLowerCase().includes(searchTerm) ||
      site.SiteCity?.toLowerCase().includes(searchTerm) ||
      site.SiteRegion?.toLowerCase().includes(searchTerm) ||
      site.SiteCountry?.toLowerCase().includes(searchTerm)
    );
  });

  if (isLoadingSites || isLoadingCompanies) {
    return <LoadingSpinner />;
  }

  if (isSitesError) {
    return <ErrorAlert message={sitesError instanceof Error ? sitesError.message : 'Failed to load sites'} />;
  }

  // Find the current company name
  const currentCompany = companies?.find(company => company.CompanyId.toString() === filters.companyId);
  const currentCompanyName = currentCompany?.CompanyName || "Unknown Company";

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sites</Typography>
        <Button 
          component={Link} 
          to="/sites/new" 
          variant="contained" 
          startIcon={<AddIcon />}
        >
          Add Site
        </Button>
      </Box>

      {/* Filters - with equal-sized filter boxes */}
      <Box mb={4} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              name="search"
              label="Search Sites"
              variant="outlined"
              fullWidth
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ height: '100%' }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth sx={{ height: '100%' }}>
              <InputLabel id="company-filter-label">Company</InputLabel>
              <Select
                labelId="company-filter-label"
                name="companyId"
                value={filters.companyId}
                label="Company"
                onChange={handleFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <BusinessIcon />
                  </InputAdornment>
                }
              >
                {/* No "All Companies" option as requested */}
                {!isLoadingCompanies && companies && companies.map((company) => (
                  <MenuItem key={company.CompanyId} value={company.CompanyId.toString()}>
                    {company.CompanyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth sx={{ height: '100%' }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                name="enabled"
                value={filters.enabled}
                label="Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Company information display */}
      <Box mb={3}>
        <Typography variant="h6">
          Sites for: {currentCompanyName}
        </Typography>
      </Box>

      {filteredSites && filteredSites.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No sites found
          </Typography>
          <Button 
            component={Link} 
            to={`/companies/${filters.companyId}/sites/new`}
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add Your First Site
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredSites && filteredSites.map((site) => {
            // Find company name for this site
            const company = companies?.find(c => c.CompanyId === site.SiteCompanyID);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={site.SiteId}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        {site.SiteName}
                      </Typography>
                      <Chip 
                        label={site.SiteEnabled ? "Active" : "Inactive"} 
                        color={site.SiteEnabled ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                    
                    {company && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {company.CompanyName}
                        </Typography>
                      </Box>
                    )}
                    
                    {(site.SiteAddress || site.SiteCity || site.SiteRegion) && (
                      <Box display="flex" alignItems="flex-start" mb={1}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                        <Box>
                          {site.SiteAddress && (
                            <Typography variant="body2">
                              {site.SiteAddress}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            {[site.SiteCity, site.SiteRegion, site.SiteCountry]
                              .filter(Boolean)
                              .join(', ')}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <IconButton 
                        component={Link} 
                        to={`/sites/${site.SiteId}`}
                        aria-label="view"
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        component={Link} 
                        to={`/sites/${site.SiteId}/edit`}
                        aria-label="edit"
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        aria-label="delete"
                        color="error"
                        onClick={() => handleDeleteClick(site.SiteId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Site</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this site? This action cannot be undone.
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

export default SitesPage;