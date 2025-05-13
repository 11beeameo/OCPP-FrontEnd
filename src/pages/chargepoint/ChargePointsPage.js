// src/pages/chargepoint/ChargePointsPage.js
import React, { useState, useEffect } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { getChargePoints } from '../../api/websocketAPI';
import { getSiteChargers } from '../../api/chargerAPI';
import { getCompanies } from '../../api/companyAPI';
import { getCompanySites } from '../../api/siteAPI';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const ChargePointsPage = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');

  // Fetch connected charge points
  const { 
    data: chargePointsData, 
    isLoading: isLoadingChargePoints, 
    error: chargePointsError,
    refetch: refetchChargePoints,
    isError: isChargePointsError
  } = useQuery({
    queryKey: ['charge-points'],
    queryFn: getChargePoints,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch all companies
  const {
    data: companies,
    isLoading: isLoadingCompanies,
    isError: isCompaniesError,
    error: companiesError
  } = useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies()
  });

  // Set default selected company when companies are loaded
  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].CompanyId.toString());
    }
  }, [companies, selectedCompanyId]);

  // Fetch sites for selected company
  const {
    data: sites,
    isLoading: isLoadingSites,
    isError: isSitesError,
    error: sitesError
  } = useQuery({
    queryKey: ['company-sites', selectedCompanyId],
    queryFn: () => selectedCompanyId ? 
      getCompanySites(parseInt(selectedCompanyId)) : 
      Promise.resolve([]),
    enabled: !!selectedCompanyId
  });

  // Set default selected site when sites are loaded
  useEffect(() => {
    if (sites && sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(sites[0].SiteId.toString());
    } else if (!sites || sites.length === 0) {
      setSelectedSiteId('');
    }
  }, [sites, selectedSiteId]);

  // Fetch chargers for selected company/site
  const {
    data: chargers,
    isLoading: isLoadingChargers,
    isError: isChargersError,
    error: chargersError
  } = useQuery({
    queryKey: ['site-chargers', selectedCompanyId, selectedSiteId],
    queryFn: () => {
      if (selectedCompanyId && selectedSiteId) {
        return getSiteChargers(
          parseInt(selectedSiteId),
          parseInt(selectedCompanyId)
        );
      }
      return [];
    },
    enabled: !!selectedCompanyId && !!selectedSiteId
  });

  const handleRefresh = () => {
    refetchChargePoints();
  };

  const handleCompanyChange = (event) => {
    setSelectedCompanyId(event.target.value);
    setSelectedSiteId(''); // Reset site when company changes
  };

  const handleSiteChange = (event) => {
    setSelectedSiteId(event.target.value);
  };

  // Check for loading states
  if (isLoadingChargePoints || isLoadingCompanies) {
    return <LoadingSpinner />;
  }

  // Check for critical error states
  if (isChargePointsError) {
    return <ErrorAlert message={`Error fetching charge points: ${chargePointsError.message}`} />;
  }

  if (isCompaniesError) {
    return <ErrorAlert message={`Error fetching companies: ${companiesError.message}`} />;
  }

  const connectedChargePoints = chargePointsData?.charge_points || [];
  
  // Create a map of charge point IDs to charger details
  const chargerMap = chargers?.reduce((map, charger) => {
    map[charger.ChargerName] = charger;
    return map;
  }, {}) || {};

  // Find the currently connected charge points that match the selected site's chargers
  const filteredConnectedChargePoints = connectedChargePoints.filter(chargePointId => {
    const charger = chargerMap[chargePointId];
    return charger !== undefined;
  });

  // Find the current company and site names
  const currentCompany = companies?.find(c => c.CompanyId.toString() === selectedCompanyId);
  const currentSite = sites?.find(s => s.SiteId.toString() === selectedSiteId);
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Connected Charge Points</Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="company-filter-label">Company</InputLabel>
              <Select
                labelId="company-filter-label"
                value={selectedCompanyId}
                label="Company"
                onChange={handleCompanyChange}
                startAdornment={
                  <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }
              >
                {companies && companies.map((company) => (
                  <MenuItem key={company.CompanyId} value={company.CompanyId.toString()}>
                    {company.CompanyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!selectedCompanyId || isLoadingSites || !sites?.length}>
              <InputLabel id="site-filter-label">Site</InputLabel>
              <Select
                labelId="site-filter-label"
                value={selectedSiteId}
                label="Site"
                onChange={handleSiteChange}
                startAdornment={
                  <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }
              >
                {sites && sites.map((site) => (
                  <MenuItem key={site.SiteId} value={site.SiteId.toString()}>
                    {site.SiteName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <SignalWifi4BarIcon color="success" />
          <Typography variant="h6">
            Currently Connected: {chargePointsData?.count || 0} total 
            {selectedSiteId && ` (${filteredConnectedChargePoints.length} in ${currentSite?.SiteName || 'selected site'})`}
          </Typography>
        </Box>

        {connectedChargePoints.length === 0 ? (
          <Typography color="text.secondary">
            No charge points are currently connected to the OCPP server.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Charge Point ID</TableCell>
                  <TableCell>Charger Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Site</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connectedChargePoints.map((chargePointId) => {
                  const charger = chargerMap[chargePointId];
                  // Skip chargers that don't match the filter if a site is selected
                  if (selectedSiteId && !charger) return null;
                  
                  return (
                    <TableRow key={chargePointId}>
                      <TableCell>{chargePointId}</TableCell>
                      <TableCell>
                        {charger ? charger.ChargerName : chargePointId}
                      </TableCell>
                      <TableCell>
                        {charger ? (currentCompany?.CompanyName || `Company ${charger.ChargerCompanyId}`) : '-'}
                      </TableCell>
                      <TableCell>
                        {charger ? (currentSite?.SiteName || `Site ${charger.ChargerSiteId}`) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<SignalWifi4BarIcon />}
                          label="Connected"
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {charger && (
                          <IconButton
                            component={RouterLink}
                            to={`/chargers/${charger.ChargerId}?company=${charger.ChargerCompanyId}&site=${charger.ChargerSiteId}`}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Disconnected Chargers */}
      {chargers && selectedSiteId && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Disconnected Chargers in {currentSite?.SiteName || 'Selected Site'}
          </Typography>
          
          {chargers.filter(charger => !connectedChargePoints.includes(charger.ChargerName)).length === 0 ? (
            <Typography color="text.secondary">
              All chargers in this site are currently connected.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Charger ID</TableCell>
                    <TableCell>Charger Name</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Site</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chargers
                    .filter(charger => !connectedChargePoints.includes(charger.ChargerName))
                    .map((charger) => (
                      <TableRow key={charger.ChargerId}>
                        <TableCell>{charger.ChargerId}</TableCell>
                        <TableCell>{charger.ChargerName}</TableCell>
                        <TableCell>{currentCompany?.CompanyName || `Company ${charger.ChargerCompanyId}`}</TableCell>
                        <TableCell>{currentSite?.SiteName || `Site ${charger.ChargerSiteId}`}</TableCell>
                        <TableCell>
                          <Chip
                            label="Disconnected"
                            color="default"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            component={RouterLink}
                            to={`/chargers/${charger.ChargerId}?company=${charger.ChargerCompanyId}&site=${charger.ChargerSiteId}`}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ChargePointsPage;