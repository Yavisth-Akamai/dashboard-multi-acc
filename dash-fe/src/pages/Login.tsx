import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { AuthResponse } from '../types/account.types';

const Login: React.FC = () => {
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();

  const [User, setUser] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await login(User.trim(), password);

      if (response.needsPasswordChange) {
        navigate('/change-password', { state: { User: User.trim() } });
        return;
      }
      if (response.token) {
        loginUser(response.token);
        navigate('/');
      } else {
        throw new Error('Login succeeded but no token returned');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid User or password');
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
          Login
        </Typography>

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

          {error && (
            <Typography variant="body2" color="error" mt={1} mb={1} textAlign="center">
              {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1 }} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
