import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft, CreditCard, FileText, CheckCircle } from 'lucide-react-native';

import { COLORS } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';
import {
  useGetUserVendorStatusQuery,
} from '@/services/applicationApi';
import {
  useGetUserPaymentsQuery,
  Payment,
} from '@/services/paymentApi';
import CustomButton from '@/components/CustomButton';
import PaymentStatusTracker from '@/components/PaymentStatusTracker';

type ApplicationStep = 'payment' | 'vendor_creation' | 'completed';

const ApplicationScreen = () => {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('payment');
  const user = useAppSelector(state => state.auth.user);

  const {
    data: vendorStatusData,
    isLoading: vendorStatusLoading,
    refetch: refetchVendorStatus,
  } = useGetUserVendorStatusQuery();

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
  } = useGetUserPaymentsQuery({
    page: 1,
    limit: 5,
  });

  const payments = paymentsData?.data || [];
  const completedPayment = payments.find(p => p.status === 'completed');
  const hasVendor = vendorStatusData?.hasVendor;

  // Determine current step based on payment and vendor status
  useEffect(() => {
    if (hasVendor) {
      setCurrentStep('completed');
    } else if (completedPayment) {
      setCurrentStep('vendor_creation');
    } else {
      setCurrentStep('payment');
    }
  }, [hasVendor, completedPayment]);

  const handlePaymentCompleted = (payment: Payment) => {
    Alert.alert(
      'Payment Completed!',
      'Your payment has been processed successfully. You can now create your vendor account.',
      [
        {
          text: 'Continue',
          onPress: () => setCurrentStep('vendor_creation'),
        },
      ]
    );
  };

  const handleCreateVendor = () => {
    if (!completedPayment) {
      Alert.alert('Error', 'Please complete payment first');
      return;
    }
    router.push('/auth/application');
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          currentStep !== 'payment' && styles.completedStep
        ]}>
          {currentStep !== 'payment' ? (
            <CheckCircle size={16} color={COLORS.white} />
          ) : (
            <Text style={styles.stepNumber}>1</Text>
          )}
        </View>
        <Text style={[
          styles.stepLabel,
          currentStep === 'payment' && styles.activeStepLabel
        ]}>
          Payment
        </Text>
      </View>

      <View style={[
        styles.stepLine,
        currentStep !== 'payment' && styles.completedLine
      ]} />

      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          currentStep === 'vendor_creation' && styles.activeStep,
          currentStep === 'completed' && styles.completedStep
        ]}>
          {currentStep === 'completed' ? (
            <CheckCircle size={16} color={COLORS.white} />
          ) : (
            <Text style={[
              styles.stepNumber,
              currentStep === 'vendor_creation' && styles.activeStepNumber
            ]}>
              2
            </Text>
          )}
        </View>
        <Text style={[
          styles.stepLabel,
          currentStep === 'vendor_creation' && styles.activeStepLabel
        ]}>
          Vendor Setup
        </Text>
      </View>

      <View style={[
        styles.stepLine,
        currentStep === 'completed' && styles.completedLine
      ]} />

      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          currentStep === 'completed' && styles.completedStep
        ]}>
          {currentStep === 'completed' ? (
            <CheckCircle size={16} color={COLORS.white} />
          ) : (
            <Text style={styles.stepNumber}>3</Text>
          )}
        </View>
        <Text style={[
          styles.stepLabel,
          currentStep === 'completed' && styles.activeStepLabel
        ]}>
          Complete
        </Text>
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <CreditCard size={48} color={COLORS.primary} />
        <Text style={styles.stepTitle}>Complete Payment</Text>
        <Text style={styles.stepDescription}>
          Choose a subscription plan and complete payment to start your vendor registration.
        </Text>
      </View>

      <PaymentStatusTracker
        onPaymentCompleted={handlePaymentCompleted}
        showCreateButton={true}
        style={styles.paymentTracker}
      />

      <View style={styles.stepActions}>
        <CustomButton
          title="Create New Payment"
          onPress={() => router.push('/payment/create')}
          style={styles.primaryButton}
        />
        <CustomButton
          title="View All Payments"
          onPress={() => router.push('/payment/index')}
          style={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
        />
      </View>
    </View>
  );

  const renderVendorCreationStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <FileText size={48} color={COLORS.primary} />
        <Text style={styles.stepTitle}>Create Vendor Account</Text>
        <Text style={styles.stepDescription}>
          Your payment is complete! Now let's set up your vendor account with business details.
        </Text>
      </View>

      {completedPayment && (
        <View style={styles.paymentSummary}>
          <Text style={styles.paymentSummaryTitle}>Payment Summary</Text>
          <View style={styles.paymentSummaryRow}>
            <Text style={styles.paymentSummaryLabel}>Amount:</Text>
            <Text style={styles.paymentSummaryValue}>
              {completedPayment.amount} {completedPayment.currency}
            </Text>
          </View>
          <View style={styles.paymentSummaryRow}>
            <Text style={styles.paymentSummaryLabel}>Plan:</Text>
            <Text style={styles.paymentSummaryValue}>
              {completedPayment.subscription?.plan || 'N/A'}
            </Text>
          </View>
          <View style={styles.paymentSummaryRow}>
            <Text style={styles.paymentSummaryLabel}>Status:</Text>
            <Text style={[styles.paymentSummaryValue, { color: COLORS.success }]}>
              ✅ Completed
            </Text>
          </View>
        </View>
      )}

      <View style={styles.stepActions}>
        <CustomButton
          title="Set Up Vendor Account"
          onPress={handleCreateVendor}
          style={styles.primaryButton}
        />
        <CustomButton
          title="View Payment Details"
          onPress={() => completedPayment && router.push(`/payment/${completedPayment.id}` as any)}
          style={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
        />
      </View>
    </View>
  );

  const renderCompletedStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <CheckCircle size={48} color={COLORS.success} />
        <Text style={styles.stepTitle}>Application Complete!</Text>
        <Text style={styles.stepDescription}>
          Your vendor account has been created successfully. 
          {vendorStatusData?.vendor?.isApproved 
            ? ' You can now start adding products and managing your store.'
            : ' Your account is pending admin approval.'
          }
        </Text>
      </View>

      {vendorStatusData?.vendor && (
        <View style={styles.vendorSummary}>
          <Text style={styles.vendorSummaryTitle}>Vendor Details</Text>
          <View style={styles.vendorSummaryRow}>
            <Text style={styles.vendorSummaryLabel}>Name:</Text>
            <Text style={styles.vendorSummaryValue}>
              {vendorStatusData.vendor.name}
            </Text>
          </View>
          <View style={styles.vendorSummaryRow}>
            <Text style={styles.vendorSummaryLabel}>Type:</Text>
            <Text style={styles.vendorSummaryValue}>
              {vendorStatusData.vendor.type}
            </Text>
          </View>
          <View style={styles.vendorSummaryRow}>
            <Text style={styles.vendorSummaryLabel}>Status:</Text>
            <Text style={[
              styles.vendorSummaryValue,
              { color: vendorStatusData.vendor.isApproved ? COLORS.success : COLORS.warning }
            ]}>
              {vendorStatusData.vendor.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.stepActions}>
        {vendorStatusData?.vendor?.isApproved ? (
          <CustomButton
            title="Go to Dashboard"
            onPress={() => router.replace('/(tabs)')}
            style={styles.primaryButton}
          />
        ) : (
          <CustomButton
            title="Check Status"
            onPress={() => refetchVendorStatus()}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        )}
        <CustomButton
          title="View Payments"
          onPress={() => router.push('/payment/index')}
          style={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
        />
      </View>
    </View>
  );

  const renderContent = () => {
    if (vendorStatusLoading || paymentsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading application status...</Text>
        </View>
      );
    }

    switch (currentStep) {
      case 'payment':
        return renderPaymentStep();
      case 'vendor_creation':
        return renderVendorCreationStep();
      case 'completed':
        return renderCompletedStep();
      default:
        return renderPaymentStep();
    }
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
        <Text style={styles.headerTitle}>Vendor Application</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
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
  stepIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.lightGray,
  },
  stepContainer: {
    alignItems: 'center' as const,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: COLORS.primary,
  },
  completedStep: {
    backgroundColor: COLORS.success,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.white,
  },
  activeStepNumber: {
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center' as const,
  },
  activeStepLabel: {
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  completedLine: {
    backgroundColor: COLORS.success,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  stepContent: {
    padding: 20,
  },
  stepHeader: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  stepDescription: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  paymentTracker: {
    marginBottom: 24,
  },
  paymentSummary: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  paymentSummaryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  paymentSummaryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  paymentSummaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  paymentSummaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  vendorSummary: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  vendorSummaryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  vendorSummaryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  vendorSummaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  vendorSummaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  stepActions: {
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
};

export default ApplicationScreen;
