import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signup, login } from '../services/api';
import { AuthResponse } from '../types/account.types';

const Signup: React.FC = () => {
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();

  const [User, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!User.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup(User.trim(), password);

      const response: AuthResponse = await login(User.trim(), password);

      if (response.needsPasswordChange) {
        navigate('/change-password', { state: { User: User.trim() } });
        return;
      }

      if (response.token) {
        loginUser(response.token);
        navigate('/');
      } else {
        throw new Error('Signup succeeded, but no token returned on login.');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to signup. Maybe user already exists.';
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
        <Typography variant="h6" fontWeight={600} textAlign="center" color="text.primary" mb={3}>
          Sign Up
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="User"
            variant="outlined"
            fullWidth
            required
            value={User}
            onChange={(e) => setUser(e.target.value)}
            margin="normal"
            size="small"
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            size="small"
          />

          <TextField
            label="Confirm Password"
            variant="outlined"
            fullWidth
            required
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            size="small"
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1 }} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Sign Up'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Signup;
