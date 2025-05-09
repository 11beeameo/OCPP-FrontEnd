// src/components/company/CompanyForm.js
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  CircularProgress,
  Paper
} from '@mui/material';

// Define validation schema
const schema = yup.object({
  CompanyName: yup.string().required('Company name is required'),
  CompanyEnabled: yup.boolean(),
  CompanyHomePhoto: yup.string().nullable(),
  CompanyBrandColour: yup.string().nullable()
    .test('is-color', 'Must be a valid color hex code (e.g. #FF0000)', value => {
      if (!value) return true; // Allow null/empty
      return /^#([0-9A-F]{3}){1,2}$/i.test(value);
    }),
  CompanyBrandLogo: yup.string().nullable(),
  CompanyBrandFavicon: yup.string().nullable(),
}).required();

const CompanyForm = ({ company, onSubmit, isLoading }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: company ? {
      CompanyName: company.CompanyName,
      CompanyEnabled: company.CompanyEnabled,
      CompanyHomePhoto: company.CompanyHomePhoto || '',
      CompanyBrandColour: company.CompanyBrandColour || '',
      CompanyBrandLogo: company.CompanyBrandLogo || '',
      CompanyBrandFavicon: company.CompanyBrandFavicon || '',
    } : {
      CompanyName: '',
      CompanyEnabled: true,
      CompanyHomePhoto: '',
      CompanyBrandColour: '',
      CompanyBrandLogo: '',
      CompanyBrandFavicon: '',
    }
  });

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="CompanyName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Company Name"
                  fullWidth
                  error={!!errors.CompanyName}
                  helperText={errors.CompanyName?.message}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="CompanyEnabled"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Company Enabled"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="CompanyHomePhoto"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Home Photo URL"
                  fullWidth
                  error={!!errors.CompanyHomePhoto}
                  helperText={errors.CompanyHomePhoto?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="CompanyBrandColour"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Brand Color (Hex code)"
                  fullWidth
                  error={!!errors.CompanyBrandColour}
                  helperText={errors.CompanyBrandColour?.message}
                  InputProps={{
                    endAdornment: field.value ? (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: field.value,
                          borderRadius: '50%',
                          border: '1px solid #ccc'
                        }}
                      />
                    ) : null
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="CompanyBrandLogo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Brand Logo URL"
                  fullWidth
                  error={!!errors.CompanyBrandLogo}
                  helperText={errors.CompanyBrandLogo?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="CompanyBrandFavicon"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Brand Favicon URL"
                  fullWidth
                  error={!!errors.CompanyBrandFavicon}
                  helperText={errors.CompanyBrandFavicon?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {company ? 'Update' : 'Create'} Company
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CompanyForm;