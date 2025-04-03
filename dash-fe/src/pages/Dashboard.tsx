import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid'; // Use stable Grid component
import ApprovedRegionsTable, { ApprovedRegion } from '../components/ApprovedRegionsTable';
import UnapprovedRegionsTable, { UnapprovedRegion } from '../components/UnapprovedRegionsTable';
import ClusterMetricsTable, { ClusterMetric } from '../components/ClusterMetricsTable';
import { fetchApprovedComparison, fetchClusterMetrics } from '../services/api';

const Dashboard: React.FC = () => {
  const [approvedRegions, setApprovedRegions] = useState<ApprovedRegion[]>([]);
  const [unapprovedRegions, setUnapprovedRegions] = useState<UnapprovedRegion[]>([]);
  const [clusterMetrics, setClusterMetrics] = useState<ClusterMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

useEffect(() => {
    const fetchData = async () => {
      try {
        // Log before fetching
        console.log('Fetching data...');
        
        const [compData, metricsData] = await Promise.all([
          fetchApprovedComparison(),
          fetchClusterMetrics()
        ]);

        // Log the received data
        console.log('Comparison Data:', compData);
        console.log('Metrics Data:', metricsData);

        setApprovedRegions(compData);
        setClusterMetrics(metricsData);

        // Calculate unapproved regions
        const approvedSet = new Set(compData.map((reg: ApprovedRegion) => reg.region));
        const regionCounts: Record<string, number> = {};
        
        metricsData.forEach((cluster: ClusterMetric) => {
          if (!approvedSet.has(cluster.region)) {
            regionCounts[cluster.region] = (regionCounts[cluster.region] || 0) + 1;
          }
        });

        const unapprovedData = Object.entries(regionCounts).map(
          ([region, capacity]) => ({ region, capacity })
        );

        // Log calculated unapproved regions
        console.log('Unapproved Regions:', unapprovedData);
        
        setUnapprovedRegions(unapprovedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Linode Regions Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid size={12}>
          <ApprovedRegionsTable data={approvedRegions} />
        </Grid>
        <Grid size={12}>
          <UnapprovedRegionsTable data={unapprovedRegions} />
        </Grid>
        <Grid size={12}>
          <ClusterMetricsTable data={clusterMetrics} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;