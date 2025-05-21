import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  styled
} from '@mui/material';
import { ApprovedRegion, ProfileCapacity, ClusterMetric } from '../types/account.types';
import { PROFILE_COLOR_MAPPINGS } from '../config/profile-colors.config';
import { formatRegionName } from '../utils/formatters';
import type { Theme } from '@mui/material/styles';

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  fontWeight: 600,
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  borderBottom: `2px solid ${theme.palette.divider}`,
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

const StyledBodyRow = styled(TableRow)<{ isexceeded?: string }>(({ theme }) => ({
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledBodyCell = styled(TableCell)<{ islastincategory?: string }>(({ theme, islastincategory }) => ({
  padding: theme.spacing(1.25),
  borderBottom: `1px solid ${theme.palette.divider}`,
  ...(islastincategory === 'true' && {
    borderRight: `2px solid ${theme.palette.divider}`,
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
  const aggregatedData = aggregateRegionData(data, clusterMetrics)
    .sort((a, b) => Number(b.year) - Number(a.year));

  const profileColorMap = PROFILE_COLOR_MAPPINGS.reduce((map, item) => {
    map[item.profile] = item.color;
    return map;
  }, {} as Record<string, string>);

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        mb: 3,
        maxHeight: 600,
        overflow: 'auto',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        Approved Region Capacity
      </Typography>
      <Table>
        <TableHead sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: theme => theme.palette.background.paper }}>
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
  {[...Array(3)].map((_, groupIndex) =>
    profiles.map(profile => (
      <StyledHeaderCell
        key={`${groupIndex}-${profile}`}
        align="center"
        className="sub-header"
        sx={{
          width: 64,
          backgroundColor: `${profileColorMap[profile]}70`,
          color: (theme: Theme) =>
            theme.palette.getContrastText(profileColorMap[profile]),
          fontWeight: 500,
          fontSize: '0.75rem',
          borderRight: profile === 'L'
            ? (theme: Theme) => `2px solid ${theme.palette.divider}`
            : undefined,
        }}
      >
        {profile}
      </StyledHeaderCell>
    ))
  )}
</TableRow>

        </TableHead>
        <TableBody>
          {aggregatedData.map((row, index) => (
            <StyledBodyRow
              key={`${row.region}-${row.year}-${index}`}
              isexceeded={row.isExceeded.toString()}
              sx={{
                backgroundColor: index % 2 === 0
                  ? theme => `${theme.palette.action.hover}20`
                  : 'inherit',
              }}
            >
              <StyledBodyCell
                component="th"
                scope="row"
                sx={{
                  position: 'relative',
                  pl: 2.5,
                  '&::before': row.isExceeded
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 4,
                        bottom: 4,
                        width: '4px',
                        borderRadius: '4px',
                        backgroundColor: theme => theme.palette.error.main,
                      }
                    : undefined,
                }}
              >
                {formatRegionName(row.region)}
              </StyledBodyCell>
              <TableCell>{row.year}</TableCell>
              {profiles.map(profile => (
                <StyledBodyCell
                  key={`total-${index}-${profile}`}
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
              {profiles.map(profile => {
                const exceeded = row.current_capacity[profile] > row.total_capacity[profile];
                return (
                  <StyledBodyCell
                    key={`current-${index}-${profile}`}
                    align="right"
                    islastincategory={profile === 'L' ? 'true' : 'false'}
                    sx={{
                      backgroundColor: row.current_capacity[profile] > 0
                        ? `${profileColorMap[profile]}40`
                        : 'inherit',
                      fontWeight: exceeded ? 'bold' : 'normal',
                      color: exceeded ? 'error.main' : 'text.primary'
                    }}
                  >
                    {row.current_capacity[profile]}
                  </StyledBodyCell>
                );
              })}
              {profiles.map(profile => (
                <StyledBodyCell
                  key={`available-${index}-${profile}`}
                  align="right"
                  islastincategory={profile === 'L' ? 'true' : 'false'}
                  sx={{
                    backgroundColor: row.available[profile] > 0
                      ? `${profileColorMap[profile]}40`
                      : 'inherit',
                    color: row.available[profile] > 0
                      ? theme => theme.palette.success.main
                      : 'inherit',
                    fontWeight: row.available[profile] > 0 ? 500 : 'normal'
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
