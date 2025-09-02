import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutAndClear } from '@/features/auth/authSlice';
import { router } from 'expo-router';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading } = useAppSelector((state) => state.auth);

  const isAuthenticated = !!token && !!user;

  // Debug logging
  console.log('🔍 useAuth state:', { 
    hasToken: !!token, 
    hasUser: !!user, 
    isAuthenticated, 
    isLoading 
  });

  const logout = async () => {
    console.log('🚪 Logout called');
    await dispatch(logoutAndClear()).unwrap();
    router.replace('/auth/login');
  };

  const checkAuth = () => {
    console.log('🔐 checkAuth called, isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      router.replace('/auth/login');
      return false;
    }
    console.log('✅ Authenticated');
    return true;
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    logout,
    checkAuth,
  };
};
