import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outlined"
      color="error"
      size="small"
      sx={{
        borderRadius: 2,
        boxShadow: 1,
        textTransform: 'none',
        fontWeight: 500,
        transition: 'all 0.2s ease-in-out',
        ':hover': {
          backgroundColor: 'error.main',
          color: 'white',
          boxShadow: 3,
        },
      }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
