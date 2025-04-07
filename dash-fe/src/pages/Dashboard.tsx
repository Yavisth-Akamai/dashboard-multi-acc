// import React, { useEffect, useState } from 'react';
// import { Container, Typography, CircularProgress } from '@mui/material';
// import Grid from '@mui/material/Grid'; // Use stable Grid component
// import ApprovedRegionsTable, { ApprovedRegion } from '../components/ApprovedRegionsTable';
// import UnapprovedRegionsTable, { UnapprovedRegion } from '../components/UnapprovedRegionsTable';
// import ClusterMetricsTable, { ClusterMetric } from '../components/ClusterMetricsTable';
// import { fetchApprovedComparison, fetchClusterMetrics } from '../services/api';

// const Dashboard: React.FC = () => {
//   const [approvedRegions, setApprovedRegions] = useState<ApprovedRegion[]>([]);
//   const [unapprovedRegions, setUnapprovedRegions] = useState<UnapprovedRegion[]>([]);
//   const [clusterMetrics, setClusterMetrics] = useState<ClusterMetric[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);



// useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [compData, metricsData] = await Promise.all([
//           fetchApprovedComparison(),
//           fetchClusterMetrics()
//         ]);

//         setApprovedRegions(compData);
//         setClusterMetrics(metricsData);

//         // Helper function to normalize region names
//         const normalizeRegionName = (region: string): string => {
//           return region.split(',')[0].trim(); // Takes "Mumbai, IN" -> "Mumbai"
//         };

//         // Create a map of approved regions and their capacities
//         const approvedCapacities = compData.reduce((acc: Record<string, number>, region: ApprovedRegion) => {
//           acc[region.region] = region.total_capacity;
//           return acc;
//         }, {} as Record<string, number>);

//         // Count clusters per normalized region
//         const regionCounts: Record<string, number> = {};
//         metricsData.forEach((cluster: ClusterMetric) => {
//           const normalizedRegion = normalizeRegionName(cluster.region);
//           regionCounts[normalizedRegion] = (regionCounts[normalizedRegion] || 0) + 1;
//         });

//         // Calculate unapproved (excess) capacity
//         const unapprovedData = Object.entries(regionCounts)
//           .map(([region, count]) => {
//             const approvedCapacity = approvedCapacities[region] || 0;
//             const excessCapacity = count - approvedCapacity;
//             return {
//               region,
//               capacity: excessCapacity
//             };
//           })
//           .filter(item => item.capacity > 0);

//         setUnapprovedRegions(unapprovedData);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <Container
//         sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
//       >
//         <CircularProgress />
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         Linode Regions Dashboard
//       </Typography>
//       <Grid container spacing={3}>
//         <Grid size={12}>
//           <ApprovedRegionsTable data={approvedRegions} />
//         </Grid>
//         <Grid size={12}>
//           <UnapprovedRegionsTable data={unapprovedRegions} />
//         </Grid>
//         <Grid size={12}>
//           <ClusterMetricsTable data={clusterMetrics} />
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import ApprovedRegionsTable, { ApprovedRegion } from '../components/ApprovedRegionsTable';
import UnapprovedRegionsTable, { UnapprovedRegion } from '../components/UnapprovedRegionsTable';
import ClusterMetricsTable, { ClusterMetric } from '../components/ClusterMetricsTable';
import SearchFilterWindow from '../components/SearchFilterWindow';
import AccountExpandableTable from '../components/AccountExpandableTable';
import { fetchApprovedComparison, fetchClusterMetrics } from '../services/api';
import { AccountData, ComparisonData } from '../types/account.types';

interface DashboardProps {
  darkMode: boolean;
  onDarkModeChange: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, onDarkModeChange }) => {
  const [approvedRegions, setApprovedRegions] = useState<ApprovedRegion[]>([]);
  const [unapprovedRegions, setUnapprovedRegions] = useState<UnapprovedRegion[]>([]);
  const [clusterMetrics, setClusterMetrics] = useState<ClusterMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts] = useState<string[]>(['Account One', 'Account Two']);
  const [accountsData, setAccountsData] = useState<AccountData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compData, metricsData] = await Promise.all([
          fetchApprovedComparison(),
          fetchClusterMetrics()
        ]);

        // Process data for accounts
        const processedAccounts = accounts.map(accountName => {
          // Calculate total capacity from comparison data
          const totalCapacity = compData.reduce((sum: number, r: ComparisonData) => 
            sum + r.total_capacity, 0);

          return {
            name: accountName,
            ha: true,
            totalCapacity,
            created: new Date().toISOString(),
            approvedRegions: compData,
            unapprovedRegions: [], // Empty array for now
            clusterMetrics: metricsData
          };
        });

        setAccountsData(processedAccounts);
        setSelectedAccounts(accounts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accounts]);

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