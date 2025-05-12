// src/api/websocketAPI.js
import apiClient from './client';

const WEBSOCKET_URL = '/api/v1/cs/';

// Get all connected charge points
export const getChargePoints = async () => {
  try {
    const response = await apiClient.get(`${WEBSOCKET_URL}charge_points`);
    return response.data;
  } catch (error) {
    console.error('Error fetching charge points:', error);
    throw error;
  }
};

// Reset a charge point
export const resetChargePoint = async (chargePointId, resetType = 'Soft') => {
  try {
    const response = await apiClient.post(
      `${WEBSOCKET_URL}charge_points/${chargePointId}/reset`,
      null,
      { params: { type: resetType } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error resetting charge point ${chargePointId}:`, error);
    throw error;
  }
};

// Start a remote transaction
export const remoteStartTransaction = async (chargePointId, idTag, connectorId = null) => {
  try {
    const params = { id_tag: idTag };
    if (connectorId !== null) {
      params.connector_id = connectorId;
    }
    
    const response = await apiClient.post(
      `${WEBSOCKET_URL}charge_points/${chargePointId}/remote_start`,
      null,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`Error starting transaction on charge point ${chargePointId}:`, error);
    throw error;
  }
};

// Stop a remote transaction
export const remoteStopTransaction = async (chargePointId, transactionId) => {
  try {
    const response = await apiClient.post(
      `${WEBSOCKET_URL}charge_points/${chargePointId}/remote_stop`,
      null,
      { params: { transaction_id: transactionId } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error stopping transaction ${transactionId} on charge point ${chargePointId}:`, error);
    throw error;
  }
};