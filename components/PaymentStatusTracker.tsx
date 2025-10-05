import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  CreditCard,
  ArrowRight,
} from 'lucide-react-native';

import { COLORS } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';
import {
  useGetUserPaymentsQuery,
  Payment,
  PaymentStatus,
} from '@/services/paymentApi';
import CustomButton from '@/components/CustomButton';

interface PaymentStatusTrackerProps {
  onPaymentCompleted?: (payment: Payment) => void;
  showCreateButton?: boolean;
  style?: any;
}

const PaymentStatusTracker: React.FC<PaymentStatusTrackerProps> = ({
  onPaymentCompleted,
  showCreateButton = true,
  style,
}) => {
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const user = useAppSelector(state => state.auth.user);

  const {
    data: paymentsData,
    isLoading,
    error,
    refetch,
  } = useGetUserPaymentsQuery({
    page: 1,
    limit: 5,
  }, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  const payments = paymentsData?.data || [];
  const latestPayment = payments[0];

  // Check for completed payments and notify
  useEffect(() => {
    if (latestPayment?.status === 'completed' && onPaymentCompleted) {
      onPaymentCompleted(latestPayment);
    }
  }, [latestPayment?.status, onPaymentCompleted]);

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

  const getStatusIcon = (status: PaymentStatus, size: number = 20) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={size} color={COLORS.success} />;
      case 'pending':
        return <Clock size={size} color={COLORS.warning} />;
      case 'failed':
      case 'cancelled':
        return <XCircle size={size} color={COLORS.error} />;
      default:
        return <AlertCircle size={size} color={COLORS.gray} />;
    }
  };

  const getStatusMessage = (payment: Payment) => {
    switch (payment.status) {
      case 'completed':
        return payment.vendor 
          ? 'Payment completed and vendor account created!'
          : 'Payment completed! You can now create your vendor account.';
      case 'pending':
        return payment.manual_payment_proof
          ? 'Payment proof uploaded. Waiting for admin verification.'
          : payment.payment_method === 'manual'
          ? 'Please complete your payment and upload proof.'
          : 'Please complete your online payment.';
      case 'failed':
        return 'Payment failed. Please try again or contact support.';
      case 'cancelled':
        return 'Payment was cancelled. You can create a new payment.';
      default:
        return 'Unknown payment status.';
    }
  };

  const getActionButton = (payment: Payment) => {
    switch (payment.status) {
      case 'completed':
        if (!payment.vendor) {
          return (
            <CustomButton
              title="Create Vendor Account"
              onPress={() => router.push('/auth/application')}
              style={styles.actionButton}
            />
          );
        }
        return null;
      case 'pending':
        return (
          <CustomButton
            title="View Payment Details"
            onPress={() => router.push(`/payment/${payment.id}` as any)}
            style={[styles.actionButton, { backgroundColor: COLORS.lightGray, borderWidth: 1, borderColor: COLORS.primary }] as any}
            textStyle={styles.secondaryButtonText}
          />
        );
      case 'failed':
      case 'cancelled':
        return (
          <CustomButton
            title="Create New Payment"
            onPress={() => router.push('/payment/create')}
            style={styles.actionButton}
          />
        );
      default:
        return null;
    }
  };

  const renderPaymentCard = (payment: Payment) => (
    <TouchableOpacity
      key={payment.id}
      style={[
        styles.paymentCard,
        { borderLeftColor: getStatusColor(payment.status) }
      ]}
      onPress={() => router.push(`/payment/${payment.id}` as any)}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <View style={styles.statusRow}>
            {getStatusIcon(payment.status, 16)}
            <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
              {payment.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.paymentAmount}>
            {payment.amount} {payment.currency}
          </Text>
          <Text style={styles.paymentReference}>
            {payment.payment_reference}
          </Text>
        </View>
        <ArrowRight size={16} color={COLORS.gray} />
      </View>
      
      <Text style={styles.statusMessage}>
        {getStatusMessage(payment)}
      </Text>

      {payment.subscription && (
        <Text style={styles.subscriptionInfo}>
          Plan: {payment.subscription.plan}
        </Text>
      )}

      <View style={styles.paymentActions}>
        {getActionButton(payment)}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <CreditCard size={48} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>No Payments Yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first payment to start the vendor registration process.
      </Text>
      {showCreateButton && (
        <CustomButton
          title="Create Payment"
          onPress={() => router.push('/payment/create')}
          style={styles.createButton}
        />
      )}
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading payment status...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <AlertCircle size={32} color={COLORS.error} />
      <Text style={styles.errorText}>Failed to load payment status</Text>
      <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        {renderLoadingState()}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        {renderErrorState()}
      </View>
    );
  }

  if (payments.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Status</Text>
        <TouchableOpacity
        onPress={() => router.push('/payment/index' as any)}
        style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.paymentsContainer}>
        {payments.slice(0, 2).map(renderPaymentCard)}
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500' as const,
  },
  paymentsContainer: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  paymentHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  paymentReference: {
    fontSize: 11,
    color: COLORS.gray,
  },
  statusMessage: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 16,
  },
  subscriptionInfo: {
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: 8,
  },
  paymentActions: {
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 32,
  },
  secondaryButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center' as const,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 16,
  },
  createButton: {
    paddingHorizontal: 24,
  },
  loadingState: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 24,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray,
  },
  errorState: {
    alignItems: 'center' as const,
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500' as const,
  },
};

export default PaymentStatusTracker;
