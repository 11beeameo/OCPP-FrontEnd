// src/components/charger/ChargerForm.js
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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EvStationIcon from '@mui/icons-material/EvStation';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import HttpIcon from '@mui/icons-material/Http';
import PhoneIcon from '@mui/icons-material/Phone';
import MemoryIcon from '@mui/icons-material/Memory';

// Define validation schema
const schema = yup.object({
  ChargerName: yup.string().required('Charger name is required'),
  ChargerEnabled: yup.boolean(),
  ChargerBrand: yup.string().nullable(),
  ChargerModel: yup.string().nullable(),
  ChargerType: yup.string().nullable(),
  ChargerSerial: yup.string().nullable(),
  ChargerMeter: yup.string().nullable(),
  ChargerMeterSerial: yup.string().nullable(),
  ChargerPincode: yup.string().nullable(),
  ChargerWsURL: yup.string().nullable(),
  ChargerICCID: yup.string().nullable(),
  ChargerAvailability: yup.string().nullable(),
  ChargerIsOnline: yup.boolean(),
  ChargerAccessType: yup.string().nullable(),
  ChargerActive24x7: yup.boolean()
}).required();

const chargerTypes = [
  'AC',
  'DC',
  'AC/DC',
  'Level 1',
  'Level 2',
  'Level 3',
  'Fast Charger',
  'Slow Charger'
];

const accessTypes = [
  'Public',
  'Private',
  'Restricted',
  'Membership',
  'Pay-As-You-Go'
];

const ChargerForm = ({ charger, companyId, siteId, onSubmit, isLoading }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: charger ? {
      ChargerName: charger.ChargerName,
      ChargerEnabled: charger.ChargerEnabled,
      ChargerBrand: charger.ChargerBrand || '',
      ChargerModel: charger.ChargerModel || '',
      ChargerType: charger.ChargerType || '',
      ChargerSerial: charger.ChargerSerial || '',
      ChargerMeter: charger.ChargerMeter || '',
      ChargerMeterSerial: charger.ChargerMeterSerial || '',
      ChargerPincode: charger.ChargerPincode || '',
      ChargerWsURL: charger.ChargerWsURL || '',
      ChargerICCID: charger.ChargerICCID || '',
      ChargerAvailability: charger.ChargerAvailability || '',
      ChargerIsOnline: charger.ChargerIsOnline || false,
      ChargerAccessType: charger.ChargerAccessType || '',
      ChargerActive24x7: charger.ChargerActive24x7 || true,
    } : {
      ChargerName: '',
      ChargerEnabled: true,
      ChargerBrand: '',
      ChargerModel: '',
      ChargerType: '',
      ChargerSerial: '',
      ChargerMeter: '',
      ChargerMeterSerial: '',
      ChargerPincode: '',
      ChargerWsURL: '',
      ChargerICCID: '',
      ChargerAvailability: '',
      ChargerIsOnline: false,
      ChargerAccessType: '',
      ChargerActive24x7: true,
    }
  });

  const onFormSubmit = (data) => {
    // Add company ID and site ID to the form data for charger creation
    const formData = {
      ...data,
      ChargerCompanyId: companyId,
      ChargerSiteId: siteId,
      // Also add ChargerId for API compatibility
      ChargerId: charger?.ChargerId || Math.floor(Math.random() * 10000) // Generate a random ID if new charger
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
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Charger Name"
                  fullWidth
                  error={!!errors.ChargerName}
                  helperText={errors.ChargerName?.message}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EvStationIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="charger-type-label">Charger Type</InputLabel>
                  <Select
                    {...field}
                    labelId="charger-type-label"
                    label="Charger Type"
                    error={!!errors.ChargerType}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {chargerTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerAccessType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="access-type-label">Access Type</InputLabel>
                  <Select
                    {...field}
                    labelId="access-type-label"
                    label="Access Type"
                    error={!!errors.ChargerAccessType}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {accessTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerAvailability"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Availability Schedule"
                  fullWidth
                  error={!!errors.ChargerAvailability}
                  helperText={errors.ChargerAvailability?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <Controller
              name="ChargerEnabled"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Enabled"
                />
              )}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <Controller
              name="ChargerActive24x7"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Active 24/7"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" gutterBottom>Hardware Information</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerBrand"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Brand"
                  fullWidth
                  error={!!errors.ChargerBrand}
                  helperText={errors.ChargerBrand?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerModel"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Model"
                  fullWidth
                  error={!!errors.ChargerModel}
                  helperText={errors.ChargerModel?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerSerial"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Serial Number"
                  fullWidth
                  error={!!errors.ChargerSerial}
                  helperText={errors.ChargerSerial?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MemoryIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerPincode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="PIN Code"
                  fullWidth
                  error={!!errors.ChargerPincode}
                  helperText={errors.ChargerPincode?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" gutterBottom>Connectivity</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerWsURL"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="WebSocket URL"
                  fullWidth
                  error={!!errors.ChargerWsURL}
                  helperText={errors.ChargerWsURL?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HttpIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerICCID"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ICCID"
                  fullWidth
                  error={!!errors.ChargerICCID}
                  helperText={errors.ChargerICCID?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" gutterBottom>Metering</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerMeter"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Meter Model"
                  fullWidth
                  error={!!errors.ChargerMeter}
                  helperText={errors.ChargerMeter?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="ChargerMeterSerial"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Meter Serial Number"
                  fullWidth
                  error={!!errors.ChargerMeterSerial}
                  helperText={errors.ChargerMeterSerial?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DeviceHubIcon />
                      </InputAdornment>
                    ),
                  }}
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
                {charger ? 'Update' : 'Create'} Charger
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ChargerForm;