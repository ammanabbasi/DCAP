import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/baseApi';
import socketService from '@/services/socket';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, token, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and redirect
      socketService.disconnect();
      dispatch(logout());
      navigate('/login');
    }
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasPermission = (permission: string) => {
    // This would be implemented based on your permission system
    // For now, just return true for authenticated users
    return isAuthenticated;
  };

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    logout: handleLogout,
    hasRole,
    hasPermission,
  };
};