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
  Chip,
  styled,
} from '@mui/material';
import { ClusterMetric, ApprovedRegion } from '../types/account.types';
import { PROFILE_COLOR_MAPPINGS } from '../config/profile-colors.config';
import { formatRegionName } from '../utils/formatters';

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
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  fontWeight: 500,
  fontSize: '0.75rem',
  borderRadius: 6,
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

  const normalizeRegionName = (region: string): string =>
    region.split(',')[0].trim().toLowerCase();

  const clustersByRegionAndProfile: Record<string, Record<string, number>> = {};
  data.forEach(cluster => {
    const region = normalizeRegionName(cluster.region);
    const profile = cluster.profileType || 'D';
    clustersByRegionAndProfile[region] ??= { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
    clustersByRegionAndProfile[region][profile]++;
  });

  const approvedByRegion: Record<string, Record<string, number>> = {};
  approvedRegions.forEach(region => {
    const normalized = normalizeRegionName(region.region);
    approvedByRegion[normalized] ??= { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
    Object.entries(region.total_capacity).forEach(([profile, count]) => {
      approvedByRegion[normalized][profile] += count;
    });
  });

  const unapprovedData = Object.entries(clustersByRegionAndProfile).reduce((acc, [region, profiles]) => {
    const approved = approvedByRegion[region] || { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
    const excess: Record<string, number> = {};
    Object.entries(profiles).forEach(([profile, count]) => {
      const diff = count - (approved[profile] || 0);
      if (diff > 0) excess[profile] = diff;
    });
    if (Object.keys(excess).length > 0) acc.push({ region, profiles: excess });
    return acc;
  }, [] as { region: string; profiles: Record<string, number> }[]);

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        mb: 3,
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
        Unapproved Regions
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledHeaderCell>Region</StyledHeaderCell>
            <StyledHeaderCell>Unapproved Clusters</StyledHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {unapprovedData.length > 0 ? (
            unapprovedData.map(row => (
              <TableRow
                key={row.region}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                }}
              >
                <StyledCell>{formatRegionName(row.region)}</StyledCell>
                <StyledCell>
                  {Object.entries(row.profiles).map(([profile, count]) => (
                    <ProfileChip
                      key={`${row.region}-${profile}`}
                      label={`${profile}: ${count}`}
                      size="small"
                      sx={theme => {
                        const bg = profileColorMap[profile] || profileColorMap.D;
                        return {
                          backgroundColor: bg,
                          color: theme.palette.getContrastText(bg),
                        };
                      }}
                    />
                  ))}
                </StyledCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <StyledCell colSpan={2} align="center">
                No unapproved regions found
              </StyledCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UnapprovedRegionsTable;
