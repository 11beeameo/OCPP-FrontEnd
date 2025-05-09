// src/components/ApiTest.js
import React, { useState } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';
import { getCompanies } from '../api/companyAPI';

const ApiTest = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Test with correct URL including enabled parameter
  const testCorrectApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://13.50.116.232:9000/api/v1/companies/?enabled=true');
      console.log('Correct API Response:', response);
      setData(response.data);
    } catch (err) {
      console.error('API Error:', err);
      setError(`Error: ${err.message}`);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Test with our API service
  const testApiService = async () => {
    setLoading(true);
    setError(null);
    try {
      const companies = await getCompanies(true);
      console.log('API Service Response:', companies);
      setData(companies);
    } catch (err) {
      console.error('API Service Error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>API Test</Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item>
          <Button 
            variant="contained" 
            onClick={testCorrectApi} 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Test Direct API Call'}
          </Button>
        </Grid>
        
        <Grid item>
          <Button 
            variant="contained" 
            onClick={testApiService} 
            disabled={loading}
            color="secondary"
          >
            {loading ? <CircularProgress size={24} /> : 'Test API Service'}
          </Button>
        </Grid>
      </Grid>
      
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      )}
      
      {data && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">API Response:</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default ApiTest;