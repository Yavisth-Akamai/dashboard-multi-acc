// dash-fe/src/components/ApprovedRegionsTable.tsx

import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, styled } from '@mui/material';
import { ApprovedRegion, ProfileCapacity, ClusterMetric } from '../types/account.types';
import { PROFILE_COLOR_MAPPINGS } from '../config/profile-colors.config';

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  fontWeight: 'bold',
  '&.category-header': {
    borderLeft: `2px solid ${theme.palette.divider}`,
    borderRight: `2px solid ${theme.palette.divider}`,
  },
  '&.sub-header': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '&.region-header': {
    borderRight: `2px solid ${theme.palette.divider}`,
  }
}));

const StyledBodyCell = styled(TableCell)<{ islastincategory?: string }>(({ theme, islastincategory }) => ({
  ...(islastincategory === 'true' && {
    borderRight: `3px solid rgba(0, 0, 0, 0.3)`,
  }),
}));

const StyledBodyRow = styled(TableRow)<{ isexceeded?: string }>(({ theme, isexceeded }) => ({
  ...(isexceeded === 'true' && {
    backgroundColor: '#ffebee',
  }),
}));

interface ApprovedRegionsTableProps {
  data: ApprovedRegion[];
  clusterMetrics: ClusterMetric[];
}

interface AggregatedRegionData {
  region: string;
  year: string;
  total_capacity: ProfileCapacity;
  current_capacity: ProfileCapacity;
  available: ProfileCapacity;
  isExceeded: boolean;
}

const aggregateRegionData = (approvedRegions: ApprovedRegion[], clusterMetrics: ClusterMetric[]): AggregatedRegionData[] => {
  const regionMap = new Map<string, AggregatedRegionData>();

  approvedRegions.forEach(row => {
    const key = row.region;
    
    if (regionMap.has(key)) {
      const existing = regionMap.get(key)!;

      Object.keys(row.total_capacity).forEach(profile => {
        const p = profile as keyof ProfileCapacity;
        existing.total_capacity[p] += row.total_capacity[p];
      });
    } else {
      regionMap.set(key, {
        region: row.region,
        year: row.year,
        total_capacity: { ...row.total_capacity },
        current_capacity: { D: 0, DHA: 0, S: 0, M: 0, L: 0 },
        available: { D: 0, DHA: 0, S: 0, M: 0, L: 0 },
        isExceeded: false
      });
    }
  });

  regionMap.forEach((data, region) => {
    const regionClusters = clusterMetrics.filter(cluster => 
      cluster.region.toLowerCase().includes(region.toLowerCase())
    );
    
    regionClusters.forEach(cluster => {
      if (cluster.profileType) {
        data.current_capacity[cluster.profileType]++;
      } else {
        data.current_capacity.D++;
      }
    });
    
    const isExceeded = Object.keys(data.total_capacity).some(profile => {
      const p = profile as keyof ProfileCapacity;
      return data.current_capacity[p] > data.total_capacity[p];
    });
    
    data.isExceeded = isExceeded;
    
    Object.keys(data.total_capacity).forEach(profile => {
      const p = profile as keyof ProfileCapacity;
      data.available[p] = Math.max(0, data.total_capacity[p] - data.current_capacity[p]);
    });
  });

  return Array.from(regionMap.values());
};

const ApprovedRegionsTable: React.FC<ApprovedRegionsTableProps> = ({ data, clusterMetrics }) => {
  const profiles = ['D', 'DHA', 'S', 'M', 'L'] as const;
  const aggregatedData = aggregateRegionData(data, clusterMetrics);

  const profileColorMap = PROFILE_COLOR_MAPPINGS.reduce((map, item) => {
    map[item.profile] = item.color;
    return map;
  }, {} as Record<string, string>);

  return (
    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
      <Typography variant="h6" sx={{ padding: 1 }}>Approved Region Capacity</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <StyledHeaderCell rowSpan={2} className="region-header">Region</StyledHeaderCell>
            <StyledHeaderCell rowSpan={2} className="region-header">Year</StyledHeaderCell>
            <StyledHeaderCell align="center" colSpan={5} className="category-header">
              Total Cluster
            </StyledHeaderCell>
            <StyledHeaderCell align="center" colSpan={5} className="category-header">
              Current Cluster
            </StyledHeaderCell>
            <StyledHeaderCell align="center" colSpan={5} className="category-header">
              Available
            </StyledHeaderCell>
          </TableRow>
          <TableRow>
            {[...Array(3)].map((_, i) => (
              profiles.map(profile => (
                <StyledHeaderCell
                  key={`${i}-${profile}`}
                  align="right"
                  className="sub-header"
                  sx={{
                    backgroundColor: profileColorMap[profile] || '#ffffff',
                    color: 'rgba(0, 0, 0, 0.87)'
                  }}
                >
                  {profile}
                </StyledHeaderCell>
              ))
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
        {aggregatedData.map((row, rowIndex) => (
            <StyledBodyRow 
              key={`${row.region}-${rowIndex}`}
              isexceeded={row.isExceeded.toString()}
            >
              <TableCell>{row.region}</TableCell>
              <TableCell>{row.year}</TableCell>
              {profiles.map((profile) => (
                <StyledBodyCell 
                  key={`total-${profile}`} 
                  align="right"
                  islastincategory={profile === 'L' ? 'true' : 'false'}
                  sx={{
                    backgroundColor: row.total_capacity[profile] > 0 ? 
                      `${profileColorMap[profile]}40` : 
                      'inherit'
                  }}
                >
                  {row.total_capacity[profile]}
                </StyledBodyCell>
              ))}
              {profiles.map((profile) => (
                <StyledBodyCell 
                  key={`current-${profile}`} 
                  align="right"
                  islastincategory={profile === 'L' ? 'true' : 'false'}
                  sx={{
                    backgroundColor: row.current_capacity[profile] > 0 ? 
                      `${profileColorMap[profile]}40` : 
                      'inherit',
                    fontWeight: row.current_capacity[profile] > row.total_capacity[profile] ? 
                      'bold' : 'normal',
                    color: row.current_capacity[profile] > row.total_capacity[profile] ? 
                      'error.main' : 'text.primary'
                  }}
                >
                  {row.current_capacity[profile]}
                </StyledBodyCell>
              ))}
              {profiles.map((profile) => (
                <StyledBodyCell 
                  key={`available-${profile}`} 
                  align="right"
                  islastincategory={profile === 'L' ? 'true' : 'false'}
                  sx={{
                    backgroundColor: row.available[profile] > 0 ? 
                      `${profileColorMap[profile]}40` : 
                      'inherit'
                  }}
                >
                  {row.available[profile]}
                </StyledBodyCell>
              ))}
            </StyledBodyRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApprovedRegionsTable;