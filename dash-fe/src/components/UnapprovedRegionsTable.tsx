import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, styled, Chip } from '@mui/material';
import { ClusterMetric, ApprovedRegion } from '../types/account.types';
import { PROFILE_COLOR_MAPPINGS } from '../config/profile-colors.config';

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  fontWeight: 'bold',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
}));

const ProfileChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 'bold',
}));

interface UnapprovedRegionsTableProps {
  data: ClusterMetric[];
  approvedRegions: ApprovedRegion[];
}

const UnapprovedRegionsTable: React.FC<UnapprovedRegionsTableProps> = ({ data, approvedRegions }) => {
  const profileColorMap = PROFILE_COLOR_MAPPINGS.reduce((map, item) => {
    map[item.profile] = item.color;
    return map;
  }, {} as Record<string, string>);

  const normalizeRegionName = (region: string): string => {
    return region.split(',')[0].trim().toLowerCase();
  };

  const clustersByRegionAndProfile: Record<string, Record<string, number>> = {};
  
  data.forEach(cluster => {
    const region = normalizeRegionName(cluster.region);
    const profileType = cluster.profileType || 'D'; 
    
    if (!clustersByRegionAndProfile[region]) {
      clustersByRegionAndProfile[region] = { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
    }
    
    clustersByRegionAndProfile[region][profileType]++;
  });
  
  const approvedByRegion: Record<string, Record<string, number>> = {};
  
  approvedRegions.forEach(region => {
    const normalizedRegion = normalizeRegionName(region.region);
    
    if (!approvedByRegion[normalizedRegion]) {
      approvedByRegion[normalizedRegion] = { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
    }
    
    Object.entries(region.total_capacity).forEach(([profile, count]) => {
      approvedByRegion[normalizedRegion][profile] += count;
    });
  });
  
  const unapprovedData: {
    region: string;
    profiles: Record<string, number>;
  }[] = [];
  
  Object.entries(clustersByRegionAndProfile).forEach(([region, profiles]) => {
    const approved = approvedByRegion[region] || { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
    const exceededProfiles: Record<string, number> = {};
    
    Object.entries(profiles).forEach(([profile, count]) => {
      const approvedCount = approved[profile] || 0;
      const excess = count - approvedCount;
      
      if (excess > 0) {
        exceededProfiles[profile] = excess;
      }
    });
    
    if (Object.keys(exceededProfiles).length > 0) {
      unapprovedData.push({
        region,
        profiles: exceededProfiles
      });
    }
  });

  return (
    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
      <Typography variant="h6" sx={{ padding: 1 }}>Unapproved Regions</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <StyledHeaderCell>Region</StyledHeaderCell>
            <StyledHeaderCell>Unapproved Clusters</StyledHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {unapprovedData.length > 0 ? (
            unapprovedData.map((row) => (
              <TableRow 
                key={row.region}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
              >
                <StyledTableCell>{row.region}</StyledTableCell>
                <StyledTableCell>
                  {Object.entries(row.profiles).map(([profile, count]) => (
                    <ProfileChip
                      key={profile}
                      label={`${profile}: ${count}`}
                      size="small"
                      style={{ 
                        backgroundColor: profileColorMap[profile] || profileColorMap.D,
                        color: 'rgba(0, 0, 0, 0.87)'
                      }}
                    />
                  ))}
                </StyledTableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <StyledTableCell colSpan={2} align="center">
                No unapproved regions found
              </StyledTableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UnapprovedRegionsTable;