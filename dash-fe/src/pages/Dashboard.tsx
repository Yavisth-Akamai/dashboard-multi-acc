
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import SearchFilterWindow from '../components/SearchFilterWindow';
import AccountExpandableTable from '../components/AccountExpandableTable';
import { fetchApprovedComparison, fetchClusterMetrics, fetchUnapprovedRegions, fetchAccounts } from '../services/api';
import { AccountData, ComparisonData, Account, AccountUnapprovedRegions } from '../types/account.types';

interface DashboardProps {
  darkMode: boolean;
  onDarkModeChange: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, onDarkModeChange }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [accountsData, setAccountsData] = useState<AccountData[]>([]);

// src/pages/Dashboard.tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      // First fetch accounts
      const accountsData = await fetchAccounts();
      const accountNames = (accountsData as Account[]).map((account: Account) => account.name);
      setAccounts(accountNames);
      
      const [compData, metricsData, unapprovedData] = await Promise.all([
        fetchApprovedComparison(),
        fetchClusterMetrics(),
        fetchUnapprovedRegions()
      ]);

      // Process data for accounts
      const processedAccounts = accountNames.map((accountName: string) => {
        // Find unapproved regions for this account
        const accountUnapproved = (unapprovedData as AccountUnapprovedRegions[])
          .find(data => data.accountName === accountName)
          ?.unapprovedRegions || [];

        // Find cluster metrics for this account
        const accountMetrics = metricsData.find(
          data => data.accountName === accountName
        )?.clusters || [];

        const totalCapacity = compData.reduce((sum: number, r: ComparisonData) => 
          sum + r.total_capacity, 0);

        return {
          name: accountName,
          ha: true,
          totalCapacity,
          created: new Date().toISOString(),
          approvedRegions: compData,
          unapprovedRegions: accountUnapproved,
          clusterMetrics: accountMetrics  // Now using account-specific clusters
        };
      });

      setAccountsData(processedAccounts);
      setSelectedAccounts(accountNames);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

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