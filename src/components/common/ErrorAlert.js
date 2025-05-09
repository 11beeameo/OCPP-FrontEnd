// src/components/common/ErrorAlert.js
import React from 'react';
import { Alert, Box } from '@mui/material';

const ErrorAlert = ({ message }) => {
  return (
    <Box mb={3}>
      <Alert severity="error">
        {message || 'An error occurred'}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;