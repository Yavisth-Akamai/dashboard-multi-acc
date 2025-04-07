import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
} from '@mui/material';

export interface UnapprovedRegion {
  region: string;
  capacity: number;
}

interface UnapprovedRegionsTableProps {
  data: UnapprovedRegion[];
}

const UnapprovedRegionsTable: React.FC<UnapprovedRegionsTableProps> = ({ data }) => {
  console.log('UnapprovedRegionsTable received data:', data);
  
  return (
    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
      <Typography variant="h6" sx={{ padding: 1 }}>Unapproved Regions</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Region</TableCell>
            <TableCell align="right">Capacity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.region}</TableCell>
                <TableCell align="right">{row.capacity}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center">No unapproved regions found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UnapprovedRegionsTable;