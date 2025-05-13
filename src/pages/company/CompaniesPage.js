// src/pages/company/CompaniesPage.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  CardMedia,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  Divider,
  CardActions,
  Stack,
  Tooltip,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { getCompanies, deleteCompany } from '../../api/companyAPI';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const CompaniesPage = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch companies with enabled=true
  const { data: companies, isLoading, isError, error } = useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies(true)
  });

  // Delete company mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setSnackbar({
        open: true,
        message: 'Company deleted successfully',
        severity: 'success'
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error deleting company: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const handleDeleteClick = (companyId) => {
    setCompanyToDelete(companyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (companyToDelete) {
      deleteMutation.mutate(companyToDelete);
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'Failed to load companies'} />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Companies</Typography>
        <Button 
          component={Link} 
          to="/companies/new" 
          variant="contained" 
          startIcon={<AddIcon />}
        >
          Add Company
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search companies by name..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ backgroundColor: 'white' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {companies && companies.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No companies found
          </Typography>
          <Button 
            component={Link} 
            to="/companies/new" 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add Your First Company
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {companies && companies
            .filter(company => 
              company.CompanyName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((company) => (
            <Grid item xs={12} md={6} lg={4} key={company.CompanyId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* 1st row: Company Name */}
                  <Typography variant="h6" component="div" gutterBottom noWrap>
                    {company.CompanyName}
                  </Typography>
                  
                  {/* 2nd row: Status Chip */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Chip
                      label={company.CompanyEnabled ? "Enabled" : "Disabled"}
                      color={company.CompanyEnabled ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                  
                  {/* 3rd row: Company Logo or Placeholder */}
                  {company.CompanyBrandLogo ? (
                    <CardMedia
                      component="img"
                      height="100"
                      image={company.CompanyBrandLogo}
                      alt={`${company.CompanyName} logo`}
                      sx={{ objectFit: 'contain', mb: 2, borderRadius: 1 }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        height: 100, 
                        mb: 2, 
                        borderRadius: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: company.CompanyBrandColour || '#f5f5f5',
                        color: company.CompanyBrandColour ? '#fff' : 'text.secondary'
                      }}
                    >
                      <Typography variant="body2">
                        {company.CompanyName} (No Logo)
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <Divider />
                
                {/* Action Buttons */}
                <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Company Details">
                      <Button
                        component={Link}
                        to={`/companies/${company.CompanyId}`}
                        variant="outlined"
                        color="primary"
                        startIcon={<VisibilityIcon />}
                        size="small"
                      >
                        View
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="Edit Company">
                      <Button
                        component={Link}
                        to={`/companies/${company.CompanyId}/edit`}
                        variant="outlined"
                        color="info"
                        startIcon={<EditIcon />}
                        size="small"
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="Delete Company">
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(company.CompanyId)}
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

      {/* No results for search */}
      {companies && companies.length > 0 && 
       companies.filter(company => 
         company.CompanyName.toLowerCase().includes(searchTerm.toLowerCase())
       ).length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No companies found matching "{searchTerm}"
          </Typography>
          <Button 
            onClick={clearSearch}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Clear Search
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Company</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this company? This action cannot be undone.
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

export default CompaniesPage;