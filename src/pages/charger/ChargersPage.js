// src/pages/charger/ChargersPage.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
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
  InputAdornment,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EvStationIcon from '@mui/icons-material/EvStation';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import { getChargers, deleteCharger } from '../../api/chargerAPI';
import { getCompanies } from '../../api/companyAPI';
import { getSites } from '../../api/siteAPI';
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

  // Fetch sites based on selected company
  const { data: sites, isLoading: isLoadingSites } = useQuery({
    queryKey: ['sites', filters.companyId],
    queryFn: () => getSites(
      filters.companyId ? parseInt(filters.companyId) : undefined
    ),
    enabled: filters.companyId !== ''
  });

  // Fetch all chargers with filters
  const { data: chargers, isLoading, isError, error } = useQuery({
    queryKey: ['chargers', filters],
    queryFn: () => getChargers({
      company_id: filters.companyId ? parseInt(filters.companyId) : undefined,
      site_id: filters.siteId ? parseInt(filters.siteId) : undefined,
      enabled: filters.enabled !== '' ? filters.enabled === 'true' : undefined,
      online: filters.online !== '' ? filters.online === 'true' : undefined
    })
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

  // Find company and site names for each charger
  const getCompanyName = (companyId) => {
    if (!companies) return 'Unknown';
    const company = companies.find(c => c.CompanyId === companyId);
    return company ? company.CompanyName : 'Unknown';
  };

  const getSiteName = (siteId, companyId) => {
    if (!sites || parseInt(filters.companyId) !== companyId) return 'Unknown';
    const site = sites.find(s => s.SiteId === siteId);
    return site ? site.SiteName : 'Unknown';
  };

  if (isLoading) {
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
          <Grid item xs={12} md={3}>
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
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="company-filter-label">Filter by Company</InputLabel>
              <Select
                labelId="company-filter-label"
                name="companyId"
                value={filters.companyId}
                label="Filter by Company"
                onChange={handleFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <BusinessIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Companies</MenuItem>
                {!isLoadingCompanies && companies && companies.map((company) => (
                  <MenuItem key={company.CompanyId} value={company.CompanyId.toString()}>
                    {company.CompanyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel id="site-filter-label">Filter by Site</InputLabel>
              <Select
                labelId="site-filter-label"
                name="siteId"
                value={filters.siteId}
                label="Filter by Site"
                onChange={handleFilterChange}
                disabled={!filters.companyId}
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Sites</MenuItem>
                {!isLoadingSites && sites && sites.map((site) => (
                  <MenuItem key={site.SiteId} value={site.SiteId.toString()}>
                    {site.SiteName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
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
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
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

      {filteredChargers && filteredChargers.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No chargers found
          </Typography>
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
                        {getCompanyName(charger.ChargerCompanyId)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {getSiteName(charger.ChargerSiteId, charger.ChargerCompanyId)}
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