import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavigateFunction } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { changePassword } from '../services/api';

interface LocationState {
  User?: string;
}

const ChangePassword: React.FC = () => {
  const location = useLocation();
  const navigate: NavigateFunction = useNavigate();

  const state = location.state as LocationState;
  const User = state?.User || '';

  useEffect(() => {
    if (!User) {
      navigate('/login', { replace: true });
    }
  }, [User, navigate]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New Password and Confirm Password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {

      await changePassword(User, currentPassword, newPassword);

      setSuccessMessage('Password changed successfully. Redirecting to login…');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to change password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{ backgroundColor: 'background.default', px: 2 }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 4,
          py: 5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h6" fontWeight={600} textAlign="center" mb={3}>
          Change Password
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" mb={2}>
          {`User: ${User}`}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Current Password"
            variant="outlined"
            fullWidth
            required
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            size="small"
          />

          <TextField
            label="New Password"
            variant="outlined"
            fullWidth
            required
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            size="small"
          />

          <TextField
            label="Confirm New Password"
            variant="outlined"
            fullWidth
            required
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            size="small"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ChangePassword;
