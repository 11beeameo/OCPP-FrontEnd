// src/components/site/SiteForm.js - Modified for vertical layout
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
  Paper,
  InputAdornment,
  Typography,
  Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';

// Define validation schema
const schema = yup.object({
  SiteName: yup.string().required('Site name is required'),
  SiteEnabled: yup.boolean(),
  SiteAddress: yup.string().nullable(),
  SiteCity: yup.string().nullable(),
  SiteRegion: yup.string().nullable(),
  SiteCountry: yup.string().nullable(),
  SiteZipCode: yup.string().nullable(),
  SiteContactName: yup.string().nullable(),
  SiteContactPh: yup.string().nullable(),
  SiteContactEmail: yup.string().email('Invalid email format').nullable(),
  SiteTaxRate: yup.number().nullable().transform((value) => 
    isNaN(value) ? null : value
  )
}).required();

const SiteForm = ({ site, companyId, onSubmit, isLoading }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: site ? {
      SiteName: site.SiteName,
      SiteEnabled: site.SiteEnabled,
      SiteAddress: site.SiteAddress || '',
      SiteCity: site.SiteCity || '',
      SiteRegion: site.SiteRegion || '',
      SiteCountry: site.SiteCountry || '',
      SiteZipCode: site.SiteZipCode || '',
      SiteContactName: site.SiteContactName || '',
      SiteContactPh: site.SiteContactPh || '',
      SiteContactEmail: site.SiteContactEmail || '',
      SiteTaxRate: site.SiteTaxRate || '',
      SiteGeoCoord: site.SiteGeoCoord || '',
    } : {
      SiteName: '',
      SiteEnabled: true,
      SiteAddress: '',
      SiteCity: '',
      SiteRegion: '',
      SiteCountry: '',
      SiteZipCode: '',
      SiteContactName: '',
      SiteContactPh: '',
      SiteContactEmail: '',
      SiteTaxRate: '',
      SiteGeoCoord: '',
    }
  });

  const onFormSubmit = (data) => {
    // Add company ID to the form data for site creation
    const formData = {
      ...data,
      SiteCompanyID: companyId,
    };
    
    // Convert empty strings to null
    Object.keys(formData).forEach(key => {
      if (formData[key] === '') {
        formData[key] = null;
      }
    });
    
    onSubmit(formData);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Grid container spacing={3} direction="column">
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Site Name"
                  fullWidth
                  error={!!errors.SiteName}
                  helperText={errors.SiteName?.message}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteTaxRate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tax Rate (%)"
                  fullWidth
                  type="number"
                  inputProps={{ step: "0.01" }}
                  error={!!errors.SiteTaxRate}
                  helperText={errors.SiteTaxRate?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteEnabled"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Site Enabled"
                />
              )}
            />
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Address Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteAddress"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Street Address"
                  fullWidth
                  error={!!errors.SiteAddress}
                  helperText={errors.SiteAddress?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteCity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="City"
                  fullWidth
                  error={!!errors.SiteCity}
                  helperText={errors.SiteCity?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteRegion"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="State/Province/Region"
                  fullWidth
                  error={!!errors.SiteRegion}
                  helperText={errors.SiteRegion?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteCountry"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Country"
                  fullWidth
                  error={!!errors.SiteCountry}
                  helperText={errors.SiteCountry?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteZipCode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Postal/Zip Code"
                  fullWidth
                  error={!!errors.SiteZipCode}
                  helperText={errors.SiteZipCode?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteGeoCoord"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Geo Coordinates (latitude,longitude)"
                  placeholder="e.g. 40.7128,-74.0060"
                  fullWidth
                  error={!!errors.SiteGeoCoord}
                  helperText={errors.SiteGeoCoord?.message}
                />
              )}
            />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Contact Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteContactName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact Name"
                  fullWidth
                  error={!!errors.SiteContactName}
                  helperText={errors.SiteContactName?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteContactPh"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact Phone"
                  fullWidth
                  error={!!errors.SiteContactPh}
                  helperText={errors.SiteContactPh?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="SiteContactEmail"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact Email"
                  fullWidth
                  error={!!errors.SiteContactEmail}
                  helperText={errors.SiteContactEmail?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {site ? 'Update' : 'Create'} Site
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default SiteForm;