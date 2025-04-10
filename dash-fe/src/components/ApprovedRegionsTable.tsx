import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  styled,
} from '@mui/material';
import { ApprovedRegion } from '../types/account.types';

// Styled components for the column groups
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

const ApprovedRegionsTable: React.FC<ApprovedRegionsTableProps> = ({ data }) => {
  const profiles = ['dev', 'devHA', 'small', 'medium', 'large'];

  return (
    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
      <Typography variant="h6" sx={{ padding: 1 }}>Approved Region Capacity</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <StyledHeaderCell rowSpan={2} className="region-header">Region</StyledHeaderCell>
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
            {/* Total Capacity Subcolumns */}
            {profiles.map((profile, index) => (
              <StyledHeaderCell 
                key={`total-${profile}`} 
                align="right"
                className={`sub-header ${index === 0 ? 'first-in-category' : ''} ${index === profiles.length - 1 ? 'last-in-category' : ''}`}
              >
                {profile}
              </StyledHeaderCell>
            ))}
            {/* Current Capacity Subcolumns */}
            {profiles.map((profile, index) => (
              <StyledHeaderCell 
                key={`current-${profile}`} 
                align="right"
                className={`sub-header ${index === 0 ? 'first-in-category' : ''} ${index === profiles.length - 1 ? 'last-in-category' : ''}`}
              >
                {profile}
              </StyledHeaderCell>
            ))}
            {/* Available Subcolumns */}
            {profiles.map((profile, index) => (
              <StyledHeaderCell 
                key={`available-${profile}`} 
                align="right"
                className={`sub-header ${index === 0 ? 'first-in-category' : ''} ${index === profiles.length - 1 ? 'last-in-category' : ''}`}
              >
                {profile}
              </StyledHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.region}
              sx={{
                backgroundColor: row.status === 'EXCEEDED' ? '#f07575' : 'inherit'
              }}
            >
              <StyledBodyCell className="region-cell">{row.region}</StyledBodyCell>
              {/* Total Capacity Values */}
              {profiles.map((profile, index) => (
                <StyledBodyCell 
                  key={`total-${profile}`} 
                  align="right"
                  className={`${index === 0 ? 'first-in-category' : ''} ${index === profiles.length - 1 ? 'last-in-category' : ''}`}
                >
                  {row.total_capacity[profile as keyof typeof row.total_capacity]}
                </StyledBodyCell>
              ))}
              {/* Current Capacity Values */}
              {profiles.map((profile, index) => (
                <StyledBodyCell 
                  key={`current-${profile}`} 
                  align="right"
                  className={`${index === 0 ? 'first-in-category' : ''} ${index === profiles.length - 1 ? 'last-in-category' : ''}`}
                >
                  {row.current_capacity[profile as keyof typeof row.current_capacity]}
                </StyledBodyCell>
              ))}
              {/* Available Values */}
              {profiles.map((profile, index) => (
                <StyledBodyCell 
                  key={`available-${profile}`} 
                  align="right"
                  className={`${index === 0 ? 'first-in-category' : ''} ${index === profiles.length - 1 ? 'last-in-category' : ''}`}
                >
                  {row.available[profile as keyof typeof row.available]}
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