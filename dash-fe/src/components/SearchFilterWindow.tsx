import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  SelectChangeEvent,
  Typography,
  Tooltip,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { formatAccountName } from '../utils/formatters';

interface SearchFilterWindowProps {
  selectedAccounts: string[];
  onAccountsChange: (accounts: string[]) => void;
  accounts: string[];
}

const SearchFilterWindow: React.FC<SearchFilterWindowProps> = ({
  selectedAccounts,
  onAccountsChange,
  accounts,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAccountChange = (event: SelectChangeEvent<string[]>) => {
    onAccountsChange(event.target.value as string[]);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        mb: 3,
        px: 2,
        py: isExpanded ? 1.5 : 1,
        borderRadius: 1.5,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 0.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '28px',
        }}
      >
        {isExpanded ? (
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ lineHeight: 1 }}
          >
            Search
          </Typography>
        ) : (
          <Tooltip
            title={
              <Box sx={{ whiteSpace: 'pre-line' }}>
                {selectedAccounts.map((acc) => `{${formatAccountName(acc)}}`).join('\n')}
              </Box>
            }
            arrow
            placement="top-start"
            enterDelay={500}
            leaveDelay={0}
          >
            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                fontSize: '0.75rem',
                maxWidth: '100px',
                backgroundColor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'text.secondary',
                cursor: 'pointer',
              }}
            >
              {(() => {
                const preview = selectedAccounts.map(formatAccountName).join(', ');
                return preview.length > 7 ? `${preview.slice(0, 7)}...` : preview || '—';
              })()}
            </Box>
          </Tooltip>
        )}

        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          size="small"
          sx={{ padding: 0.5, ml: 1 }}
        >
          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>

      {isExpanded && (
        <Box
          sx={{
            mt: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 2,
          }}
        >
          <FormControl size="small" fullWidth>
            <InputLabel id="account-filter-label">Accounts</InputLabel>
            <Select
              labelId="account-filter-label"
              multiple
              value={selectedAccounts}
              onChange={handleAccountChange}
              label="Accounts"
              renderValue={(selected) =>
                selected.map(formatAccountName).join(', ')
              }
            >
              {accounts.map((account) => (
                <MenuItem key={account} value={account}>
                  {formatAccountName(account)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default SearchFilterWindow;
