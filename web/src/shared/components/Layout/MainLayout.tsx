import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Toolbar,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { hideSnackbar } from '@/store/slices/uiSlice';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

const DRAWER_WIDTH = 240;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const { sidebarOpen } = useSelector((state: RootState) => state.theme);
  const { snackbar } = useSelector((state: RootState) => state.ui);

  const handleSnackbarClose = () => {
    dispatch(hideSnackbar());
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar />
      <Sidebar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            lg: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          },
          ml: {
            lg: sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>

      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};