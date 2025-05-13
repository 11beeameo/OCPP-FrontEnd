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
    Alert,
    CardMedia,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import PaletteIcon from '@mui/icons-material/Palette';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import ImageIcon from '@mui/icons-material/Image';
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

            {/* Company Details Card with Single Row Layout */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        component={RouterLink}
                        to={`/companies/${company.CompanyId}/edit`}
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
                
                <Divider sx={{ mb: 2 }} />
                
                {/* Single Row Layout Table */}
                <TableContainer component={Paper} elevation={0}>
                    <Table sx={{ minWidth: 650 }} aria-label="company details">
                        <TableBody>
                            <TableRow>
                                <TableCell component="th" scope="row" width="20%">
                                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <BusinessIcon sx={{ mr: 1 }} fontSize="small" />
                                        Company Name
                                    </Typography>
                                </TableCell>
                                <TableCell width="30%">
                                    <Typography variant="body1">{company.CompanyName}</Typography>
                                </TableCell>
                                <TableCell width="20%">
                                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AccessTimeIcon sx={{ mr: 1 }} fontSize="small" />
                                        Created On
                                    </Typography>
                                </TableCell>
                                <TableCell width="30%">
                                    <Typography variant="body1">
                                        {new Date(company.CompanyCreated).toLocaleString()}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            
                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                                        Status
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={company.CompanyEnabled ? "Enabled" : "Disabled"}
                                        color={company.CompanyEnabled ? "success" : "default"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <UpdateIcon sx={{ mr: 1 }} fontSize="small" />
                                        Last Updated
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1">
                                        {new Date(company.CompanyUpdated).toLocaleString()}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            
                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PaletteIcon sx={{ mr: 1 }} fontSize="small" />
                                        Brand Color
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        {company.CompanyBrandColour ? (
                                            <>
                                                <Box 
                                                    sx={{ 
                                                        width: 20, 
                                                        height: 20, 
                                                        borderRadius: '50%', 
                                                        bgcolor: company.CompanyBrandColour,
                                                        border: '1px solid #ddd',
                                                        mr: 1
                                                    }} 
                                                />
                                                <Typography variant="body1">{company.CompanyBrandColour}</Typography>
                                            </>
                                        ) : (
                                            <Typography variant="body1">Not set</Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ImageIcon sx={{ mr: 1 }} fontSize="small" />
                                        Brand Logo
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {company.CompanyBrandLogo ? (
                                        <CardMedia
                                            component="img"
                                            sx={{ 
                                                height: 40, 
                                                width: 'auto', 
                                                maxWidth: 150,
                                                objectFit: 'contain'
                                            }}
                                            image={company.CompanyBrandLogo}
                                            alt={`${company.CompanyName} logo`}
                                        />
                                    ) : (
                                        <Typography variant="body1">Not set</Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
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