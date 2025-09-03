import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreAuth } from '@/features/auth/authSlice';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/theme';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Restore authentication state from storage on app startup
    dispatch(restoreAuth());
  }, [dispatch]);

  // Show loading screen while restoring auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return <>{children}</>;
}

