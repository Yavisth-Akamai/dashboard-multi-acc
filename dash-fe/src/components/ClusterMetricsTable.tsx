import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
} from '@mui/material';

export interface ClusterMetric {
  name: string;
  region: string;
  status: string;
  created: string;
}

interface ClusterMetricsTableProps {
  data: ClusterMetric[];
}

const ClusterMetricsTable: React.FC<ClusterMetricsTableProps> = ({ data }) => {
  return (
    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
      <Typography variant="h6" sx={{ padding: 1 }}>Cluster Metrics</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cluster Name</TableCell>
            <TableCell>Region</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.region}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{new Date(row.created).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClusterMetricsTable;