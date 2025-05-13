// src/components/company/CompanyList.js
import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
  CardMedia,
  Tooltip,
  Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getCompanies } from '../../api/companyAPI';
import LoadingSpinner from '../common/Loadingspinner';
import ErrorAlert from '../common/ErrorAlert';

const placeholderImage = 'https://via.placeholder.com/300x100?text=Company+Logo';

const CompanyList = ({ onDeleteClick }) => {
  // Fetch companies
  const { data: companies, isLoading, isError, error } = useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies(true) // Explicitly request enabled=true
  });

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

      <Grid container spacing={3}>
        {companies && companies.map((company) => (
          <Grid item xs={12} md={6} lg={4} key={company.CompanyId}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Company Name */}
                <Typography variant="h6" component="div" gutterBottom noWrap>
                  {company.CompanyName}
                </Typography>
                
                {/* Status Chip */}
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip
                    label={company.CompanyEnabled ? "Enabled" : "Disabled"}
                    color={company.CompanyEnabled ? "success" : "default"}
                    size="small"
                  />
                </Box>
                
                {/* Company Logo or Placeholder */}
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
                      onClick={() => onDeleteClick && onDeleteClick(company.CompanyId)}
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

      {companies && companies.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No companies found
          </Typography>
          <Button
            component={Link}
            to="/companies/new"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add Your First Company
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CompanyList;