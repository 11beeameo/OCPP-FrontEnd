// src/components/charger/ChargePointControl.js
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  resetChargePoint,
  remoteStartTransaction,
  remoteStopTransaction
} from '../../api/websocketAPI';

const ChargePointControl = ({ chargePointId, isOnline, sessions }) => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetType, setResetType] = useState('Soft');
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [idTag, setIdTag] = useState('');
  const [connectorId, setConnectorId] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get active sessions for stopping
  const activeSessions = sessions?.filter(
    session => session.ChargerSessionStatus === 'Started'
  ) || [];

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: () => resetChargePoint(chargePointId, resetType),
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: 'Reset command sent successfully',
        severity: 'success'
      });
      setResetDialogOpen(false);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to reset charge point: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // Start transaction mutation
  const startMutation = useMutation({
    mutationFn: () => remoteStartTransaction(
      chargePointId, 
      idTag, 
      connectorId ? parseInt(connectorId) : null
    ),
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: 'Start transaction command sent successfully',
        severity: 'success'
      });
      setStartDialogOpen(false);
      setIdTag('');
      setConnectorId('');
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to start transaction: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // Stop transaction mutation
  const stopMutation = useMutation({
    mutationFn: () => remoteStopTransaction(chargePointId, parseInt(selectedTransactionId)),
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: 'Stop transaction command sent successfully',
        severity: 'success'
      });
      setStopDialogOpen(false);
      setSelectedTransactionId('');
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to stop transaction: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const handleReset = () => {
    resetMutation.mutate();
  };

  const handleStartTransaction = () => {
    if (!idTag) {
      setSnackbar({
        open: true,
        message: 'Please enter an ID Tag',
        severity: 'error'
      });
      return;
    }
    startMutation.mutate();
  };

  const handleStopTransaction = () => {
    if (!selectedTransactionId) {
      setSnackbar({
        open: true,
        message: 'Please select a transaction to stop',
        severity: 'error'
      });
      return;
    }
    stopMutation.mutate();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <PowerSettingsNewIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Charge Point Control</Typography>
      </Box>

      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This charge point is currently offline. Control commands may not work.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            startIcon={<RestartAltIcon />}
            onClick={() => setResetDialogOpen(true)}
            disabled={!isOnline}
          >
            Reset Charge Point
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            startIcon={<PlayArrowIcon />}
            onClick={() => setStartDialogOpen(true)}
            disabled={!isOnline}
          >
            Start Transaction
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            startIcon={<StopIcon />}
            onClick={() => setStopDialogOpen(true)}
            disabled={!isOnline || activeSessions.length === 0}
          >
            Stop Transaction
          </Button>
        </Grid>
      </Grid>

      {/* Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Charge Point</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select the type of reset to perform on the charge point.
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel id="reset-type-label">Reset Type</InputLabel>
            <Select
              labelId="reset-type-label"
              value={resetType}
              label="Reset Type"
              onChange={(e) => setResetType(e.target.value)}
            >
              <MenuItem value="Soft">Soft Reset</MenuItem>
              <MenuItem value="Hard">Hard Reset</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReset} 
            color="warning" 
            disabled={resetMutation.isPending}
            startIcon={resetMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Start Transaction Dialog */}
      <Dialog open={startDialogOpen} onClose={() => setStartDialogOpen(false)}>
        <DialogTitle>Start Remote Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the ID tag and optionally select a connector to start a charging session.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="ID Tag (RFID)"
            fullWidth
            value={idTag}
            onChange={(e) => setIdTag(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Connector ID (Optional)"
            fullWidth
            type="number"
            value={connectorId}
            onChange={(e) => setConnectorId(e.target.value)}
            helperText="Leave empty to use any available connector"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStartTransaction} 
            color="success"
            disabled={startMutation.isPending || !idTag}
            startIcon={startMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            Start
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stop Transaction Dialog */}
      <Dialog open={stopDialogOpen} onClose={() => setStopDialogOpen(false)}>
        <DialogTitle>Stop Remote Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select an active transaction to stop.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="transaction-select-label">Active Transaction</InputLabel>
            <Select
              labelId="transaction-select-label"
              value={selectedTransactionId}
              label="Active Transaction"
              onChange={(e) => setSelectedTransactionId(e.target.value)}
            >
              {activeSessions.map((session) => (
                <MenuItem key={session.ChargeSessionId} value={session.ChargeSessionId}>
                  Transaction #{session.ChargeSessionId} - Connector {session.ChargerSessionConnectorId}
                  {session.ChargerSessionRFIDCard && ` - RFID: ${session.ChargerSessionRFIDCard}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStopDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStopTransaction} 
            color="error"
            disabled={stopMutation.isPending || !selectedTransactionId}
            startIcon={stopMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            Stop
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ChargePointControl;