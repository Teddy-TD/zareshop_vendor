import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

import { COLORS } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';
import {
  useGetUserPaymentsQuery,
  useGetAvailableSubscriptionsQuery,
  Payment,
  PaymentStatus,
} from '@/services/paymentApi';
import CustomButton from '@/components/CustomButton';

const PaymentScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useGetUserPaymentsQuery({
    page: 1,
    limit: 20,
  });

  const {
    data: subscriptionsData,
    isLoading: subscriptionsLoading,
  } = useGetAvailableSubscriptionsQuery();

  const payments = paymentsData?.data || [];
  const subscriptions = subscriptionsData?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPayments();
    setRefreshing(false);
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'failed':
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color={COLORS.success} />;
      case 'pending':
        return <Clock size={20} color={COLORS.warning} />;
      case 'failed':
      case 'cancelled':
        return <XCircle size={20} color={COLORS.error} />;
      default:
        return <AlertCircle size={20} color={COLORS.gray} />;
    }
  };

  const handleCreatePayment = () => {
    router.push('/payment/create');
  };

  const handlePaymentPress = (payment: Payment) => {
    router.push(`/payment/${payment.id}` as any);
  };

  const renderPaymentCard = (payment: Payment) => (
    <TouchableOpacity
      key={payment.id}
      style={styles.paymentCard}
      onPress={() => handlePaymentPress(payment)}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentReference}>
            {payment.payment_reference}
          </Text>
          <Text style={styles.paymentAmount}>
            {payment.amount} {payment.currency}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          {getStatusIcon(payment.status)}
          <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
            {payment.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.paymentMethod}>
          {payment.payment_method === 'manual' ? 'Manual Payment' : 'Online Payment'}
        </Text>
        <Text style={styles.paymentProvider}>
          via {payment.payment_provider}
        </Text>
        <Text style={styles.paymentDate}>
          Created: {new Date(payment.created_at).toLocaleDateString()}
        </Text>
        {payment.completed_at && (
          <Text style={styles.completedDate}>
            Completed: {new Date(payment.completed_at).toLocaleDateString()}
          </Text>
        )}
      </View>

      {payment.subscription && (
        <View style={styles.subscriptionInfo}>
          <Text style={styles.subscriptionPlan}>
            Plan: {payment.subscription.plan}
          </Text>
        </View>
      )}

      {payment.vendor && (
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>
            ✅ Vendor: {payment.vendor.name}
          </Text>
          <Text style={styles.vendorStatus}>
            {payment.vendor.is_approved ? '✅ Approved' : '⏳ Pending Approval'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <CreditCard size={64} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>No Payments Yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first payment to start your vendor registration process.
      </Text>
      <CustomButton
        title="Create Payment"
        onPress={handleCreatePayment}
        style={styles.createButton}
      />
    </View>
  );

  const renderContent = () => {
    if (paymentsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading payments...</Text>
        </View>
      );
    }

    if (paymentsError) {
      return (
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Failed to load payments</Text>
          <CustomButton
            title="Retry"
            onPress={() => refetchPayments()}
            style={styles.retryButton}
          />
        </View>
      );
    }

    if (payments.length === 0) {
      return renderEmptyState();
    }

    return (
      <View style={styles.paymentsContainer}>
        <View style={styles.headerSection}>
          <Text style={styles.sectionTitle}>Your Payments</Text>
          <CustomButton
            title="New Payment"
            onPress={handleCreatePayment}
            style={styles.newPaymentButton}
            textStyle={styles.newPaymentButtonText}
          />
        </View>
        
        <ScrollView
          style={styles.paymentsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {payments.map(renderPaymentCard)}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center' as const,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 40,
  },
  emptyTitle: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.text,
    textAlign: 'center' as const,
  },
  emptyDescription: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  createButton: {
    marginTop: 32,
    paddingHorizontal: 48,
  },
  paymentsContainer: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  newPaymentButton: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  newPaymentButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  paymentsList: {
    flex: 1,
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentReference: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.primary,
  },
  statusContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  paymentDetails: {
    marginBottom: 12,
  },
  paymentMethod: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  paymentProvider: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  completedDate: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 2,
  },
  subscriptionInfo: {
    backgroundColor: COLORS.lightGray,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  subscriptionPlan: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  vendorInfo: {
    backgroundColor: COLORS.success + '10',
    padding: 8,
    borderRadius: 6,
  },
  vendorName: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  vendorStatus: {
    fontSize: 11,
    color: COLORS.success,
  },
};

export default PaymentScreen;
