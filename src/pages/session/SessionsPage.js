// src/pages/session/SessionsPage.js - Fixed Status dropdown text overlap
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
  InputAdornment,
  styled
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

// Styled components for consistent sizing
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minHeight: 80, // Ensure enough height for the label and content
  width: '100%',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  minHeight: 80, // Match the height of the FormControl
  width: '100%',
}));

// Styled Select with appropriate display width
const StyledSelect = styled(Select)(({ theme }) => ({
  width: '100%',
  '& .MuiSelect-select': {
    paddingRight: theme.spacing(4), // Space for the dropdown icon
  }
}));

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

  // Menu props that match the width of the select without being oversized
  const menuProps = {
    // Just use default width to match parent
    PaperProps: {
      style: {
        maxHeight: 300,
      },
    },
    // This makes the menu match the width of the Select component
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
    // Disable auto width which can cause larger-than-parent width menus
    MenuListProps: {
      disableAutoFocusItem: true,
      style: { paddingTop: 0, paddingBottom: 0 }
    },
  };

  // Common style for input fields to ensure consistency
  const inputStyle = {
    height: 56, // Standard Material UI input height
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

      {/* Filters Panel - Fixed Status dropdown */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleResetFilters} size="small">
            Reset
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {/* First Column */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              {/* Company Filter */}
              <Grid item xs={12}>
                <StyledFormControl>
                  <InputLabel id="company-filter-label">Company</InputLabel>
                  <StyledSelect
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
                    sx={inputStyle}
                    displayEmpty
                  >
                    <MenuItem value="" style={{ minWidth: '100%' }}>All Companies</MenuItem>
                    {!isLoadingCompanies && companies && companies.map((company) => (
                      <MenuItem key={company.CompanyId} value={company.CompanyId.toString()} style={{ minWidth: '100%' }}>
                        {company.CompanyName}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </StyledFormControl>
              </Grid>
              
              {/* Site Filter */}
              <Grid item xs={12}>
                <StyledFormControl>
                  <InputLabel id="site-filter-label">Site</InputLabel>
                  <StyledSelect
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
                    sx={inputStyle}
                    displayEmpty
                  >
                    <MenuItem value="" style={{ minWidth: '100%' }}>All Sites</MenuItem>
                    {!isLoadingSites && sites && sites.map((site) => (
                      <MenuItem key={site.SiteId} value={site.SiteId.toString()} style={{ minWidth: '100%' }}>
                        {site.SiteName}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </StyledFormControl>
              </Grid>
              
              {/* Charger Filter */}
              <Grid item xs={12}>
                <StyledFormControl>
                  <InputLabel id="charger-filter-label">Charger</InputLabel>
                  <StyledSelect
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
                    sx={inputStyle}
                    displayEmpty
                  >
                    <MenuItem value="" style={{ minWidth: '100%' }}>All Chargers</MenuItem>
                    {!isLoadingChargers && chargers && chargers.map((charger) => (
                      <MenuItem key={charger.ChargerId} value={charger.ChargerId.toString()} style={{ minWidth: '100%' }}>
                        {charger.ChargerName} (#{charger.ChargerId})
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </StyledFormControl>
              </Grid>
              
              {/* Status Filter - Fixed to prevent text overlap */}
              <Grid item xs={12}>
                <StyledFormControl>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <StyledSelect
                    labelId="status-filter-label"
                    name="status"
                    value={filters.status}
                    label="Status"
                    onChange={handleFilterChange}
                    MenuProps={menuProps}
                    sx={{
                      ...inputStyle,
                      // This ensures text doesn't overlap with the dropdown arrow
                      '& .MuiSelect-select': {
                        paddingRight: '32px !important', // Force enough padding for dropdown icon
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                    displayEmpty
                  >
                    <MenuItem value="" style={{ minWidth: '100%' }}>All Statuses</MenuItem>
                    <MenuItem value="Started" style={{ minWidth: '100%' }}>Started</MenuItem>
                    <MenuItem value="Completed" style={{ minWidth: '100%' }}>Completed</MenuItem>
                    <MenuItem value="Failed" style={{ minWidth: '100%' }}>Failed</MenuItem>
                  </StyledSelect>
                </StyledFormControl>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Second Column */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              {/* Driver ID Filter */}
              <Grid item xs={12}>
                <StyledTextField
                  name="driverId"
                  label="Driver ID"
                  value={filters.driverId}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    style: inputStyle
                  }}
                  fullWidth
                />
              </Grid>
              
              {/* RFID Card Filter */}
              <Grid item xs={12}>
                <StyledTextField
                  name="rfidCard"
                  label="RFID Card"
                  value={filters.rfidCard}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCardIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    style: inputStyle
                  }}
                  fullWidth
                />
              </Grid>
              
              {/* Start Date Filter */}
              <Grid item xs={12}>
                <StyledTextField
                  label="Start Date From"
                  type="datetime-local"
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
                    style: inputStyle
                  }}
                  fullWidth
                />
              </Grid>
              
              {/* End Date Filter */}
              <Grid item xs={12}>
                <StyledTextField
                  label="Start Date To"
                  type="datetime-local"
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
                    style: inputStyle
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
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