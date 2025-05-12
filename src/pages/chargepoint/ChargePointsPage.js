// src/pages/chargepoint/ChargePointsPage.js
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import { getChargePoints } from '../../api/websocketAPI';
import { getChargers } from '../../api/chargerAPI';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const ChargePointsPage = () => {
  // Fetch connected charge points
  const { 
    data: chargePointsData, 
    isLoading: isLoadingChargePoints, 
    error: chargePointsError,
    refetch: refetchChargePoints 
  } = useQuery({
    queryKey: ['charge-points'],
    queryFn: getChargePoints,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch all chargers from database
  const { 
    data: chargers, 
    isLoading: isLoadingChargers, 
    error: chargersError 
  } = useQuery({
    queryKey: ['all-chargers-for-cp'],
    queryFn: () => getChargers({})
  });

  const handleRefresh = () => {
    refetchChargePoints();
  };

  if (isLoadingChargePoints || isLoadingChargers) {
    return <LoadingSpinner />;
  }

  if (chargePointsError || chargersError) {
    return <ErrorAlert message={chargePointsError?.message || chargersError?.message || 'Error loading data'} />;
  }

  const connectedChargePoints = chargePointsData?.charge_points || [];
  
  // Create a map of charge point IDs to charger details
  const chargerMap = chargers?.reduce((map, charger) => {
    map[charger.ChargerName] = charger;
    return map;
  }, {}) || {};

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Connected Charge Points</Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <SignalWifi4BarIcon color="success" />
          <Typography variant="h6">
            Currently Connected: {chargePointsData?.count || 0}
          </Typography>
        </Box>

        {connectedChargePoints.length === 0 ? (
          <Typography color="text.secondary">
            No charge points are currently connected to the OCPP server.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Charge Point ID</TableCell>
                  <TableCell>Charger Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Site</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connectedChargePoints.map((chargePointId) => {
                  const charger = chargerMap[chargePointId];
                  return (
                    <TableRow key={chargePointId}>
                      <TableCell>{chargePointId}</TableCell>
                      <TableCell>
                        {charger ? charger.ChargerName : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {charger ? `Company ${charger.ChargerCompanyId}` : '-'}
                      </TableCell>
                      <TableCell>
                        {charger ? `Site ${charger.ChargerSiteId}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<SignalWifi4BarIcon />}
                          label="Connected"
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {charger && (
                          <IconButton
                            component={RouterLink}
                            to={`/chargers/${charger.ChargerId}?company=${charger.ChargerCompanyId}&site=${charger.ChargerSiteId}`}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Disconnected Chargers */}
      {chargers && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Disconnected Chargers
          </Typography>
          
          {chargers.filter(charger => !connectedChargePoints.includes(charger.ChargerName)).length === 0 ? (
            <Typography color="text.secondary">
              All registered chargers are currently connected.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Charger ID</TableCell>
                    <TableCell>Charger Name</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Site</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chargers
                    .filter(charger => !connectedChargePoints.includes(charger.ChargerName))
                    .map((charger) => (
                      <TableRow key={charger.ChargerId}>
                        <TableCell>{charger.ChargerId}</TableCell>
                        <TableCell>{charger.ChargerName}</TableCell>
                        <TableCell>Company {charger.ChargerCompanyId}</TableCell>
                        <TableCell>Site {charger.ChargerSiteId}</TableCell>
                        <TableCell>
                          <Chip
                            label="Disconnected"
                            color="default"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            component={RouterLink}
                            to={`/chargers/${charger.ChargerId}?company=${charger.ChargerCompanyId}&site=${charger.ChargerSiteId}`}
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
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ChargePointsPage;