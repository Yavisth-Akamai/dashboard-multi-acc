import axios from 'axios';
import {
  Account,
  AccountUnapprovedRegions,
  ClusterMetricResponse,
  AccountComparisonData,
  AuthResponse,  
} from '../types/account.types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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

export const fetchClusterMetrics = async (): Promise<ClusterMetricResponse[]> => {
  try {
    const response = await apiClient.get('/regions/metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching cluster metrics:', error);
    return [];
  }
};

export const fetchApprovedComparison = async (): Promise<AccountComparisonData[]> => {
  try {
    console.log('Attempting to fetch from:', `${API_BASE_URL}/regions/comparison`);
    const response = await apiClient.get('/regions/comparison');
    console.log('Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching approved comparison:', error);
    throw error;
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


export const login = async (
  User: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', { User, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};


export const changePassword = async (
  User: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', {
      User,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const signup = async (User: string, password: string): Promise<void> => {
  try {
    await apiClient.post('/auth/signup', { User, password });
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};
