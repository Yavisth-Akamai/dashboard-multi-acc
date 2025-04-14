import React, { useState } from 'react';  
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ApprovedRegionsTable from './ApprovedRegionsTable';
import UnapprovedRegionsTable from './UnapprovedRegionsTable';
import ClusterMetricsTable from './ClusterMetricsTable';
import { AccountData } from '../types/account.types';
import { formatAccountName } from '../utils/formatters';

interface AccountExpandableTableProps {
  accounts: AccountData[];
}

const AccountExpandableTable: React.FC<AccountExpandableTableProps> = ({ accounts }) => {
  console.log('AccountExpandableTable received accounts:', accounts); // Debug log
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);
  
  return (
    <div>
      {accounts.map((account) => {
        console.log(`Rendering account ${account.name}:`, account); // Debug log
        const isExpanded = expandedPanel === account.name;
        return (
          <Accordion 
            key={account.name} 
            sx={{ mb: 1 }}
            expanded={isExpanded}
            onChange={(event, expanded) => {
              setExpandedPanel(expanded ? account.name : false);
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
                <Typography 
                  sx={{ 
                    width: '25%', 
                    flexShrink: 0,
                    fontWeight: isExpanded ? 'bold' : 'normal',
                    color: isExpanded ? 'primary.main' : 'text.primary',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {formatAccountName(account.name)}
                </Typography>
                <Typography sx={{ width: '25%', color: 'text.secondary' }}>
                  HA: {account.ha ? 'Yes' : 'No'}
                </Typography>
                <Typography sx={{ width: '25%', color: 'text.secondary' }}>
                  Total Capacity: {account.totalCapacity}
                </Typography>
                <Typography sx={{ width: '25%', color: 'text.secondary' }}>
                  Created: {new Date(account.created).toLocaleDateString()}
                </Typography>
              </Box>
          </AccordionSummary>
          <AccordionDetails>
              <ApprovedRegionsTable data={account.approvedRegions} />
              <UnapprovedRegionsTable data={account.unapprovedRegions} />
              <ClusterMetricsTable data={account.clusterMetrics} />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};

export default AccountExpandableTable;