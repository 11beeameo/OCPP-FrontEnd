// src/components/site/SiteList.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  IconButton,
  Divider,
  Button
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
            <Grid item xs={12} md={6} key={site.SiteId}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {site.SiteName}
                    </Typography>
                    <Chip 
                      label={site.SiteEnabled ? "Active" : "Inactive"} 
                      color={site.SiteEnabled ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ID: {site.SiteId}
                  </Typography>
                  
                  {site.SiteAddress && (
                    <Box display="flex" alignItems="flex-start" mb={1}>
                      <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2">
                          {site.SiteAddress}
                          {site.SiteCity && `, ${site.SiteCity}`}
                          {site.SiteRegion && `, ${site.SiteRegion}`}
                        </Typography>
                        {site.SiteCountry && (
                          <Typography variant="body2">
                            {site.SiteCountry} {site.SiteZipCode && site.SiteZipCode}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  
                  {site.SiteContactName && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Contact: {site.SiteContactName}
                      {site.SiteContactPh && ` • ${site.SiteContactPh}`}
                    </Typography>
                  )}
                  
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <IconButton 
                      component={Link} 
                      to={`/sites/${site.SiteId}`}
                      aria-label="view"
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      component={Link} 
                      to={`/sites/${site.SiteId}/edit`}
                      aria-label="edit"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete"
                      color="error"
                      onClick={() => onDeleteClick && onDeleteClick(site.SiteId)}
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

export default SiteList;