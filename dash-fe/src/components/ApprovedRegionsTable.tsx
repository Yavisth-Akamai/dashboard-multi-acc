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

const profiles = ['D', 'DHA', 'S', 'M', 'L'] as const;

const aggregateRegionData = (approvedRegions: ApprovedRegion[], clusterMetrics: ClusterMetric[]): AggregatedRegionData[] => {
  const regionYearMap = new Map<string, AggregatedRegionData>();

  approvedRegions.forEach(row => {
    const key = `${row.region}_${row.year}`;

    if (!regionYearMap.has(key)) {
      regionYearMap.set(key, {
        region: row.region,
        year: row.year,
        total_capacity: { D: 0, DHA: 0, S: 0, M: 0, L: 0 },
        current_capacity: { D: 0, DHA: 0, S: 0, M: 0, L: 0 },
        available: { D: 0, DHA: 0, S: 0, M: 0, L: 0 },
        isExceeded: false,
      });
    }

    const existing = regionYearMap.get(key)!;
    for (const profile of profiles) {
      existing.total_capacity[profile] += row.total_capacity[profile];
    }
  });

  regionYearMap.forEach(data => {
    const regionClusters = clusterMetrics.filter(cluster => 
      cluster.region.toLowerCase().includes(data.region.toLowerCase())
    );

    for (const cluster of regionClusters) {
      if (cluster.profileType) {
        data.current_capacity[cluster.profileType]++;
      } else {
        data.current_capacity.D++;
      }
    }

    data.isExceeded = profiles.some(profile => 
      data.current_capacity[profile] > data.total_capacity[profile]
    );

    for (const profile of profiles) {
      data.available[profile] = Math.max(0, data.total_capacity[profile] - data.current_capacity[profile]);
    }
  });

  return Array.from(regionYearMap.values());
};

const ApprovedRegionsTable: React.FC<ApprovedRegionsTableProps> = ({ data, clusterMetrics }) => {
  const profiles = ['D', 'DHA', 'S', 'M', 'L'] as const;
  const aggregatedData = aggregateRegionData(data, clusterMetrics)
    .sort((a, b) => Number(b.year) - Number(a.year)); // Sort by year descending

  const profileColorMap = PROFILE_COLOR_MAPPINGS.reduce((map, item) => {
    map[item.profile] = item.color;
    return map;
  }, {} as Record<string, string>);

  let lastYear: string | null = null;

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
          {aggregatedData.map((row, rowIndex) => {
            const isYearChanged = row.year !== lastYear;
            lastYear = row.year;

            return (
              <StyledBodyRow
                key={`${row.region}-${row.year}-${rowIndex}`}
                isexceeded={row.isExceeded.toString()}
                sx={{
                  backgroundColor: isYearChanged ? 'rgba(0, 0, 255, 0.03)' : 'inherit',
                  borderTop: isYearChanged ? '2px solid rgba(0,0,0,0.2)' : undefined,
                }}
              >
                <TableCell>{row.region}</TableCell>
                <TableCell>{row.year}</TableCell>

                {profiles.map(profile => (
                  <StyledBodyCell
                    key={`total-${profile}`}
                    align="right"
                    islastincategory={profile === 'L' ? 'true' : 'false'}
                    sx={{
                      backgroundColor: row.total_capacity[profile] > 0
                        ? `${profileColorMap[profile]}40`
                        : 'inherit'
                    }}
                  >
                    {row.total_capacity[profile]}
                  </StyledBodyCell>
                ))}

                {profiles.map(profile => (
                  <StyledBodyCell
                    key={`current-${profile}`}
                    align="right"
                    islastincategory={profile === 'L' ? 'true' : 'false'}
                    sx={{
                      backgroundColor: row.current_capacity[profile] > 0
                        ? `${profileColorMap[profile]}40`
                        : 'inherit',
                      fontWeight: row.current_capacity[profile] > row.total_capacity[profile] 
                        ? 'bold' : 'normal',
                      color: row.current_capacity[profile] > row.total_capacity[profile] 
                        ? 'error.main' : 'text.primary'
                    }}
                  >
                    {row.current_capacity[profile]}
                  </StyledBodyCell>
                ))}

                {profiles.map(profile => (
                  <StyledBodyCell
                    key={`available-${profile}`}
                    align="right"
                    islastincategory={profile === 'L' ? 'true' : 'false'}
                    sx={{
                      backgroundColor: row.available[profile] > 0
                        ? `${profileColorMap[profile]}40`
                        : 'inherit'
                    }}
                  >
                    {row.available[profile]}
                  </StyledBodyCell>
                ))}
              </StyledBodyRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApprovedRegionsTable;