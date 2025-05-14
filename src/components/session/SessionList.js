// src/components/session/SessionList.js - updated for consistent card sizing
import React from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format } from 'date-fns';
import LoadingSpinner from '../common/Loadingspinner';
import ErrorAlert from '../common/ErrorAlert';

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

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'started':
      return 'primary';
    case 'failed':
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

const SessionList = ({ 
  sessions, 
  isLoading, 
  isError, 
  error,
  showCharger = true,
  showDriver = true 
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'Error loading sessions'} />;
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No charging sessions found
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ padding: 0 }}>
        <TableContainer component={Paper} sx={{ maxHeight: 650, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="120px">Session ID</TableCell>
                {showCharger && <TableCell width="120px">Charger</TableCell>}
                <TableCell width="100px">Connector</TableCell>
                {showDriver && <TableCell width="180px">Driver</TableCell>}
                <TableCell width="180px">Start Time</TableCell>
                <TableCell width="180px">End Time</TableCell>
                <TableCell width="120px">Duration</TableCell>
                <TableCell width="120px">Energy</TableCell>
                <TableCell width="100px">Status</TableCell>
                <TableCell width="80px" align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.ChargeSessionId}>
                  <TableCell>#{session.ChargeSessionId}</TableCell>
                  
                  {showCharger && (
                    <TableCell>{session.ChargerSessionChargerId}</TableCell>
                  )}
                  
                  <TableCell>
                    <Chip 
                      label={`#${session.ChargerSessionConnectorId}`} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  
                  {showDriver && (
                    <TableCell>
                      {session.ChargerSessionDriverId ? (
                        <Box>
                          <Typography variant="body2" noWrap>
                            Driver ID: {session.ChargerSessionDriverId}
                          </Typography>
                          {session.ChargerSessionRFIDCard && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              RFID: {session.ChargerSessionRFIDCard}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )}
                  
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {formatDateTime(session.ChargerSessionStart)}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    {session.ChargerSessionEnd ? formatDateTime(session.ChargerSessionEnd) : '-'}
                  </TableCell>
                  
                  <TableCell>
                    {formatDuration(session.ChargerSessionDuration)}
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <BoltIcon fontSize="small" sx={{ mr: 0.5, color: 'warning.main' }} />
                      {session.ChargerSessionEnergyKWH ? 
                        `${session.ChargerSessionEnergyKWH.toFixed(2)} kWh` : 
                        '-'
                      }
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={session.ChargerSessionStatus || 'Unknown'} 
                      color={getStatusColor(session.ChargerSessionStatus)}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <IconButton 
                      component={Link} 
                      to={`/sessions/${session.ChargeSessionId}`}
                      aria-label="view session details"
                      color="primary"
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default SessionList;