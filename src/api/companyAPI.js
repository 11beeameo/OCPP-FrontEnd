// src/api/companyApi.js
import apiClient from './client';

const COMPANIES_URL = '/api/v1/companies/';  // Note the trailing slash

// Get all companies - updated with correct query parameter format
export const getCompanies = async (enabled = true) => {
  try {
    // We now explicitly set enabled=true as the default
    const params = { enabled: enabled };
    console.log('Requesting companies with params:', params);
    
    const response = await apiClient.get(COMPANIES_URL, { params });
    console.log('Companies response:', response);
    return response.data;
  } catch (error) {
    console.error('Get companies error:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    throw error;
  }
};

// Get a single company by ID - updated with trailing slash
export const getCompany = async (id) => {
  try {
    const response = await apiClient.get(`${COMPANIES_URL}${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting company ${id}:`, error);
    throw error;
  }
};

// Create a new company - updated with trailing slash
export const createCompany = async (company) => {
  try {
    const response = await apiClient.post(COMPANIES_URL, company);
    return response.data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

// Update a company - updated with trailing slash
export const updateCompany = async (id, company) => {
  try {
    const response = await apiClient.put(`${COMPANIES_URL}${id}`, company);
    return response.data;
  } catch (error) {
    console.error(`Error updating company ${id}:`, error);
    throw error;
  }
};

// Delete a company - updated with trailing slash
export const deleteCompany = async (id) => {
  try {
    await apiClient.delete(`${COMPANIES_URL}${id}`);
  } catch (error) {
    console.error(`Error deleting company ${id}:`, error);
    throw error;
  }
};