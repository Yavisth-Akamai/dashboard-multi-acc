import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  SelectChangeEvent,
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
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAccountChange = (event: SelectChangeEvent<string[]>) => {
    onAccountsChange(event.target.value as string[]);
  };

  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        mb: 2,
        position: 'relative',
        backgroundColor: 'background.paper',
        boxShadow: 1,
        '& .MuiFormControl-root': {
          minWidth: 180,
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem',
        },
        '& .MuiSelect-select': {
          fontSize: '0.875rem',
        },
      }}
    >
      {/* Expand/Collapse Arrow */}
      <IconButton
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          padding: '4px',
        }}
        size="small"
      >
        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>

      {/* Filter Content */}
      {isExpanded && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 2,
            mt: 4,
          }}
        >
          {/* Account Filter */}
          <FormControl size="small">
            <InputLabel>Accounts</InputLabel>
            <Select
              multiple
              value={selectedAccounts}
              onChange={handleAccountChange}
              label="Accounts"
              renderValue={(selected) => selected.map(formatAccountName).join(', ')}
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
