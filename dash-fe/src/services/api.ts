import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const fetchApprovedComparison = async () => {
  try {
    const response = await apiClient.get('/regions/comparison');
    console.log('Approved Comparison Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching approved comparison:', error);
    return [];
  }
};

export const fetchClusterMetrics = async () => {
  try {
    const response = await apiClient.get('/regions/metrics');
    console.log('Cluster Metrics Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching cluster metrics:', error);
    return [];
  }
};