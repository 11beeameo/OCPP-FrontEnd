// src/api/siteApi.js
import apiClient from './client';

const SITES_URL = '/api/v1/sites/';
const COMPANY_SITES_URL = '/api/v1/companies/';

// Get all sites
export const getSites = async (companyId, enabled) => {
    try {
        const params = {};
        if (companyId !== undefined) params.company_id = companyId;
        if (enabled !== undefined) params.enabled = enabled;

        const response = await apiClient.get(SITES_URL, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching sites:', error);
        throw error;
    }
};

// Get all sites for a specific company
export const getCompanySites = async (companyId, enabled) => {
    try {
        const params = enabled !== undefined ? { enabled } : {};
        const response = await apiClient.get(`${COMPANY_SITES_URL}${companyId}/sites`, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching sites for company ${companyId}:`, error);
        throw error;
    }
};

// Get a single site by ID
export const getSite = async (siteId) => {
    try {
        const response = await apiClient.get(`${SITES_URL}${siteId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching site ${siteId}:`, error);
        throw error;
    }
};


// Add this function to the existing siteApi.js
export const createSite = async (siteData) => {
    try {
        const response = await apiClient.post(SITES_URL, siteData);
        return response.data;
    } catch (error) {
        console.error('Error creating site:', error);
        throw error;
    }
};

// Add this function to the existing siteApi.js
export const deleteSite = async (siteId) => {
    try {
        await apiClient.delete(`${SITES_URL}${siteId}`);
    } catch (error) {
        console.error(`Error deleting site ${siteId}:`, error);
        throw error;
    }
};

// Add this function to the existing siteApi.js
export const updateSite = async (siteId, siteData) => {
    try {
        const response = await apiClient.put(`${SITES_URL}${siteId}`, siteData);
        return response.data;
    } catch (error) {
        console.error(`Error updating site ${siteId}:`, error);
        throw error;
    }
};

// Additional methods for creating, updating, and deleting sites would go here