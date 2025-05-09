// src/api/chargerApi.js
import apiClient from './client';

const CHARGERS_URL = '/api/v1/chargers/';
const SITE_CHARGERS_URL = '/api/v1/sites/';

// Get all chargers
export const getChargers = async (params) => {
  try {
    const response = await apiClient.get(CHARGERS_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching chargers:', error);
    throw error;
  }
};

// Get all chargers for a specific site
export const getSiteChargers = async (siteId, companyId, enabled) => {
  try {
    const params = { company_id: companyId };
    if (enabled !== undefined) params.enabled = enabled;
    
    const response = await apiClient.get(`${SITE_CHARGERS_URL}${siteId}/chargers`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching chargers for site ${siteId}:`, error);
    throw error;
  }
};

// Get a single charger by ID
export const getCharger = async (chargerId, companyId, siteId) => {
  try {
    const response = await apiClient.get(`${CHARGERS_URL}${chargerId}`, {
      params: { company_id: companyId, site_id: siteId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching charger ${chargerId}:`, error);
    throw error;
  }
};

// Delete a charger
export const deleteCharger = async (chargerId, companyId, siteId) => {
  try {
    await apiClient.delete(`${CHARGERS_URL}${chargerId}`, {
      params: { company_id: companyId, site_id: siteId }
    });
  } catch (error) {
    console.error(`Error deleting charger ${chargerId}:`, error);
    throw error;
  }
};

// Update src/api/chargerApi.js to add the createCharger function

// Add this function to the existing chargerApi.js
export const createCharger = async (chargerData) => {
  try {
    const response = await apiClient.post(CHARGERS_URL, chargerData);
    return response.data;
  } catch (error) {
    console.error('Error creating charger:', error);
    throw error;
  }
};

// Update src/api/chargerApi.js to add the updateCharger function

// Add this function to the existing chargerApi.js
export const updateCharger = async (chargerId, companyId, siteId, chargerData) => {
  try {
    const response = await apiClient.put(`${CHARGERS_URL}${chargerId}`, chargerData, {
      params: { company_id: companyId, site_id: siteId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating charger ${chargerId}:`, error);
    throw error;
  }
};