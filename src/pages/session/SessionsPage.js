// src/pages/session/SessionsPage.js
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EvStationIcon from '@mui/icons-material/EvStation';
import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getSessions } from '../../api/sessionAPI';
import { getCompanies } from '../../api/companyAPI';
import { getSites } from '../../api/siteAPI';
import { getChargers } from '../../api/chargerAPI';
import SessionList from '../../components/session/SessionList';

const SessionsPage = () => {
  const [filters, setFilters] = useState({
    companyId: '',
    siteId: '',
    chargerId: '',
    driverId: '',
    rfidCard: '',
    status: '',
    startDate: null,
    endDate: null
  });

  // Fetch companies for filter dropdown
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies()
  });

  // Fetch sites based on selected company
  const { data: sites, isLoading: isLoadingSites } = useQuery({
    queryKey: ['sites', filters.companyId],
    queryFn: () => getSites(
      filters.companyId ? parseInt(filters.companyId) : undefined
    ),
    enabled: filters.companyId !== ''
  });

  // Fetch chargers based on selected site
  const { data: chargers, isLoading: isLoadingChargers } = useQuery({
    queryKey: ['chargers', filters.companyId, filters.siteId],
    queryFn: () => getChargers({
      company_id: filters.companyId ? parseInt(filters.companyId) : undefined,
      site_id: filters.siteId ? parseInt(filters.siteId) : undefined
    }),
    enabled: filters.companyId !== ''
  });

  // Fetch sessions with filters
  const { data: sessions, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => getSessions({
      company_id: filters.companyId ? parseInt(filters.companyId) : undefined,
      site_id: filters.siteId ? parseInt(filters.siteId) : undefined,
      charger_id: filters.chargerId ? parseInt(filters.chargerId) : undefined,
      driver_id: filters.driverId ? parseInt(filters.driverId) : undefined,
      rfid_card: filters.rfidCard || undefined,
      status: filters.status || undefined,
      start_date: filters.startDate ? filters.startDate.toISOString() : undefined,
      end_date: filters.endDate ? filters.endDate.toISOString() : undefined
    })
  });

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Reset dependent fields when parent selection changes
      if (name === 'companyId' && value !== prev.companyId) {
        newFilters.siteId = '';
        newFilters.chargerId = '';
      }
      if (name === 'siteId' && value !== prev.siteId) {
        newFilters.chargerId = '';
      }
      
      newFilters[name] = value;
      return newFilters;
    });
  };

  const handleDateChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleResetFilters = () => {
    setFilters({
      companyId: '',
      siteId: '',
      chargerId: '',
      driverId: '',
      rfidCard: '',
      status: '',
      startDate: null,
      endDate: null
    });
  };

  // Common props for all select components
  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 300,
        width: 300,
      },
    },
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Charging Sessions</Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters Panel */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleResetFilters} size="small">
            Reset
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          {/* ROW 1: First 4 filters */}
          <Grid item xs={12} sm={6} md={3}>
            {/* Company Filter */}
            <FormControl fullWidth>
              <InputLabel id="company-filter-label">Company</InputLabel>
              <Select
                labelId="company-filter-label"
                name="companyId"
                value={filters.companyId}
                label="Company"
                onChange={handleFilterChange}
                MenuProps={menuProps}
                startAdornment={
                  <InputAdornment position="start">
                    <BusinessIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Companies</MenuItem>
                {!isLoadingCompanies && companies && companies.map((company) => (
                  <MenuItem key={company.CompanyId} value={company.CompanyId.toString()}>
                    {company.CompanyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            {/* Site Filter */}
            <FormControl fullWidth>
              <InputLabel id="site-filter-label">Site</InputLabel>
              <Select
                labelId="site-filter-label"
                name="siteId"
                value={filters.siteId}
                label="Site"
                onChange={handleFilterChange}
                disabled={!filters.companyId}
                MenuProps={menuProps}
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOnIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Sites</MenuItem>
                {!isLoadingSites && sites && sites.map((site) => (
                  <MenuItem key={site.SiteId} value={site.SiteId.toString()}>
                    {site.SiteName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            {/* Charger Filter */}
            <FormControl fullWidth>
              <InputLabel id="charger-filter-label">Charger</InputLabel>
              <Select
                labelId="charger-filter-label"
                name="chargerId"
                value={filters.chargerId}
                label="Charger"
                onChange={handleFilterChange}
                disabled={!filters.companyId}
                MenuProps={menuProps}
                startAdornment={
                  <InputAdornment position="start">
                    <EvStationIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Chargers</MenuItem>
                {!isLoadingChargers && chargers && chargers.map((charger) => (
                  <MenuItem key={charger.ChargerId} value={charger.ChargerId.toString()}>
                    {charger.ChargerName} (#{charger.ChargerId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            {/* Status Filter */}
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                name="status"
                value={filters.status}
                label="Status"
                onChange={handleFilterChange}
                MenuProps={menuProps}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Started">Started</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* ROW 2: Next 4 filters */}
          <Grid item xs={12} sm={6} md={3}>
            {/* Driver ID Filter */}
            <TextField
              name="driverId"
              label="Driver ID"
              fullWidth
              value={filters.driverId}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            {/* RFID Card Filter */}
            <TextField
              name="rfidCard"
              label="RFID Card"
              fullWidth
              value={filters.rfidCard}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCardIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            {/* Start Date Filter */}
            <TextField
              label="Start Date From"
              type="datetime-local"
              fullWidth
              value={filters.startDate ? filters.startDate.toISOString().slice(0, 16) : ''}
              onChange={(e) => handleDateChange('startDate', e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            {/* End Date Filter */}
            <TextField
              label="Start Date To"
              type="datetime-local"
              fullWidth
              value={filters.endDate ? filters.endDate.toISOString().slice(0, 16) : ''}
              onChange={(e) => handleDateChange('endDate', e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Sessions List */}
      <Box>
        <SessionList 
          sessions={sessions}
          isLoading={isLoading}
          isError={isError}
          error={error}
        />
      </Box>
    </Box>
  );
};

export default SessionsPage;