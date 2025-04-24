import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Container, Typography, Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import SearchFilterWindow from '../components/SearchFilterWindow';
import AccountExpandableTable from '../components/AccountExpandableTable';
import { fetchApprovedComparison, fetchClusterMetrics, fetchUnapprovedRegions, fetchAccounts } from '../services/api';
import { AccountData, Account } from '../types/account.types';

interface DashboardProps {
  darkMode: boolean;
  onDarkModeChange: () => void;
}

const POLLING_INTERVAL = 30000;
const MAX_RETRIES = 3;

const Dashboard: React.FC<DashboardProps> = ({ darkMode, onDarkModeChange }) => {
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [accountsData, setAccountsData] = useState<AccountData[]>([]);
  const [retryCount, setRetryCount] = useState<number>(0);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    
    setError(null);
    
    try {
      const accountsData = await fetchAccounts();
      const accountNames = (accountsData as Account[]).map((account: Account) => account.name);
      
      const [comparisonsByAccount, metricsData, unapprovedData] = await Promise.all([
        fetchApprovedComparison(),
        fetchClusterMetrics(),
        fetchUnapprovedRegions()
      ]);
      
      const processedAccounts = accountNames.map((accountName: string) => {
        const accountComparison = comparisonsByAccount.find(
          comp => comp.accountName === accountName
        )?.regions || [];
        
        const totalCapacity = accountComparison.reduce((sum, region) => {
          return sum + Object.values(region.total_capacity).reduce((a, b) => a + b, 0);
        }, 0);
        
        return {
          name: accountName,
          ha: true, 
          totalCapacity,
          created: new Date().toISOString(), 
          approvedRegions: accountComparison,
          unapprovedRegions: unapprovedData.find(data => data.accountName === accountName)?.unapprovedRegions || [],
          clusterMetrics: metricsData.find(data => data.accountName === accountName)?.clusters || []
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
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchData(isInitialLoad), 2000 * (retryCount + 1));
      } else {
        setError('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      if (isInitialLoad) {
        setInitialLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []); 


  useEffect(() => {
    fetchData(true);
    
    const intervalId = setInterval(() => {
      fetchData(false);
    }, POLLING_INTERVAL);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  const filteredAccountsData = useMemo(() => {
    return accountsData.filter(acc => selectedAccounts.includes(acc.name));
  }, [accountsData, selectedAccounts]);

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 3 }}>
      <Container maxWidth="lg">
        {/* Error message */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        
        <SearchFilterWindow
          darkMode={darkMode}
          onDarkModeChange={onDarkModeChange}
          selectedAccounts={selectedAccounts}
          onAccountsChange={setSelectedAccounts}
          accounts={accounts}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontSize: '1.5rem',
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            Linode Regions Dashboard
          </Typography>
          
          {/* Last updated indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {refreshing && <CircularProgress size={20} sx={{ mr: 1 }} />}
            <Typography variant="body2" color="text.secondary">
              {lastUpdated 
                ? `Last updated: ${lastUpdated.toLocaleTimeString()}` 
                : 'Updating...'}
            </Typography>
          </Box>
        </Box>
        
        <AccountExpandableTable accounts={filteredAccountsData} />
      </Container>
    </Box>
  );
};

export default Dashboard;