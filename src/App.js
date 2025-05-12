// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline } from '@mui/material';
import Layout from './components/layout/Layout';

// Company pages
import CompaniesPage from './pages/company/CompaniesPage';
import CompanyDetailsPage from './pages/company/CompanyDetailsPage';
import CompanyCreatePage from './pages/company/CompanyCreatePage';
import CompanyEditPage from './pages/company/CompanyEditPage';

// Site pages
import SitesPage from './pages/site/SitesPage';
import SiteDetailsPage from './pages/site/SiteDetailsPage';
import SiteCreatePage from './pages/site/SiteCreatePage';
import SiteStandaloneCreatePage from './pages/site/SiteStandAloneCreatePage';
import SiteEditPage from './pages/site/SiteEditPage';

// Charger pages
import ChargersPage from './pages/charger/ChargersPage';
import ChargerDetailsPage from './pages/charger/ChargerDetailsPage';
import ChargerCreatePage from './pages/charger/ChargerCreatePage';
import ChargerEditPage from './pages/charger/ChargerEditPage';

// Session pages
import SessionsPage from './pages/session/SessionsPage';
import SessionDetailsPage from './pages/session/SessionDetailsPage';

// Charge Point pages
import ChargePointsPage from './pages/chargepoint/ChargePointsPage';

import ApiTest from './components/ApiTest'; // Keep for testing

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<CompaniesPage />} />
            
            {/* Company routes */}
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/new" element={<CompanyCreatePage />} />
            <Route path="/companies/:id" element={<CompanyDetailsPage />} />
            <Route path="/companies/:id/edit" element={<CompanyEditPage />} />
            <Route path="/companies/:companyId/sites/new" element={<SiteCreatePage />} />
            
            {/* Site routes */}
            <Route path="/sites" element={<SitesPage />} />
            <Route path="/sites/new" element={<SiteStandaloneCreatePage />} />
            <Route path="/sites/:id" element={<SiteDetailsPage />} />
            <Route path="/sites/:id/edit" element={<SiteEditPage />} />
            
            {/* Charger routes */}
            <Route path="/chargers" element={<ChargersPage />} />
            <Route path="/sites/:siteId/chargers/new" element={<ChargerCreatePage />} />
            <Route path="/chargers/:id" element={<ChargerDetailsPage />} />
            <Route path="/chargers/:id/edit" element={<ChargerEditPage />} />
            
            {/* Session routes */}
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/sessions/:id" element={<SessionDetailsPage />} />
            
            {/* Charge Point routes */}
            <Route path="/charge-points" element={<ChargePointsPage />} />
            
            {/* Test route */}
            <Route path="/test" element={<ApiTest />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

