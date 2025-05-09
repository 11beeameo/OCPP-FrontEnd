// src/pages/company/CompanyDetailsPage.js
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
import { getCompany, deleteCompany } from '../../api/companyAPI';
import { getCompanySites, deleteSite } from '../../api/siteAPI';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SiteList from '../../components/site/SiteList';

const CompanyDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const companyId = parseInt(id);

    // Fetch company details
    const { data: company, isLoading, isError, error } = useQuery({
        queryKey: ['company', companyId],
        queryFn: () => getCompany(companyId),
        enabled: !!companyId && !isNaN(companyId)
    });

    // Fetch company sites
    const {
        data: sites,
        isLoading: isLoadingSites,
        isError: isSitesError,
        error: sitesError
    } = useQuery({
        queryKey: ['company-sites', companyId],
        queryFn: () => getCompanySites(companyId),
        enabled: !!companyId && !isNaN(companyId)
    });

    // Delete company mutation
    const deleteMutation = useMutation({
        mutationFn: deleteCompany,
        onSuccess: () => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            queryClient.invalidateQueries({ queryKey: ['company-sites', companyId] });

            setSnackbar({
                open: true,
                message: 'Company deleted successfully',
                severity: 'success'
            });

            // Navigate to companies list after deletion
            setTimeout(() => {
                navigate('/companies');
            }, 1500);
        },
        onError: (error) => {
            setSnackbar({
                open: true,
                message: `Error deleting company: ${error.message}`,
                severity: 'error'
            });
        }
    });

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteMutation.mutateAsync(companyId);
        } catch (err) {
            // Error is handled by the mutation
        }
        setDeleteDialogOpen(false);
    };
    /*
      const handleDeleteSite = (siteId) => {
        // We'll implement site deletion in another step
        console.log(`Delete site ${siteId}`);
        // For now, just show a message
        setSnackbar({
          open: true,
          message: 'Site deletion will be implemented in the next step',
          severity: 'info'
        });
      };*/

    // Then update the handleDeleteSite function within the component
    const handleDeleteSite = async (siteId) => {
        try {
            await deleteSite(siteId);
            // Refresh the sites list
            queryClient.invalidateQueries({ queryKey: ['company-sites', companyId] });

            setSnackbar({
                open: true,
                message: 'Site deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Error deleting site: ${error.message}`,
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

    if (isError || !company) {
        return <ErrorAlert message={error instanceof Error ? error.message : 'Error loading company'} />;
    }

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
                        <Typography color="textPrimary">{company.CompanyName}</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4">{company.CompanyName}</Typography>
                </div>

                <Button
                    component={RouterLink}
                    to="/companies"
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Companies
                </Button>
            </Box>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box mb={2}>
                            <Typography variant="subtitle2" color="text.secondary">Company ID</Typography>
                            <Typography variant="body1">{company.CompanyId}</Typography>
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                            <Chip
                                label={company.CompanyEnabled ? "Active" : "Inactive"}
                                color={company.CompanyEnabled ? "success" : "default"}
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                            <Typography variant="body1">
                                {new Date(company.CompanyCreated).toLocaleString()}
                            </Typography>
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                            <Typography variant="body1">
                                {new Date(company.CompanyUpdated).toLocaleString()}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        {company.CompanyBrandColour && (
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="text.secondary">Brand Color</Typography>
                                <Box display="flex" alignItems="center">
                                    <Box
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            bgcolor: company.CompanyBrandColour,
                                            borderRadius: 1,
                                            mr: 1,
                                            border: '1px solid #ccc'
                                        }}
                                    />
                                    <Typography variant="body1">{company.CompanyBrandColour}</Typography>
                                </Box>
                            </Box>
                        )}

                        {company.CompanyHomePhoto && (
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="text.secondary">Home Photo URL</Typography>
                                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                                    {company.CompanyHomePhoto}
                                </Typography>
                            </Box>
                        )}

                        {company.CompanyBrandLogo && (
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="text.secondary">Brand Logo URL</Typography>
                                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                                    {company.CompanyBrandLogo}
                                </Typography>
                            </Box>
                        )}

                        {company.CompanyBrandFavicon && (
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="text.secondary">Brand Favicon URL</Typography>
                                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                                    {company.CompanyBrandFavicon}
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        component={RouterLink}
                        to={`/companies/${company.CompanyId}/edit`}
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

            {/* Sites List Section */}
            <SiteList
                sites={sites}
                companyId={companyId}
                isLoading={isLoadingSites}
                isError={isSitesError}
                error={sitesError}
                onDeleteClick={handleDeleteSite}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Company</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{company.CompanyName}"? This action cannot be undone.
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

export default CompanyDetailsPage;