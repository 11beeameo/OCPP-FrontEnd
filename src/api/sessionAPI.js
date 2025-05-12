// src/api/sessionAPI.js
import apiClient from './client';

const SESSIONS_URL = '/api/v1/sessions/';

// Get all sessions with optional filters
export const getSessions = async (params) => {
  try {
    const response = await apiClient.get(SESSIONS_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

// Get sessions for a specific charger
export const getChargerSessions = async (chargerId, companyId, siteId, limit = 100, offset = 0) => {
  try {
    const response = await apiClient.get(`${SESSIONS_URL}charger/${chargerId}`, {
      params: { 
        company_id: companyId, 
        site_id: siteId,
        limit,
        offset
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching sessions for charger ${chargerId}:`, error);
    throw error;
  }
};

// Get sessions for a specific site
export const getSiteSessions = async (siteId, companyId, startDate, endDate, limit = 100, offset = 0) => {
  try {
    const params = { 
      company_id: companyId,
      limit,
      offset
    };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await apiClient.get(`${SESSIONS_URL}site/${siteId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching sessions for site ${siteId}:`, error);
    throw error;
  }
};

// Get a single session by ID
export const getSession = async (sessionId) => {
  try {
    const response = await apiClient.get(`${SESSIONS_URL}${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching session ${sessionId}:`, error);
    throw error;
  }
};

// Get session meter values
export const getSessionMeterValues = async (sessionId) => {
  try {
    const response = await apiClient.get(`${SESSIONS_URL}${sessionId}/meter_values`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching meter values for session ${sessionId}:`, error);
    throw error;
  }
};

// Get session statistics
export const getSessionStats = async (sessionId) => {
  try {
    const response = await apiClient.get(`${SESSIONS_URL}${sessionId}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for session ${sessionId}:`, error);
    throw error;
  }
};