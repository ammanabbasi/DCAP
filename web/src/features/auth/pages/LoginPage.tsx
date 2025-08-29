import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { RootState } from '@/store/store';
import { useLoginMutation } from '@/store/api/baseApi';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { LoginForm } from '../components/LoginForm';
import socketService from '@/services/socket';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const [login] = useLoginMutation();
  const [loginError, setLoginError] = React.useState<string>('');

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoginError('');
      dispatch(loginStart());

      const result = await login(data).unwrap();
      
      dispatch(loginSuccess(result));
      
      // Initialize socket connection after successful login
      socketService.connect();

    } catch (error: any) {
      dispatch(loginFailure());
      setLoginError(error?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left side - Branding (hidden on mobile) */}
          {!isMobile && (
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', color: theme.palette.text.primary }}>
                <Box
                  component="img"
                  src="/logo192.png"
                  alt="DealersCloud Logo"
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: theme.shadows[8],
                  }}
                />
                <Box sx={{ mb: 4 }}>
                  <h1 style={{ fontSize: '3rem', margin: 0, fontWeight: 700 }}>
                    DealersCloud
                  </h1>
                  <p style={{ fontSize: '1.25rem', opacity: 0.8, margin: '16px 0' }}>
                    Complete Automotive Dealership Management Platform
                  </p>
                </Box>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    backgroundColor: theme.palette.background.paper + '90',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <h3>Features</h3>
                  <Box component="ul" sx={{ textAlign: 'left', m: 0, pl: 2 }}>
                    <li>Inventory Management</li>
                    <li>CRM & Lead Tracking</li>
                    <li>Real-time Messaging</li>
                    <li>Analytics Dashboard</li>
                    <li>Document Management</li>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          )}

          {/* Right side - Login Form */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={8}
              sx={{
                maxWidth: 480,
                mx: 'auto',
                p: { xs: 2, sm: 4 },
                borderRadius: 3,
              }}
            >
              <CardContent>
                <LoginForm
                  onSubmit={handleLogin}
                  isLoading={isLoading}
                  error={loginError}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};