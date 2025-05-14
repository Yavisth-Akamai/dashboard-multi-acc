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
  backgroundColor: theme.palette.background.default,
  fontWeight: 600,
  color: theme.palette.text.primary,
  fontSize: '0.85rem',
  padding: '10px 12px',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledCell = styled(TableCell)(({ theme }) => ({
  fontSize: '0.825rem',
  padding: '8px 12px',
  color: theme.palette.text.primary,
}));

const ProfileChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  borderRadius: '6px',
  padding: '0 6px',
  color: theme.palette.getContrastText(theme.palette.background.paper),
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
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        Cluster Metrics
      </Typography>
      <Table size="small">
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
          {data?.length > 0 ? (
            data.map((row, index) => (
              <TableRow key={index}>
                <StyledCell>{row.name}</StyledCell>
                <StyledCell>{row.region}</StyledCell>
                <StyledCell>
                  <Tooltip title={generateTooltip(row)} arrow enterDelay={500}>
                  <ProfileChip
                    label={row.profileType || 'D'}
                    size="small"
                    sx={(theme) => {
                      const bg = profileColorMap[row.profileType || 'D'] || profileColorMap.D;
                      return {
                        backgroundColor: bg,
                        color: theme.palette.getContrastText(bg),
                      };
                    }}
                  />
                  </Tooltip>
                </StyledCell>
                <StyledCell>{row.totalNodeCount || 'N/A'}</StyledCell>
                <StyledCell>{row.status}</StyledCell>
                <StyledCell>{new Date(row.created).toLocaleString()}</StyledCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <StyledCell colSpan={6} align="center">
                No clusters found.
              </StyledCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClusterMetricsTable;
