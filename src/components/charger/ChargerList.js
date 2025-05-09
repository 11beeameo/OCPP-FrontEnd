// src/components/charger/ChargerList.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  IconButton,
  Button,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EvStationIcon from '@mui/icons-material/EvStation';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import LoadingSpinner from '../common/Loadingspinner';
import ErrorAlert from '../common/ErrorAlert';

const ChargerList = ({ 
  chargers, 
  siteId, 
  companyId, 
  isLoading, 
  isError, 
  error,
  onDeleteClick 
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'Error loading chargers'} />;
  }

  return (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Chargers</Typography>
        <Button 
          component={Link} 
          to={`/sites/${siteId}/chargers/new`} 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
        >
          Add Charger
        </Button>
      </Box>

      {chargers && chargers.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No chargers found for this site
          </Typography>
          <Button 
            component={Link} 
            to={`/sites/${siteId}/chargers/new`} 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add First Charger
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {chargers && chargers.map((charger) => (
            <Grid item xs={12} md={6} lg={4} key={charger.ChargerId}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <EvStationIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {charger.ChargerName}
                      </Typography>
                    </Box>
                    <Chip 
                      label={charger.ChargerEnabled ? "Enabled" : "Disabled"} 
                      color={charger.ChargerEnabled ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={0.5}>
                      {charger.ChargerIsOnline ? (
                        <SignalWifi4BarIcon sx={{ mr: 1, color: 'success.main' }} fontSize="small" />
                      ) : (
                        <SignalWifiOffIcon sx={{ mr: 1, color: 'text.disabled' }} fontSize="small" />
                      )}
                      <Typography variant="body2">
                        {charger.ChargerIsOnline ? "Online" : "Offline"}
                      </Typography>
                    </Box>
                    
                    {charger.ChargerBrand && (
                      <Typography variant="body2" color="text.secondary">
                        {charger.ChargerBrand} {charger.ChargerModel}
                      </Typography>
                    )}
                    
                    {charger.ChargerType && (
                      <Typography variant="body2" color="text.secondary">
                        Type: {charger.ChargerType}
                      </Typography>
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ID: {charger.ChargerId}
                  </Typography>
                  
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <IconButton 
                      component={Link} 
                      to={`/chargers/${charger.ChargerId}?company=${companyId}&site=${siteId}`}
                      aria-label="view"
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      component={Link} 
                      to={`/chargers/${charger.ChargerId}/edit?company=${companyId}&site=${siteId}`}
                      aria-label="edit"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete"
                      color="error"
                      onClick={() => onDeleteClick && onDeleteClick(charger.ChargerId, companyId, siteId)}
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
    </Box>
  );
};

export default ChargerList;