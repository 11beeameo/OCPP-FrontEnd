// src/pages/charger/ChargersPage.js
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
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import EvStationIcon from '@mui/icons-material/EvStation';
import { getChargers, deleteCharger, getSiteChargers } from '../../api/chargerAPI';
import { getCompanies } from '../../api/companyAPI';
import { getSites, getCompanySites } from '../../api/siteAPI';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const ChargersPage = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chargerToDelete, setChargerToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filters, setFilters] = useState({
    companyId: '',
    siteId: '',
    enabled: '',
    online: '',
    search: ''
  });

  // Fetch all companies for filter dropdown
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

  // Fetch sites based on selected company
  const { data: sites, isLoading: isLoadingSites } = useQuery({
    queryKey: ['sites', filters.companyId],
    queryFn: () => {
      if (filters.companyId) {
        return getCompanySites(parseInt(filters.companyId));
      }
      return [];
    },
    enabled: !!filters.companyId && !isLoadingCompanies
  });

  // Set default site ID when sites are loaded
  useEffect(() => {
    if (sites && sites.length > 0 && !filters.siteId && filters.companyId) {
      setFilters(prev => ({
        ...prev,
        siteId: sites[0].SiteId.toString()
      }));
    }
  }, [sites, filters.companyId]);

  // Fetch chargers using site-specific endpoint
  const { data: chargers, isLoading, isError, error } = useQuery({
    queryKey: ['chargers', filters],
    queryFn: () => {
      if (filters.companyId && filters.siteId) {
        return getSiteChargers(
          parseInt(filters.siteId),
          parseInt(filters.companyId),
          filters.enabled !== '' ? filters.enabled === 'true' : undefined
        );
      } else if (companies && companies.length > 0 && sites && sites.length > 0) {
        // Use default values if not selected
        const defaultCompanyId = parseInt(filters.companyId || companies[0].CompanyId);
        const defaultSiteId = parseInt(filters.siteId || sites[0].SiteId);
        return getSiteChargers(
          defaultSiteId,
          defaultCompanyId,
          filters.enabled !== '' ? filters.enabled === 'true' : undefined
        );
      }
      return [];
    },
    enabled: !isLoadingCompanies && !isLoadingSites && 
             ((!!filters.companyId && !!filters.siteId) || 
             (companies?.length > 0 && sites?.length > 0))
  });

  // Delete charger mutation
  const deleteMutation = useMutation({
    mutationFn: ({ chargerId, companyId, siteId }) => 
      deleteCharger(chargerId, companyId, siteId),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['chargers'] });
      
      setSnackbar({
        open: true,
        message: 'Charger deleted successfully',
        severity: 'success'
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error deleting charger: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const handleDeleteClick = (charger) => {
    setChargerToDelete({
      id: charger.ChargerId,
      name: charger.ChargerName,
      companyId: charger.ChargerCompanyId,
      siteId: charger.ChargerSiteId
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (chargerToDelete) {
      try {
        await deleteMutation.mutateAsync({
          chargerId: chargerToDelete.id,
          companyId: chargerToDelete.companyId,
          siteId: chargerToDelete.siteId
        });
      } catch (err) {
        // Error is handled by the mutation
      }
      setDeleteDialogOpen(false);
      setChargerToDelete(null);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => {
      // If company changes, reset site
      if (name === 'companyId' && value !== prev.companyId) {
        return {
          ...prev,
          [name]: value,
          siteId: ''
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter chargers by search term
  const filteredChargers = chargers && chargers.filter(charger => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      charger.ChargerName?.toLowerCase().includes(searchTerm) ||
      charger.ChargerBrand?.toLowerCase().includes(searchTerm) ||
      charger.ChargerModel?.toLowerCase().includes(searchTerm) ||
      charger.ChargerType?.toLowerCase().includes(searchTerm) ||
      charger.ChargerSerial?.toLowerCase().includes(searchTerm)
    );
  });

  // Find the current company and site names
  const currentCompany = companies?.find(company => company.CompanyId.toString() === filters.companyId);
  const currentSite = sites?.find(site => site.SiteId.toString() === filters.siteId);
  
  const currentCompanyName = currentCompany?.CompanyName || "Unknown Company";
  const currentSiteName = currentSite?.SiteName || "Unknown Site";

  if (isLoading || isLoadingCompanies || isLoadingSites) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'Failed to load chargers'} />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Chargers</Typography>
      </Box>

      {/* Filters */}
      <Box mb={4} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              name="search"
              label="Search Chargers"
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
              <InputLabel id="site-filter-label">Site</InputLabel>
              <Select
                labelId="site-filter-label"
                name="siteId"
                value={filters.siteId}
                label="Site"
                onChange={handleFilterChange}
                disabled={!filters.companyId || isLoadingSites || !sites?.length}
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                }
              >
                {!isLoadingSites && sites && sites.map((site) => (
                  <MenuItem key={site.SiteId} value={site.SiteId.toString()}>
                    {site.SiteName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
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
                <MenuItem value="true">Enabled</MenuItem>
                <MenuItem value="false">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ height: '100%' }}>
              <InputLabel id="online-filter-label">Connection</InputLabel>
              <Select
                labelId="online-filter-label"
                name="online"
                value={filters.online}
                label="Connection"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Online</MenuItem>
                <MenuItem value="false">Offline</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Company and Site information display */}
      <Box mb={3}>
        <Typography variant="h6">
          Chargers for: {currentCompanyName} / {currentSiteName}
        </Typography>
      </Box>

      {filteredChargers && filteredChargers.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No chargers found
          </Typography>
          {filters.companyId && filters.siteId && (
            <Button 
              component={Link} 
              to={`/sites/${filters.siteId}/chargers/new?company=${filters.companyId}`}
              variant="contained" 
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Add Your First Charger
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredChargers && filteredChargers.map((charger) => (
            <Grid item xs={12} md={6} lg={4} key={`${charger.ChargerId}-${charger.ChargerCompanyId}-${charger.ChargerSiteId}`}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <EvStationIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {charger.ChargerName}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip 
                        label={charger.ChargerEnabled ? "Enabled" : "Disabled"} 
                        color={charger.ChargerEnabled ? "success" : "default"}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        icon={charger.ChargerIsOnline ? <SignalWifi4BarIcon /> : <SignalWifiOffIcon />}
                        label={charger.ChargerIsOnline ? "Online" : "Offline"} 
                        color={charger.ChargerIsOnline ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Box mb={2}>
                    {charger.ChargerType && (
                      <Typography variant="body2" color="text.secondary">
                        Type: {charger.ChargerType}
                      </Typography>
                    )}
                    
                    {(charger.ChargerBrand || charger.ChargerModel) && (
                      <Typography variant="body2" color="text.secondary">
                        {[charger.ChargerBrand, charger.ChargerModel].filter(Boolean).join(' ')}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={0.5}>
                      <BusinessIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {currentCompanyName}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {currentSiteName}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <IconButton 
                      component={Link} 
                      to={`/chargers/${charger.ChargerId}?company=${charger.ChargerCompanyId}&site=${charger.ChargerSiteId}`}
                      aria-label="view"
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      component={Link} 
                      to={`/chargers/${charger.ChargerId}/edit?company=${charger.ChargerCompanyId}&site=${charger.ChargerSiteId}`}
                      aria-label="edit"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete"
                      color="error"
                      onClick={() => handleDeleteClick(charger)}
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
        <DialogTitle>Delete Charger</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{chargerToDelete?.name}"? This action cannot be undone.
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

export default ChargersPage;