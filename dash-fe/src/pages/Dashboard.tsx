import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box } from '@mui/material';
import SearchFilterWindow from '../components/SearchFilterWindow';
import AccountExpandableTable from '../components/AccountExpandableTable';
import { fetchApprovedComparison, fetchClusterMetrics, fetchUnapprovedRegions, fetchAccounts } from '../services/api';
import { AccountData, ComparisonData, Account, AccountUnapprovedRegions} from '../types/account.types';

interface DashboardProps {
  darkMode: boolean;
  onDarkModeChange: () => void;
}
const POLLING_INTERVAL = 3000;

const Dashboard: React.FC<DashboardProps> = ({ darkMode, onDarkModeChange }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [accountsData, setAccountsData] = useState<AccountData[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const accountsData = await fetchAccounts();
      const accountNames = (accountsData as Account[]).map((account: Account) => account.name);
      
      console.log('Fetching data...'); // Debug log
  
      const [comparisonsByAccount, metricsData, unapprovedData] = await Promise.all([
        fetchApprovedComparison(),
        fetchClusterMetrics(),
        fetchUnapprovedRegions()
      ]);
  
      console.log('Comparison data:', comparisonsByAccount); // Debug log
  
      const processedAccounts = accountNames.map((accountName: string) => {
        const accountComparison = comparisonsByAccount.find(
          comp => comp.accountName === accountName
        )?.regions || [];
  
        console.log(`Processing account ${accountName}:`, accountComparison); // Debug log
  
        return {
          name: accountName,
          ha: true,
          totalCapacity: accountComparison.reduce((sum, region) => {
            return sum + Object.values(region.total_capacity).reduce((a, b) => a + b, 0);
          }, 0),
          created: new Date().toISOString(),
          approvedRegions: accountComparison,
          unapprovedRegions: unapprovedData.find(data => data.accountName === accountName)?.unapprovedRegions || [],
          clusterMetrics: metricsData.find(data => data.accountName === accountName)?.clusters || []
        };
      });
  
      console.log('Processed accounts:', processedAccounts); // Debug log
  
      setAccounts(accountNames);
      setAccountsData(processedAccounts);
      if (!selectedAccounts.length) {
        setSelectedAccounts(accountNames);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedAccounts.length]);

  useEffect(() => {

    fetchData();


    const intervalId = setInterval(() => {
      fetchData();
    }, POLLING_INTERVAL);


    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);


  if (loading && !accountsData.length) {
    return (
      <Box sx={{ pt: 3, textAlign: 'center' }}>
        <Typography>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 3 }}>
      <Container maxWidth="lg">
        <SearchFilterWindow
          darkMode={darkMode}
          onDarkModeChange={onDarkModeChange}
          
          selectedAccounts={selectedAccounts}
          onAccountsChange={setSelectedAccounts}
          accounts={accounts}
        />
        
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontSize: '1.5rem',
            fontWeight: 500,
            color: 'text.primary',
            mb: 3
          }}
        >
          Linode Regions Dashboard
        </Typography>
        
        <AccountExpandableTable 
          accounts={accountsData.filter(acc => selectedAccounts.includes(acc.name))}
        />
      </Container>
    </Box>
  );
};

export default Dashboard;