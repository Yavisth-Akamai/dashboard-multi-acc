import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface SearchFilterWindowProps {
  darkMode: boolean;
  onDarkModeChange: () => void;
  selectedAccounts: string[];
  onAccountsChange: (accounts: string[]) => void;
  accounts: string[];
}

const SearchFilterWindow: React.FC<SearchFilterWindowProps> = ({
  darkMode,
  onDarkModeChange,
  selectedAccounts,
  onAccountsChange,
  accounts,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isProd, setIsProd] = useState(true);

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
        '& .MuiFormControlLabel-label': {
          fontSize: '0.875rem',
        },
      }}
    >
      {/* Toggle Buttons - Top Right */}
      <Box
        sx={{
          position: 'absolute',
          right: 48,
          top: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={onDarkModeChange}
              size="small"
            />
          }
          label="Dark Mode"
        />
        <FormControlLabel
          control={
            <Switch
              checked={isProd}
              onChange={() => setIsProd(!isProd)}
              size="small"
            />
          }
          label="Prod [Dummy]"
        />
      </Box>

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
              renderValue={(selected) => selected.join(', ')}
            >
              {accounts.map((account) => (
                <MenuItem key={account} value={account}>
                  {account}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Dummy Filters */}
          {['Region Filter', 'Status Filter', 'Date Filter'].map((filter) => (
            <FormControl key={filter} size="small">
              <InputLabel>{filter} [Dummy]</InputLabel>
              <Select
                multiple
                value={[]}
                onChange={() => {}}
                label={`${filter} [Dummy]`}
              >
                <MenuItem value="dummy1">Option 1</MenuItem>
                <MenuItem value="dummy2">Option 2</MenuItem>
                <MenuItem value="dummy3">Option 3</MenuItem>
              </Select>
            </FormControl>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SearchFilterWindow;