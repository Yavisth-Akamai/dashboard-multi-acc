import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
// import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC<{ darkMode: boolean; onDarkModeChange: () => void }> = ({ darkMode, onDarkModeChange }) => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
      {/* <Route path="/signup" element={!isLoggedIn ? <Signup /> : <Navigate to="/" />} /> */}
      <Route path="/" element={isLoggedIn ? <Dashboard darkMode={darkMode} onDarkModeChange={onDarkModeChange} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent 
            darkMode={darkMode}
            onDarkModeChange={() => setDarkMode(!darkMode)}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
