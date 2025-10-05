import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { COLORS } from '@/constants/theme';
import CustomButton from '@/components/CustomButton';
import PaymentStatusTracker from '@/components/PaymentStatusTracker';

const PaymentsTabScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Payment Management</Text>
        <Text style={styles.subtitle}>
          Manage your vendor registration payments
        </Text>
      </View>

      <View style={styles.content}>
        <PaymentStatusTracker 
          showCreateButton={true}
          style={styles.paymentTracker}
        />

        <View style={styles.actions}>
          <CustomButton
            title="View All Payments"
            onPress={() => router.push('/payment/index' as any)}
            style={styles.primaryButton}
          />
          <CustomButton
            title="Create New Payment"
            onPress={() => router.push('/payment/create')}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  paymentTracker: {
    marginBottom: 32,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
});

export default PaymentsTabScreen;




