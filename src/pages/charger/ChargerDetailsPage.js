// src/pages/charger/ChargerDetailsPage.js
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
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
import ChargePointStatus from '../../components/charger/ChargePointStatus';
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <List dense disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <EvStationIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Charger ID" 
                    secondary={charger.ChargerId} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Status" 
                    secondary={
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
                    } 
                  />
                </ListItem>
                
                {charger.ChargerType && (
                  <ListItem>
                    <ListItemText 
                      primary="Type" 
                      secondary={charger.ChargerType} 
                    />
                  </ListItem>
                )}
                
                {charger.ChargerAccessType && (
                  <ListItem>
                    <ListItemText 
                      primary="Access Type" 
                      secondary={charger.ChargerAccessType} 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
            
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Hardware Details</Typography>
              <List dense disablePadding>
                {(charger.ChargerBrand || charger.ChargerModel) && (
                  <ListItem>
                    <ListItemText 
                      primary="Brand & Model" 
                      secondary={`${charger.ChargerBrand || ''} ${charger.ChargerModel || ''}`.trim()} 
                    />
                  </ListItem>
                )}
                
                {charger.ChargerSerial && (
                  <ListItem>
                    <ListItemIcon>
                      <MemoryIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Serial Number" 
                      secondary={charger.ChargerSerial} 
                    />
                  </ListItem>
                )}
                
                {charger.ChargerPincode && (
                  <ListItem>
                    <ListItemText 
                      primary="PIN Code" 
                      secondary={charger.ChargerPincode} 
                    />
                  </ListItem>
                )}
                
                {(charger.ChargerMeter || charger.ChargerMeterSerial) && (
                  <ListItem>
                    <ListItemIcon>
                      <DeviceHubIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Meter" 
                      secondary={
                        <>
                          {charger.ChargerMeter && (
                            <Typography variant="body2">Model: {charger.ChargerMeter}</Typography>
                          )}
                          {charger.ChargerMeterSerial && (
                            <Typography variant="body2">Serial: {charger.ChargerMeterSerial}</Typography>
                          )}
                        </>
                      } 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Connectivity</Typography>
              <List dense disablePadding>
                {charger.ChargerWsURL && (
                  <ListItem>
                    <ListItemIcon>
                      <HttpIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="WebSocket URL" 
                      secondary={charger.ChargerWsURL}
                    />
                  </ListItem>
                )}
                
                {charger.ChargerICCID && (
                  <ListItem>
                    <ListItemText 
                      primary="ICCID" 
                      secondary={charger.ChargerICCID} 
                    />
                  </ListItem>
                )}
                
                {(charger.ChargerLastConn || charger.ChargerLastHeartbeat) && (
                  <ListItem>
                    <ListItemText 
                      primary="Connection Status" 
                      secondary={
                        <>
                          {charger.ChargerLastConn && (
                            <Typography variant="body2">
                              Last Connection: {new Date(charger.ChargerLastConn).toLocaleString()}
                            </Typography>
                          )}
                          {charger.ChargerLastHeartbeat && (
                            <Typography variant="body2">
                              Last Heartbeat: {new Date(charger.ChargerLastHeartbeat).toLocaleString()}
                            </Typography>
                          )}
                        </>
                      } 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
            
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Availability</Typography>
              <List dense disablePadding>
                <ListItem>
                  <ListItemText 
                    primary="24/7 Operation" 
                    secondary={charger.ChargerActive24x7 ? "Yes" : "No"} 
                  />
                </ListItem>
                
                {charger.ChargerAvailability && (
                  <ListItem>
                    <ListItemText 
                      primary="Availability Schedule" 
                      secondary={charger.ChargerAvailability} 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
            
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Location Information</Typography>
              <List dense disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Company" 
                    secondary={company ? company.CompanyName : 'Unknown'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Site" 
                    secondary={site ? site.SiteName : 'Unknown'} 
                  />
                </ListItem>
                
                {charger.ChargerGeoCoord && (
                  <ListItem>
                    <ListItemText 
                      primary="Geo Coordinates" 
                      secondary={charger.ChargerGeoCoord} 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box display="flex" justifyContent="flex-end" gap={2}>
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
      </Paper>

      {/* WebSocket Connection Status */}
      <ChargePointStatus 
        chargePointId={charger.ChargerName} 
        chargerName={charger.ChargerName}
      />

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
            to={`/sessions?charger=${chargerId}&company=${companyId}&site=${siteId}`}
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