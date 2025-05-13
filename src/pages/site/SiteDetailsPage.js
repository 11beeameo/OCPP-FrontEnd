// Full SiteDetailsPage.js with updated structure

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
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={RouterLink}
            to={`/sites/${site.SiteId}/edit`}
            sx={{ mr: 1 }}
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
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Row 1: Basic Information and Metadata */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={2}>
            <Typography variant="subtitle2" color="text.secondary">Site ID</Typography>
            <Typography variant="body1">{site.SiteId}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
            <Chip 
              label={site.SiteEnabled ? "Enabled" : "Disabled"} 
              color={site.SiteEnabled ? "success" : "default"}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="subtitle2" color="text.secondary">Tax Rate</Typography>
            <Typography variant="body1">{site.SiteTaxRate ? `${site.SiteTaxRate}%` : '-'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
            <Typography variant="body1">{new Date(site.SiteCreated).toLocaleString()}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
            <Typography variant="body1">{new Date(site.SiteUpdated).toLocaleString()}</Typography>
          </Grid>
        </Grid>
        
        {/* Row 2: Address Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <LocationOnIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Address
          </Typography>
          
          {hasAddress ? (
            <Typography variant="body1">
              {addressLine1 && <>{addressLine1}<br /></>}
              {addressLine2 && <>{addressLine2}<br /></>}
              {addressLine3 && <>{addressLine3}</>}
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No address information available
            </Typography>
          )}
          
          {site.SiteGeoCoord && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Geo Coordinates: {site.SiteGeoCoord}
            </Typography>
          )}
        </Box>
        
        {/* Row 3: Contact Phone */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Contact Phone
          </Typography>
          
          {site.SiteContactPh ? (
            <Typography variant="body1">
              {site.SiteContactPh}
              {site.SiteContactName && (
                <Typography variant="body2" color="text.secondary">
                  Contact: {site.SiteContactName}
                </Typography>
              )}
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No contact phone available
            </Typography>
          )}
        </Box>
        
        {/* Row 4: Contact Email */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Contact Email
          </Typography>
          
          {site.SiteContactEmail ? (
            <Typography variant="body1">
              {site.SiteContactEmail}
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No contact email available
            </Typography>
          )}
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