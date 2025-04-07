import axios from 'axios';
import { Account, AccountUnapprovedRegions, ComparisonData, ClusterMetricResponse } from '../types/account.types';



const API_BASE_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const fetchAccounts = async (): Promise<Account[]> => {
  try {
    const response = await apiClient.get('/accounts');
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
};

export const fetchApprovedComparison = async (): Promise<ComparisonData[]> => {
  try {
    const response = await apiClient.get('/regions/comparison');
    return response.data;
  } catch (error) {
    console.error('Error fetching approved comparison:', error);
    return [];
  }
};

export const fetchUnapprovedRegions = async (): Promise<AccountUnapprovedRegions[]> => {
  try {
    const response = await apiClient.get('/regions/unapproved');
    return response.data;
  } catch (error) {
    console.error('Error fetching unapproved regions:', error);
    return [];
  }
};

export const fetchClusterMetrics = async (): Promise<ClusterMetricResponse[]> => {
  try {
    const response = await apiClient.get('/regions/metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching cluster metrics:', error);
    return [];
  }
};