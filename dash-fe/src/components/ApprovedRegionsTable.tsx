import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
} from '@mui/material';

export interface ApprovedRegion {
  region: string;
  total_capacity: number;
  current_capacity: number;
  available: number;
  status: 'EXCEEDED' | 'AT_CAPACITY' | 'WITHIN_LIMIT';
}

interface ApprovedRegionsTableProps {
  data: ApprovedRegion[];
}

const ApprovedRegionsTable: React.FC<ApprovedRegionsTableProps> = ({ data }) => {
  return (
    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
      <Typography variant="h6" sx={{ padding: 1 }}>Approved Region Capacity</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Region</TableCell>
            <TableCell align="right">Total Capacity</TableCell>
            <TableCell align="right">Current Capacity</TableCell>
            <TableCell align="right">Available</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.region}
              sx={{
                backgroundColor: row.status === 'EXCEEDED' ? '#ffcccc' : 'inherit'
              }}
            >
              <TableCell component="th" scope="row">{row.region}</TableCell>
              <TableCell align="right">{row.total_capacity}</TableCell>
              <TableCell align="right">{row.current_capacity}</TableCell>
              <TableCell align="right">{row.available}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApprovedRegionsTable;