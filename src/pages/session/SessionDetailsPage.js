// Modified SessionDetailsPage.js with metadata section moved above the energy graph
import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BadgeIcon from '@mui/icons-material/Badge';
import EvStationIcon from '@mui/icons-material/EvStation';
import PowerIcon from '@mui/icons-material/Power';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelineIcon from '@mui/icons-material/Timeline';
import { format } from 'date-fns';
import { getSession, getSessionStats, getSessionMeterValues } from '../../api/sessionAPI';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const formatDuration = (seconds) => {
  if (!seconds) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
  } catch {
    return dateString;
  }
};

const SessionDetailsPage = () => {
  const { id } = useParams();
  const sessionId = parseInt(id);

  // Fetch session details
  const { data: session, isLoading, isError, error } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId && !isNaN(sessionId)
  });

  // Fetch session statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['session-stats', sessionId],
    queryFn: () => getSessionStats(sessionId),
    enabled: !!sessionId && !isNaN(sessionId)
  });

  // Fetch meter values for chart
  const { data: meterValues, isLoading: isLoadingMeter } = useQuery({
    queryKey: ['session-meter', sessionId],
    queryFn: () => getSessionMeterValues(sessionId),
    enabled: !!sessionId && !isNaN(sessionId)
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !session) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'Error loading session'} />;
  }

  // Prepare chart data
  const chartData = meterValues?.map(reading => ({
    time: format(new Date(reading.EventsDataDateTime), 'HH:mm:ss'),
    energy: reading.EventsDataMeterValue ? reading.EventsDataMeterValue / 1000 : 0, // Convert Wh to kWh
    current: reading.EventsDataCurrent || 0,
    voltage: reading.EventsDataVoltage || 0
  })) || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Breadcrumbs aria-label="breadcrumb" mb={1}>
            <Link component={RouterLink} to="/" color="inherit">
              Dashboard
            </Link>
            <Link component={RouterLink} to="/sessions" color="inherit">
              Sessions
            </Link>
            <Typography color="textPrimary">Session #{sessionId}</Typography>
          </Breadcrumbs>
          <Typography variant="h4">Charging Session #{sessionId}</Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to="/sessions" 
          startIcon={<ArrowBackIcon />}
        >
          Back to Sessions
        </Button>
      </Box>

      {/* Basic Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Session Information</Typography>
              <List dense disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <EvStationIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Charger" 
                    secondary={`ID: ${session.ChargerSessionChargerId} | Connector: ${session.ChargerSessionConnectorId}`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <BadgeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Driver Info" 
                    secondary={session.ChargerSessionDriverId ? 
                      `Driver ID: ${session.ChargerSessionDriverId} | RFID: ${session.ChargerSessionRFIDCard || 'N/A'}` : 
                      'No driver information'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Status" 
                    secondary={
                      <Chip 
                        label={session.ChargerSessionStatus || 'Unknown'} 
                        color={session.ChargerSessionStatus === 'Completed' ? 'success' : 'primary'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    } 
                  />
                </ListItem>
                
                {session.ChargerSessionReason && (
                  <ListItem>
                    <ListItemText 
                      primary="Stop Reason" 
                      secondary={session.ChargerSessionReason} 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
            
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Time Information</Typography>
              <List dense disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Start Time" 
                    secondary={formatDateTime(session.ChargerSessionStart)} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="End Time" 
                    secondary={session.ChargerSessionEnd ? formatDateTime(session.ChargerSessionEnd) : 'Ongoing'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Duration" 
                    secondary={stats?.duration_formatted || formatDuration(session.ChargerSessionDuration)} 
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Energy & Power</Typography>
              <List dense disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <BoltIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Total Energy" 
                    secondary={`${stats?.energy_kwh?.toFixed(2) || session.ChargerSessionEnergyKWH?.toFixed(2) || '0'} kWh`} 
                  />
                </ListItem>
                
                {stats?.max_power_kw > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <PowerIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Maximum Power" 
                      secondary={`${stats.max_power_kw.toFixed(2)} kW`} 
                    />
                  </ListItem>
                )}
                
                {stats?.avg_power_kw > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <PowerIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Average Power" 
                      secondary={`${stats.avg_power_kw.toFixed(2)} kW`} 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
            
            {(session.ChargerSessionCost || session.ChargerSessionPaymentAmount) && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Cost Information</Typography>
                <List dense disablePadding>
                  {session.ChargerSessionCost && (
                    <ListItem>
                      <ListItemIcon>
                        <AttachMoneyIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Session Cost" 
                        secondary={`$${session.ChargerSessionCost.toFixed(2)}`} 
                      />
                    </ListItem>
                  )}
                  
                  {session.ChargerSessionPaymentAmount && (
                    <ListItem>
                      <ListItemIcon>
                        <AttachMoneyIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Payment Amount" 
                        secondary={`$${session.ChargerSessionPaymentAmount.toFixed(2)}`} 
                      />
                    </ListItem>
                  )}
                  
                  {session.ChargerSessionPaymentStatus && (
                    <ListItem>
                      <ListItemText 
                        primary="Payment Status" 
                        secondary={session.ChargerSessionPaymentStatus} 
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Metadata section - MOVED HERE */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Session Metadata</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Session ID</Typography>
            <Typography variant="body1">{session.ChargeSessionId}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Company ID</Typography>
            <Typography variant="body1">{session.ChargerSessionCompanyId}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Site ID</Typography>
            <Typography variant="body1">{session.ChargerSessionSiteId}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Created At</Typography>
            <Typography variant="body1">{formatDateTime(session.ChargerSessionCreated)}</Typography>
          </Grid>
          {session.ChargerSessionPricingPlanId && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Pricing Plan ID</Typography>
              <Typography variant="body1">{session.ChargerSessionPricingPlanId}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Energy Chart (only if there's data) */}
      {chartData.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <TimelineIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Session Energy Timeline</Typography>
          </Box>
          
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#16a34a" 
                  name="Energy (kWh)" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SessionDetailsPage;