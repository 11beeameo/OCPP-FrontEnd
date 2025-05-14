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
  InputAdornment,
  Paper,
  styled,
  Stack,
  Tooltip
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

// Create a styled Card to ensure consistent sizes
const ChargerCard = styled(Card)(({ theme }) => ({
  height: 280,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

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

  // Common MenuProps for all dropdowns to ensure consistent size
  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 300,
        width: 300,
      },
    },
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Chargers</Typography>
      </Box>

      {/* Filters */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
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
              size="medium"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
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
                MenuProps={menuProps}
              >
                {!isLoadingCompanies && companies && companies.map((company) => (
                  <MenuItem key={company.CompanyId} value={company.CompanyId.toString()}>
                    {company.CompanyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
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
                MenuProps={menuProps}
              >
                {!isLoadingSites && sites && sites.map((site) => (
                  <MenuItem key={site.SiteId} value={site.SiteId.toString()}>
                    {site.SiteName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                name="enabled"
                value={filters.enabled}
                label="Status"
                onChange={handleFilterChange}
                MenuProps={menuProps}
                sx={{
                  minWidth: 200,
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="true">Enabled</MenuItem>
                <MenuItem value="false">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

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
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {filteredChargers && filteredChargers.map((charger) => (
            <Box key={`${charger.ChargerId}-${charger.ChargerCompanyId}-${charger.ChargerSiteId}`} sx={{ 
              width: '33.33%', 
              padding: 1.5,
              boxSizing: 'border-box',
              '@media (max-width: 960px)': {
                width: '50%',
              },
              '@media (max-width: 600px)': {
                width: '100%',
              },
            }}>
              <ChargerCard>
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 3,
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" noWrap>
                      {charger.ChargerName}
                    </Typography>
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
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {currentCompanyName}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {currentSiteName}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* This spacer pushes the action buttons to the bottom */}
                  <Box sx={{ flexGrow: 1 }} />
                  
                  {/* Updated action buttons with text labels */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Charger Details">
                        <Button
                          component={Link}
                          to={`/chargers/${charger.ChargerId}?company=${charger.ChargerCompanyId}&site=${charger.ChargerSiteId}`}
                          variant="outlined"
                          color="primary"
                          startIcon={<VisibilityIcon />}
                          size="small"
                        >
                          View
                        </Button>
                      </Tooltip>
                      
                      <Tooltip title="Edit Charger">
                        <Button
                          component={Link}
                          to={`/chargers/${charger.ChargerId}/edit?company=${charger.ChargerCompanyId}&site=${charger.ChargerSiteId}`}
                          variant="outlined"
                          color="info"
                          startIcon={<EditIcon />}
                          size="small"
                        >
                          Edit
                        </Button>
                      </Tooltip>
                      
                      <Tooltip title="Delete Charger">
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(charger)}
                          size="small"
                        >
                          Delete
                        </Button>
                      </Tooltip>
                    </Stack>
                  </Box>
                </CardContent>
              </ChargerCard>
            </Box>
          ))}
        </Box>
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