import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/constants/theme';

export default function AuthDebug() {
  const { user, token, isAuthenticated, isLoading } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Debug Info</Text>
      <Text style={styles.text}>Loading: {isLoading ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Token: {token ? 'Present' : 'Missing'}</Text>
      <Text style={styles.text}>User: {user ? 'Present' : 'Missing'}</Text>
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.text}>User ID: {user.id}</Text>
          <Text style={styles.text}>Name: {user.name}</Text>
          <Text style={styles.text}>Phone: {user.phone_number}</Text>
          <Text style={styles.text}>Type: {user.type}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.card,
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  userInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

