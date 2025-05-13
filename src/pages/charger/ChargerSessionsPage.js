// src/pages/charger/ChargerSessionsPage.js
import React from 'react';
import { useParams, useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Breadcrumbs,
  Link,
  Alert,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EvStationIcon from '@mui/icons-material/EvStation';
import { getCharger } from '../../api/chargerAPI';
import { getCompany } from '../../api/companyAPI';
import { getSite } from '../../api/siteAPI';
import { getChargerSessions } from '../../api/sessionAPI';
import SessionList from '../../components/session/SessionList';
import LoadingSpinner from '../../components/common/Loadingspinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const ChargerSessionsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const chargerId = parseInt(id);
  const companyId = parseInt(searchParams.get('company') || '0');
  const siteId = parseInt(searchParams.get('site') || '0');

  // Fetch charger details
  const { data: charger, isLoading: isLoadingCharger, isError: isChargerError, error: chargerError } = useQuery({
    queryKey: ['charger', chargerId, companyId, siteId],
    queryFn: () => getCharger(chargerId, companyId, siteId),
    enabled: !!chargerId && !!companyId && !!siteId
  });

  // Fetch company details
  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => getCompany(companyId),
    enabled: !!companyId && !isLoadingCharger && !!charger
  });

  // Fetch site details
  const { data: site } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => getSite(siteId),
    enabled: !!siteId && !isLoadingCharger && !!charger
  });

  // Fetch all sessions for this charger without pagination limit
  const { data: sessions, isLoading: isLoadingSessions, isError: isSessionsError, error: sessionsError } = useQuery({
    queryKey: ['all-charger-sessions', chargerId, companyId, siteId],
    queryFn: () => getChargerSessions(chargerId, companyId, siteId, 1000, 0), // Fetch up to 1000 sessions
    enabled: !!chargerId && !!companyId && !!siteId
  });

  if (isLoadingCharger || isLoadingSessions) {
    return <LoadingSpinner />;
  }

  if (isChargerError || !charger) {
    return <ErrorAlert message={chargerError instanceof Error ? chargerError.message : 'Error loading charger'} />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Breadcrumbs aria-label="breadcrumb" mb={1}>
            <Link component={RouterLink} to="/" color="inherit">
              Dashboard
            </Link>
            {company && (
              <Link 
                component={RouterLink} 
                to={`/companies/${companyId}`} 
                color="inherit"
              >
                {company.CompanyName}
              </Link>
            )}
            {site && (
              <Link 
                component={RouterLink} 
                to={`/sites/${siteId}`} 
                color="inherit"
              >
                {site.SiteName}
              </Link>
            )}
            <Link 
              component={RouterLink} 
              to={`/chargers/${chargerId}?company=${companyId}&site=${siteId}`} 
              color="inherit"
            >
              {charger.ChargerName}
            </Link>
            <Typography color="textPrimary">All Sessions</Typography>
          </Breadcrumbs>
          <Typography variant="h4">
            <EvStationIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            All Sessions for {charger.ChargerName}
          </Typography>
        </div>
        
        <Button 
          component={RouterLink} 
          to={`/chargers/${chargerId}?company=${companyId}&site=${siteId}`} 
          startIcon={<ArrowBackIcon />}
        >
          Back to Charger
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6">Session Information</Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {sessions && sessions.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No charging sessions found for this charger.
          </Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing all charging sessions for charger {charger.ChargerName}
              {sessions && ` (${sessions.length} ${sessions.length === 1 ? 'session' : 'sessions'} found)`}
            </Typography>
            
            <SessionList 
              sessions={sessions}
              isLoading={isLoadingSessions}
              isError={isSessionsError}
              error={sessionsError}
              showCharger={false}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ChargerSessionsPage;