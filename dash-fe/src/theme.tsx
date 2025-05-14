import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const baseTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#0d47a1' : '#90caf9',
    },
    secondary: {
      main: mode === 'light' ? '#f50057' : '#f48fb1',
    },
    background: {
      default: mode === 'light' ? '#fafafa' : '#121212',
      paper: mode === 'light' ? '#fff' : '#1e1e1e',
    },
  },
  typography: {
    fontFamily: ['"Inter"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    fontSize: 13,
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '6px 12px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export const getTheme = (mode: 'light' | 'dark') => responsiveFontSizes(baseTheme(mode));
