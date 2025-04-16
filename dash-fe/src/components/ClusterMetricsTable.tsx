import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Chip, styled,
  Tooltip 
} from '@mui/material';
import { ClusterMetric } from '../types/account.types';
import { PROFILE_COLOR_MAPPINGS } from '../config/profile-colors.config';
import { 
  getMemorySizeFromInstanceType, 
  getDescriptionFromInstanceType 
} from '../utils/instance-type-mapping';

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  fontWeight: 'bold',
}));

const ProfileChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
}));

interface ClusterMetricsTableProps {
  data: ClusterMetric[];
}

const ClusterMetricsTable: React.FC<ClusterMetricsTableProps> = ({ data }) => {
  const profileColorMap = PROFILE_COLOR_MAPPINGS.reduce((map, item) => {
    map[item.profile] = item.color;
    return map;
  }, {} as Record<string, string>);

  const generateTooltip = (cluster: ClusterMetric) => {
    if (!cluster.pools || cluster.pools.length === 0) {
      return 'No pool information available';
    }
    
    return (
      <div>
        <div><strong>Profile Type:</strong> {cluster.profileType}</div>
        <div><strong>Total Nodes:</strong> {cluster.totalNodeCount}</div>
        <div><strong>Pools:</strong></div>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {cluster.pools.map((pool, index) => {
            const memorySize = getMemorySizeFromInstanceType(pool.type);
            const description = getDescriptionFromInstanceType(pool.type);
            
            return (
              <li key={index}>
                Type: {pool.type} ({description}, {memorySize}GB), Count: {pool.count}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
      <Typography variant="h6" sx={{ padding: 1 }}>Cluster Metrics</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <StyledHeaderCell>Cluster Name</StyledHeaderCell>
            <StyledHeaderCell>Region</StyledHeaderCell>
            <StyledHeaderCell>Profile Type</StyledHeaderCell>
            <StyledHeaderCell>Node Count</StyledHeaderCell>
            <StyledHeaderCell>Status</StyledHeaderCell>
            <StyledHeaderCell>Created</StyledHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.region}</TableCell>
                <TableCell>
                  <Tooltip 
                    title={generateTooltip(row)} 
                    arrow
                    placement="right"
                  >
                    <ProfileChip
                      label={row.profileType || 'D'}
                      size="small"
                      style={{ 
                        backgroundColor: profileColorMap[row.profileType || 'D'] || profileColorMap.D,
                        color: 'rgba(0, 0, 0, 0.87)'
                      }}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>{row.totalNodeCount || 'N/A'}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{new Date(row.created).toLocaleString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">No clusters found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClusterMetricsTable;