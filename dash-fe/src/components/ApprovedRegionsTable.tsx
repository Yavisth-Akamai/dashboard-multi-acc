import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  styled,
} from '@mui/material';
import { ApprovedRegion, ProfileCapacity } from '../types/account.types';

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  '&.category-header': {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 'bold',
    borderLeft: `2px solid ${theme.palette.divider}`,
    borderRight: `2px solid ${theme.palette.divider}`,
  },
  '&.sub-header': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '&.first-in-category': {
    borderLeft: `2px solid ${theme.palette.divider}`,
  },
  '&.last-in-category': {
    borderRight: `2px solid ${theme.palette.divider}`,
  },
  '&.region-header': {
    borderRight: `2px solid ${theme.palette.divider}`,
  }
}));

const StyledBodyCell = styled(TableCell)(({ theme }) => ({
  '&.first-in-category': {
    borderLeft: `2px solid ${theme.palette.divider}`,
  },
  '&.last-in-category': {
    borderRight: `2px solid ${theme.palette.divider}`,
  },
  '&.region-cell': {
    borderRight: `2px solid ${theme.palette.divider}`,
  }
}));

interface ApprovedRegionsTableProps {
  data: ApprovedRegion[];
}
interface AggregatedRegionData {
  region: string;
  year: string;
  clusterCount: number;
  total_capacity: ProfileCapacity;
  current_capacity: ProfileCapacity;
  available: ProfileCapacity;
}

const aggregateRegionData = (data: ApprovedRegion[]): AggregatedRegionData[] => {
  const regionMap = new Map<string, AggregatedRegionData>();

  data.forEach(row => {
    const key = row.region;
    
    if (regionMap.has(key)) {
      // If region exists, update the capacities and increment cluster count
      const existing = regionMap.get(key)!;
      existing.clusterCount += 1;
      
      // Sum up the capacities
      Object.keys(row.total_capacity).forEach(profile => {
        const p = profile as keyof ProfileCapacity;
        existing.total_capacity[p] += row.total_capacity[p];
        existing.current_capacity[p] += row.current_capacity[p];
        existing.available[p] += row.available[p];
      });
    } else {
      // If region doesn't exist, create new entry
      regionMap.set(key, {
        region: row.region,
        year: row.year,
        clusterCount: 1,
        total_capacity: { ...row.total_capacity },
        current_capacity: { ...row.current_capacity },
        available: { ...row.available }
      });
    }
  });

  return Array.from(regionMap.values());
};
const ApprovedRegionsTable: React.FC<ApprovedRegionsTableProps> = ({ data }) => {
  const profiles = ['D', 'DHA', 'S', 'M', 'L'] as const;
  const aggregatedData = aggregateRegionData(data);

  return (
    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
      <Typography variant="h6" sx={{ padding: 1 }}>Approved Region Capacity</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <StyledHeaderCell rowSpan={2} className="region-header">Region</StyledHeaderCell>
            <StyledHeaderCell rowSpan={2} className="region-header">Year</StyledHeaderCell>
            <StyledHeaderCell rowSpan={2} className="region-header">Clusters</StyledHeaderCell>
            <StyledHeaderCell align="center" colSpan={5} className="category-header">
              Total Capacity
            </StyledHeaderCell>
            <StyledHeaderCell align="center" colSpan={5} className="category-header">
              Current Capacity
            </StyledHeaderCell>
            <StyledHeaderCell align="center" colSpan={5} className="category-header">
              Available
            </StyledHeaderCell>
          </TableRow>
          <TableRow>
            {profiles.map((profile, index) => (
              <StyledHeaderCell
                key={`total-${profile}`}
                align="right"
                className={`sub-header ${index === 0 ? 'first-in-category' : ''} ${
                  index === profiles.length - 1 ? 'last-in-category' : ''
                }`}
              >
                {profile}
              </StyledHeaderCell>
            ))}
            {profiles.map((profile, index) => (
              <StyledHeaderCell
                key={`current-${profile}`}
                align="right"
                className={`sub-header ${index === 0 ? 'first-in-category' : ''} ${
                  index === profiles.length - 1 ? 'last-in-category' : ''
                }`}
              >
                {profile}
              </StyledHeaderCell>
            ))}
            {profiles.map((profile, index) => (
              <StyledHeaderCell
                key={`available-${profile}`}
                align="right"
                className={`sub-header ${index === 0 ? 'first-in-category' : ''} ${
                  index === profiles.length - 1 ? 'last-in-category' : ''
                }`}
              >
                {profile}
              </StyledHeaderCell>
            ))}
          </TableRow>
          </TableHead>
        <TableBody>
          {aggregatedData.map((row, rowIndex) => (
            <TableRow key={`${row.region}-${rowIndex}`}>
              <StyledBodyCell>{row.region}</StyledBodyCell>
              <StyledBodyCell>{row.year}</StyledBodyCell>
              <StyledBodyCell align="center">{row.clusterCount}</StyledBodyCell>
              {profiles.map((profile) => (
                <StyledBodyCell key={`total-${profile}`} align="right">
                  {row.total_capacity[profile]}
                </StyledBodyCell>
              ))}
              {profiles.map((profile) => (
                <StyledBodyCell key={`current-${profile}`} align="right">
                  {row.current_capacity[profile]}
                </StyledBodyCell>
              ))}
              {profiles.map((profile) => (
                <StyledBodyCell key={`available-${profile}`} align="right">
                  {row.available[profile]}
                </StyledBodyCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApprovedRegionsTable;