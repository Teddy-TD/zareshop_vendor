import { Provider } from 'react-redux';
import { store } from '../store';
import AuthProvider from '../components/AuthProvider';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { Slot } from 'expo-router';

import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  useFrameworkReady();

  return (
    <Provider store={store}>
      <AuthProvider>
        <Slot />
        <StatusBar style="auto" />
      </AuthProvider>
    </Provider>
  );
}