// Modified version of src/components/site/SiteList.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Button,
  Divider,
  CardActions,
  Stack,
  Tooltip
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LoadingSpinner from '../common/Loadingspinner';
import ErrorAlert from '../common/ErrorAlert';

const SiteList = ({ 
  sites, 
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
    return <ErrorAlert message={error instanceof Error ? error.message : 'Error loading sites'} />;
  }

  return (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Sites</Typography>
        <Button 
          component={Link} 
          to={`/companies/${companyId}/sites/new`} 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
        >
          Add Site
        </Button>
      </Box>

      {sites && sites.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No sites found for this company
          </Typography>
          <Button 
            component={Link} 
            to={`/companies/${companyId}/sites/new`} 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add First Site
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {sites && sites.map((site) => (
            <Grid item xs={12} md={6} lg={4} key={site.SiteId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Site Name */}
                  <Typography variant="h6" component="div" gutterBottom noWrap>
                    {site.SiteName}
                  </Typography>
                  
                  {/* Status Chip */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Chip
                      label={site.SiteEnabled ? "Enabled" : "Disabled"}
                      color={site.SiteEnabled ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                  
                  {/* Site Address */}
                  {(site.SiteAddress || site.SiteCity || site.SiteRegion || site.SiteCountry) && (
                    <Box display="flex" alignItems="flex-start" mb={2}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                      <Box>
                        {site.SiteAddress && (
                          <Typography variant="body2">
                            {site.SiteAddress}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          {[site.SiteCity, site.SiteRegion, site.SiteCountry]
                            .filter(Boolean)
                            .join(', ')}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
                
                <Divider />
                
                {/* Action Buttons */}
                <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Site Details">
                      <Button
                        component={Link}
                        to={`/sites/${site.SiteId}`}
                        variant="outlined"
                        color="primary"
                        startIcon={<VisibilityIcon />}
                        size="small"
                      >
                        View
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="Edit Site">
                      <Button
                        component={Link}
                        to={`/sites/${site.SiteId}/edit`}
                        variant="outlined"
                        color="info"
                        startIcon={<EditIcon />}
                        size="small"
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="Delete Site">
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => onDeleteClick && onDeleteClick(site.SiteId)}
                        size="small"
                      >
                        Delete
                      </Button>
                    </Tooltip>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SiteList;