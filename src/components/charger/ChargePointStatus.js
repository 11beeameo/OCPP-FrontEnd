// Updated ChargePointStatus component with removed connection status entry
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import { getChargePoints } from '../../api/websocketAPI';

const ChargePointStatus = ({ chargePointId, chargerName }) => {
  // Fetch connected charge points
  const { data: chargePoints, isLoading, error } = useQuery({
    queryKey: ['charge-points'],
    queryFn: getChargePoints,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return null;
  }

  // Check if this charge point is connected
  const isConnected = chargePoints?.charge_points?.includes(chargePointId.toString());

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={1}>
        {isConnected ? (
          <SignalWifi4BarIcon sx={{ mr: 1, color: 'success.main' }} />
        ) : (
          <SignalWifiOffIcon sx={{ mr: 1, color: 'error.main' }} />
        )}
        <Typography variant="h6">WebSocket Connection Status</Typography>
      </Box>
      
      <Box display="flex" alignItems="center" gap={2}>
        <Chip
          icon={isConnected ? <SignalWifi4BarIcon /> : <SignalWifiOffIcon />}
          label={isConnected ? 'Connected to OCPP Server' : 'Not Connected to OCPP Server'}
          color={isConnected ? 'success' : 'error'}
          size="small"
        />
      </Box>
      
      {chargePoints?.count > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Total connected charge points: {chargePoints.count}
        </Typography>
      )}
    </Paper>
  );
};

export default ChargePointStatus;