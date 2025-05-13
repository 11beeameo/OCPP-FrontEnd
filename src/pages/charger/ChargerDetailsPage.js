// src/pages/charger/ChargerDetailsPage.js with WebSocket Connection Status section removed
import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Chip,
  Breadcrumbs,
  Link,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EvStationIcon from '@mui/icons-material/EvStation';
import BusinessIcon from '@mui/icons-material/Business';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import MemoryIcon from '@mui/icons-material/Memory';
import HttpIcon from '@mui/icons-material/Http';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { getCharger, deleteCharger } from '../../api/chargerAPI';
import { getCompany } from '../../api/companyAPI';
import { getSite } from '../../api/siteAPI';
import { getChargerSessions } from '../../api/sessionAPI';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SessionList from '../../components/session/SessionList';
import ChargePointControl from '../../components/charger/ChargePointControl';

const ChargerDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const chargerId = parseInt(id);
  const companyId = parseInt(searchParams.get('company') || '0');
  const siteId = parseInt(searchParams.get('site') || '0');

  // Fetch charger details
  const { data: charger, isLoading, isError, error } = useQuery({
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

  // Fetch charger sessions
  const { 
    data: sessions, 
    isLoading: isLoadingSessions, 
    isError: isSessionsError, 
    error: sessionsError 
  } = useQuery({
    queryKey: ['charger-sessions', chargerId, companyId, siteId],
    queryFn: () => getChargerSessions(chargerId, companyId, siteId),
    enabled: !!chargerId && !!companyId && !!siteId && !isNaN(chargerId) && !isNaN(companyId) && !isNaN(siteId)
  });

  // Delete charger mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteCharger(chargerId, companyId, siteId),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['site-chargers', siteId, companyId] });
      
      setSnackbar({
        open: true,
        message: 'Charger deleted successfully',
        severity: 'success'
      });
      
      // Navigate to site details after deletion
      setTimeout(() => {
        navigate(`/sites/${siteId}`);
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error deleting charger: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync();
    } catch (err) {
      // Error is handled by the mutation
    }
    setDeleteDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading || isLoadingCompany || isLoadingSite) {
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
            <Typography color="textPrimary">{charger.ChargerName}</Typography>
          </Breadcrumbs>
          <Typography variant="h4">{charger.ChargerName}</Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to={`/sites/${siteId}`} 
          startIcon={<ArrowBackIcon />}
        >
          Back to Site
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={RouterLink}
            to={`/chargers/${charger.ChargerId}/edit?company=${companyId}&site=${siteId}`}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Single Row with all primary charger information */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={1.5}>
            <Typography variant="subtitle2" color="text.secondary">Charger ID</Typography>
            <Typography variant="body1">{charger.ChargerId}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={1.5}>
            <Typography variant="subtitle2" color="text.secondary">Company</Typography>
            <Typography variant="body1">{company ? company.CompanyName : 'Unknown'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={1.5}>
            <Typography variant="subtitle2" color="text.secondary">Site</Typography>
            <Typography variant="body1">{site ? site.SiteName : 'Unknown'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={1.5}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
            <Box>
              <Chip 
                label={charger.ChargerEnabled ? "Enabled" : "Disabled"} 
                color={charger.ChargerEnabled ? "success" : "default"}
                size="small"
                sx={{ mr: 1, mt: 0.5 }}
              />
              <Chip 
                label={charger.ChargerIsOnline ? "Online" : "Offline"} 
                color={charger.ChargerIsOnline ? "success" : "default"}
                size="small"
                sx={{ mt: 0.5 }}
                icon={charger.ChargerIsOnline ? <SignalWifi4BarIcon /> : <SignalWifiOffIcon />}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Model</Typography>
            <Typography variant="body1">
              {charger.ChargerBrand ? `${charger.ChargerBrand} ${charger.ChargerModel || ''}` : (charger.ChargerModel || '-')}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Serial Number</Typography>
            <Typography variant="body1">{charger.ChargerSerial || '-'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Meter</Typography>
            <Typography variant="body1">
              {charger.ChargerMeter ? 
                `${charger.ChargerMeter}${charger.ChargerMeterSerial ? ` (${charger.ChargerMeterSerial})` : ''}` : 
                '-'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Last Connection</Typography>
            <Typography variant="body1">
              {charger.ChargerLastConn ? new Date(charger.ChargerLastConn).toLocaleString() : '-'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Last Heartbeat</Typography>
            <Typography variant="body1">
              {charger.ChargerLastHeartbeat ? new Date(charger.ChargerLastHeartbeat).toLocaleString() : '-'}
            </Typography>
          </Grid>
        </Grid>
        
        {/* Additional characteristics in separate rows */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <EvStationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Additional Characteristics
          </Typography>
          
          <Grid container spacing={2}>
            {charger.ChargerType && (
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Typography variant="body1">{charger.ChargerType}</Typography>
              </Grid>
            )}
            
            {charger.ChargerAccessType && (
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Access Type</Typography>
                <Typography variant="body1">{charger.ChargerAccessType}</Typography>
              </Grid>
            )}
            
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">24/7 Operation</Typography>
              <Typography variant="body1">{charger.ChargerActive24x7 ? "Yes" : "No"}</Typography>
            </Grid>
            
            {charger.ChargerAvailability && (
              <Grid item xs={12} sm={12}>
                <Typography variant="body2" color="text.secondary">Availability Schedule</Typography>
                <Typography variant="body1">{charger.ChargerAvailability}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
        
        {/* Connectivity Section */}
        {(charger.ChargerWsURL || charger.ChargerICCID || charger.ChargerFirmwareVersion) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <HttpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              Connectivity
            </Typography>
            
            <Grid container spacing={2}>
              {charger.ChargerWsURL && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">WebSocket URL</Typography>
                  <Typography variant="body1">{charger.ChargerWsURL}</Typography>
                </Grid>
              )}
              
              {charger.ChargerICCID && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">ICCID</Typography>
                  <Typography variant="body1">{charger.ChargerICCID}</Typography>
                </Grid>
              )}
              
              {charger.ChargerFirmwareVersion && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">Firmware Version</Typography>
                  <Typography variant="body1">{charger.ChargerFirmwareVersion}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
        
        {/* Location Section */}
        {charger.ChargerGeoCoord && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <LocationOnIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              Location
            </Typography>
            
            <Typography variant="body1">
              Geo Coordinates: {charger.ChargerGeoCoord}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* WebSocket Connection Status section has been removed */}

      {/* Charge Point Control */}
      <ChargePointControl 
        chargePointId={charger.ChargerName}
        isOnline={charger.ChargerIsOnline}
        sessions={sessions}
      />

      {/* Charging Sessions Section */}
      <Box mt={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Charging Sessions</Typography>
          <Button 
            component={RouterLink} 
            to={`/chargers/${chargerId}/sessions?company=${companyId}&site=${siteId}`}
            variant="outlined"
          >
            View All Sessions
          </Button>
        </Box>
        
        <SessionList 
          sessions={sessions}
          isLoading={isLoadingSessions}
          isError={isSessionsError}
          error={sessionsError}
          showCharger={false}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Charger</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{charger.ChargerName}"? This action cannot be undone.
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

export default ChargerDetailsPage;