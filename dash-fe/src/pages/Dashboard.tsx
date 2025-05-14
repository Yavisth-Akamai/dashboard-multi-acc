import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import SearchFilterWindow from '../components/SearchFilterWindow';
import AccountExpandableTable from '../components/AccountExpandableTable';
import {
  fetchApprovedComparison,
  fetchClusterMetrics,
  fetchUnapprovedRegions,
  fetchAccounts,
} from '../services/api';
import { AccountData, Account } from '../types/account.types';
import LogoutButton from '../components/LogoutButton';

interface DashboardProps {
  darkMode: boolean;
  onDarkModeChange: () => void;
}

const POLLING_INTERVAL = 30000;
const MAX_RETRIES = 3;

const Dashboard: React.FC<DashboardProps> = ({ darkMode, onDarkModeChange }) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [accountsData, setAccountsData] = useState<AccountData[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    isInitialLoad ? setInitialLoading(true) : setRefreshing(true);
    setError(null);

    try {
      const accountsData = await fetchAccounts();
      const accountNames = (accountsData as Account[]).map((account) => account.name);

      const [comparisonsByAccount, metricsData, unapprovedData] = await Promise.all([
        fetchApprovedComparison(),
        fetchClusterMetrics(),
        fetchUnapprovedRegions(),
      ]);

      const processedAccounts = accountNames.map((accountName) => {
        const accountComparison =
          comparisonsByAccount.find((comp) => comp.accountName === accountName)?.regions || [];

        const totalCapacity = accountComparison.reduce((sum, region) => {
          return sum + Object.values(region.total_capacity).reduce((a, b) => a + b, 0);
        }, 0);

        return {
          name: accountName,
          ha: true,
          totalCapacity,
          created: new Date().toISOString(),
          approvedRegions: accountComparison,
          unapprovedRegions:
            unapprovedData.find((data) => data.accountName === accountName)?.unapprovedRegions || [],
          clusterMetrics: metricsData.find((data) => data.accountName === accountName)?.clusters || [],
        };
      });

      setAccounts(accountNames);
      setAccountsData(processedAccounts);
      if (selectedAccounts.length === 0 && accountNames.length > 0) {
        setSelectedAccounts(accountNames);
      }

      setLastUpdated(new Date());
      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching data:', error);

      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
        setTimeout(() => fetchData(isInitialLoad), 2000 * (retryCount + 1));
      } else {
        setError('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      isInitialLoad ? setInitialLoading(false) : setRefreshing(false);
    }
  }, [retryCount, selectedAccounts]);

  useEffect(() => {
    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const filteredAccountsData = useMemo(() => {
    return accountsData.filter((acc) => selectedAccounts.includes(acc.name));
  }, [accountsData, selectedAccounts]);

  if (initialLoading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Error Notification */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight={600}>
          Linode Regions Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel control={<Switch checked={darkMode} onChange={onDarkModeChange} />} label="Dark Mode" />
          <LogoutButton />
        </Box>
      </Box>

      {/* Filters and Last Updated */}
      <SearchFilterWindow
        selectedAccounts={selectedAccounts}
        onAccountsChange={setSelectedAccounts}
        accounts={accounts}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: -1.5, mb: 3 }}>
        {refreshing && <CircularProgress size={18} sx={{ mr: 1 }} />}
        <Typography variant="caption" color="text.secondary">
          {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Updating...'}
        </Typography>
      </Box>

      {/* Data Table */}
      <AccountExpandableTable accounts={filteredAccountsData} />
    </Container>
  );
};

export default Dashboard;
