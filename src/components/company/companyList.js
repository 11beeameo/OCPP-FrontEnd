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
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getCompanies } from '../../api/companyAPI';
import LoadingSpinner from '../common/Loadingspinner';
import ErrorAlert from '../common/ErrorAlert';

const CompanyList = ({ onDeleteClick }) => {
  // Fetch companies
  // src/components/company/CompanyList.js
  // Update the useQuery call
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
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {company.CompanyName}
                  </Typography>
                  <Chip
                    label={company.CompanyEnabled ? "Active" : "Inactive"}
                    color={company.CompanyEnabled ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID: {company.CompanyId}
                </Typography>

                {company.CompanyBrandColour && (
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: company.CompanyBrandColour,
                      borderRadius: 1,
                      mb: 1
                    }}
                  />
                )}

                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <IconButton
                    component={Link}
                    to={`/companies/${company.CompanyId}`}
                    aria-label="view"
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/companies/${company.CompanyId}/edit`}
                    aria-label="edit"
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    color="error"
                    onClick={() => onDeleteClick && onDeleteClick(company.CompanyId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
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