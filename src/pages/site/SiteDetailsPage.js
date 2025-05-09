// src/pages/site/SiteDetailsPage.js
import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import PercentIcon from '@mui/icons-material/Percent';
import { getSite, deleteSite } from '../../api/siteAPI';
import { getCompany } from '../../api/companyAPI';
import { getSiteChargers, deleteCharger } from '../../api/chargerAPI';
import ChargerList from '../../components/charger/ChargerList';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const SiteDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const siteId = parseInt(id);

  // Fetch site details
  const { data: site, isLoading, isError, error } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => getSite(siteId),
    enabled: !!siteId && !isNaN(siteId)
  });

  // Fetch company details once we have the site
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', site?.SiteCompanyID],
    queryFn: () => getCompany(site.SiteCompanyID),
    enabled: !!site?.SiteCompanyID
  });

  // Fetch chargers for this site
  const { 
    data: chargers,
    isLoading: isLoadingChargers,
    isError: isChargersError,
    error: chargersError
  } = useQuery({
    queryKey: ['site-chargers', siteId, site?.SiteCompanyID],
    queryFn: () => getSiteChargers(siteId, site.SiteCompanyID),
    enabled: !!siteId && !!site?.SiteCompanyID
  });

  // Delete site mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSite,
    onSuccess: () => {
      // Invalidate queries to refresh data
      if (site?.SiteCompanyID) {
        queryClient.invalidateQueries({ queryKey: ['company-sites', site.SiteCompanyID] });
      }
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      
      setSnackbar({
        open: true,
        message: 'Site deleted successfully',
        severity: 'success'
      });
      
      // Navigate to company details after deletion
      setTimeout(() => {
        navigate(`/companies/${site?.SiteCompanyID}`);
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error deleting site: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(siteId);
    } catch (err) {
      // Error is handled by the mutation
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteCharger = async (chargerId, companyId, siteId) => {
    try {
      await deleteCharger(chargerId, companyId, siteId);
      // Refresh the chargers list
      queryClient.invalidateQueries({ queryKey: ['site-chargers', siteId, companyId] });
      
      setSnackbar({
        open: true,
        message: 'Charger deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error deleting charger: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !site) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'Error loading site'} />;
  }

  // Format address components for display
  const hasAddress = site.SiteAddress || site.SiteCity || site.SiteRegion || site.SiteCountry;
  const addressLine1 = site.SiteAddress || '';
  const addressLine2 = [
    site.SiteCity,
    site.SiteRegion,
    site.SiteZipCode
  ].filter(Boolean).join(', ');
  const addressLine3 = site.SiteCountry || '';

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
            {!isLoadingCompany && company && (
              <Link 
                component={RouterLink} 
                to={`/companies/${site.SiteCompanyID}`} 
                color="inherit"
              >
                {company.CompanyName}
              </Link>
            )}
            <Typography color="textPrimary">{site.SiteName}</Typography>
          </Breadcrumbs>
          <Typography variant="h4">{site.SiteName}</Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to={`/companies/${site.SiteCompanyID}`} 
          startIcon={<ArrowBackIcon />}
        >
          Back to Company
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
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Site ID" 
                    secondary={site.SiteId} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Status" 
                    secondary={
                      <Chip 
                        label={site.SiteEnabled ? "Active" : "Inactive"} 
                        color={site.SiteEnabled ? "success" : "default"}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    } 
                  />
                </ListItem>
                {site.SiteTaxRate !== null && (
                  <ListItem>
                    <ListItemIcon>
                      <PercentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tax Rate" 
                      secondary={`${site.SiteTaxRate}%`} 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
            
            {hasAddress && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Address</Typography>
                <List dense disablePadding>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={addressLine1} 
                      secondary={
                        <>
                          {addressLine2 && <Typography variant="body2">{addressLine2}</Typography>}
                          {addressLine3 && <Typography variant="body2">{addressLine3}</Typography>}
                        </>
                      } 
                    />
                  </ListItem>
                </List>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Contact Information</Typography>
              {(site.SiteContactName || site.SiteContactPh || site.SiteContactEmail) ? (
                <List dense disablePadding>
                  {site.SiteContactName && (
                    <ListItem>
                      <ListItemText 
                        primary="Contact Name" 
                        secondary={site.SiteContactName} 
                      />
                    </ListItem>
                  )}
                  {site.SiteContactPh && (
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Phone" 
                        secondary={site.SiteContactPh} 
                      />
                    </ListItem>
                  )}
                  {site.SiteContactEmail && (
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={site.SiteContactEmail} 
                      />
                    </ListItem>
                  )}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No contact information available
                </Typography>
              )}
            </Box>
            
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Metadata</Typography>
              <List dense disablePadding>
                <ListItem>
                  <ListItemText 
                    primary="Created" 
                    secondary={new Date(site.SiteCreated).toLocaleString()} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Last Updated" 
                    secondary={new Date(site.SiteUpdated).toLocaleString()} 
                  />
                </ListItem>
                {site.SiteGeoCoord && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Geo Coordinates" 
                      secondary={site.SiteGeoCoord} 
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
            to={`/sites/${site.SiteId}/edit`}
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

      {/* Chargers List Section */}
      <ChargerList
        chargers={chargers}
        siteId={siteId}
        companyId={site.SiteCompanyID}
        isLoading={isLoadingChargers}
        isError={isChargersError}
        error={chargersError}
        onDeleteClick={handleDeleteCharger}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Site</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{site.SiteName}"? This action cannot be undone.
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

export default SiteDetailsPage;