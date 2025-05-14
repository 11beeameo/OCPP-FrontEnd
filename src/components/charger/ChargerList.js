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
  Divider,
  Stack,
  Tooltip,
  styled
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

// Create a styled Card to ensure consistent sizes
const ChargerCard = styled(Card)(({ theme }) => ({
  height: 280, // Fixed height for all cards
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

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
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {chargers && chargers.map((charger) => (
            <Box key={charger.ChargerId} sx={{ 
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
                    <Box display="flex" alignItems="center">
                      <EvStationIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" noWrap>
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
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ID: {charger.ChargerId}
                  </Typography>
                  
                  {/* This spacer pushes the action buttons to the bottom */}
                  <Box sx={{ flexGrow: 1 }} />
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  {/* Updated action buttons with text labels */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Charger Details">
                        <Button
                          component={Link}
                          to={`/chargers/${charger.ChargerId}?company=${companyId}&site=${siteId}`}
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
                          to={`/chargers/${charger.ChargerId}/edit?company=${companyId}&site=${siteId}`}
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
                          onClick={() => onDeleteClick && onDeleteClick(charger.ChargerId, companyId, siteId)}
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
    </Box>
  );
};

export default ChargerList;