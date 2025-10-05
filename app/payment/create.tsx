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
import { ArrowLeft, CreditCard, Smartphone, Building, ChevronDown } from 'lucide-react-native';

import { COLORS } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';
import {
  useCreateMobilePaymentMutation,
  useGetAvailableSubscriptionsQuery,
  useGetPaymentInstructionsQuery,
  PaymentMethod,
  PaymentProvider,
  Subscription,
} from '@/services/paymentApi';
import CustomButton from '@/components/CustomButton';

const CreatePaymentScreen = () => {
  const [selectedSubscription, setSelectedSubscription] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('manual');
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('bank_transfer');
  const [showSubscriptionDropdown, setShowSubscriptionDropdown] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const user = useAppSelector(state => state.auth.user);

  const {
    data: subscriptionsData,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
  } = useGetAvailableSubscriptionsQuery();

  const {
    data: instructionsData,
    isLoading: instructionsLoading,
  } = useGetPaymentInstructionsQuery(paymentProvider, {
    skip: paymentMethod !== 'manual',
  });

  const [createMobilePayment] = useCreateMobilePaymentMutation();

  const subscriptions = subscriptionsData?.data || [];
  const paymentInstructions = instructionsData?.data;

  const paymentMethodOptions = [
    {
      value: 'manual' as PaymentMethod,
      label: 'Manual Payment',
      description: 'Bank transfer, mobile money, etc.',
      icon: <Building size={24} color={COLORS.primary} />,
    },
    {
      value: 'integrated' as PaymentMethod,
      label: 'Online Payment',
      description: 'Credit card, digital wallets',
      icon: <CreditCard size={24} color={COLORS.primary} />,
    },
  ];

  const paymentProviderOptions = [
    {
      value: 'bank_transfer' as PaymentProvider,
      label: 'Bank Transfer',
      description: 'CBE, Dashen, Awash Bank, etc.',
    },
    {
      value: 'chapa' as PaymentProvider,
      label: 'Chapa',
      description: 'Mobile money, cards',
    },
    {
      value: 'stripe' as PaymentProvider,
      label: 'Stripe',
      description: 'International cards',
    },
  ];

  const handleCreatePayment = async () => {
    if (!selectedSubscription) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsCreating(true);

    try {
      const result = await createMobilePayment({
        subscription_id: selectedSubscription,
        payment_method: paymentMethod,
        payment_provider: paymentProvider,
        currency: 'ETB',
      }).unwrap();

      if (result.success && result.data.payment) {
        Alert.alert(
          'Payment Created',
          'Your payment has been created successfully. You will be redirected to complete the payment.',
          [
            {
              text: 'OK',
              onPress: () => router.replace(`/payment/${result.data.payment.id}` as any),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to create payment');
      }
    } catch (error: any) {
      console.error('Create payment error:', error);
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to create payment. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const renderSubscriptionCard = (subscription: Subscription) => (
    <TouchableOpacity
      key={subscription.id}
      style={[
        styles.subscriptionCard,
        selectedSubscription === subscription.id && styles.selectedCard,
      ]}
      onPress={() => {
        setSelectedSubscription(subscription.id);
        setShowSubscriptionDropdown(false);
      }}
    >
      <View style={styles.subscriptionHeader}>
        <Text style={styles.subscriptionPlan}>{subscription.plan}</Text>
        <Text style={styles.subscriptionAmount}>
          {subscription.amount} ETB
        </Text>
      </View>
      <Text style={styles.subscriptionDuration}>
        {subscription.duration_months} months
      </Text>
      {subscription.features && subscription.features.length > 0 && (
        <View style={styles.featuresContainer}>
          {subscription.features.slice(0, 3).map((feature, index) => (
            <Text key={index} style={styles.feature}>
              • {feature}
            </Text>
          ))}
          {subscription.features.length > 3 && (
            <Text style={styles.moreFeatures}>
              +{subscription.features.length - 3} more features
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPaymentMethodCard = (option: typeof paymentMethodOptions[0]) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.paymentMethodCard,
        paymentMethod === option.value && styles.selectedCard,
      ]}
      onPress={() => setPaymentMethod(option.value)}
    >
      <View style={styles.methodIcon}>{option.icon}</View>
      <View style={styles.methodInfo}>
        <Text style={styles.methodLabel}>{option.label}</Text>
        <Text style={styles.methodDescription}>{option.description}</Text>
      </View>
      <View style={styles.radioButton}>
        {paymentMethod === option.value && (
          <View style={styles.radioButtonSelected} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderProviderCard = (option: typeof paymentProviderOptions[0]) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.providerCard,
        paymentProvider === option.value && styles.selectedCard,
      ]}
      onPress={() => {
        setPaymentProvider(option.value);
        setShowProviderDropdown(false);
      }}
    >
      <Text style={styles.providerLabel}>{option.label}</Text>
      <Text style={styles.providerDescription}>{option.description}</Text>
    </TouchableOpacity>
  );

  const selectedSubscriptionData = subscriptions.find(s => s.id === selectedSubscription);

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
        <Text style={styles.headerTitle}>Create Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subscription Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Subscription Plan</Text>
          
          {subscriptionsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading plans...</Text>
            </View>
          ) : subscriptionsError ? (
            <Text style={styles.errorText}>Failed to load subscription plans</Text>
          ) : (
            <>
              {selectedSubscriptionData ? (
                <TouchableOpacity
                  style={styles.selectedSubscriptionContainer}
                  onPress={() => setShowSubscriptionDropdown(!showSubscriptionDropdown)}
                >
                  <View style={styles.selectedSubscriptionInfo}>
                    <Text style={styles.selectedSubscriptionPlan}>
                      {selectedSubscriptionData.plan}
                    </Text>
                    <Text style={styles.selectedSubscriptionAmount}>
                      {selectedSubscriptionData.amount} ETB
                    </Text>
                  </View>
                  <ChevronDown 
                    size={20} 
                    color={COLORS.gray}
                    style={[{
                      transform: [{ rotate: showSubscriptionDropdown ? '180deg' : '0deg' }]
                    }]}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.selectSubscriptionButton}
                  onPress={() => setShowSubscriptionDropdown(!showSubscriptionDropdown)}
                >
                  <Text style={styles.selectSubscriptionText}>
                    Choose a subscription plan
                  </Text>
                  <ChevronDown size={20} color={COLORS.gray} />
                </TouchableOpacity>
              )}

              {showSubscriptionDropdown && (
                <View style={styles.dropdown}>
                  {subscriptions.map(renderSubscriptionCard)}
                </View>
              )}
            </>
          )}
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodsContainer}>
            {paymentMethodOptions.map(renderPaymentMethodCard)}
          </View>
        </View>

        {/* Payment Provider Selection */}
        {paymentMethod === 'manual' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Provider</Text>
            
            <TouchableOpacity
              style={styles.providerSelector}
              onPress={() => setShowProviderDropdown(!showProviderDropdown)}
            >
              <Text style={styles.providerSelectorText}>
                {paymentProviderOptions.find(p => p.value === paymentProvider)?.label || 'Select Provider'}
              </Text>
              <ChevronDown 
                size={20} 
                color={COLORS.gray}
                style={[{
                  transform: [{ rotate: showProviderDropdown ? '180deg' : '0deg' }]
                }]}
              />
            </TouchableOpacity>

            {showProviderDropdown && (
              <View style={styles.dropdown}>
                {paymentProviderOptions.map(renderProviderCard)}
              </View>
            )}
          </View>
        )}

        {/* Payment Instructions Preview */}
        {paymentMethod === 'manual' && paymentInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Instructions</Text>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>
                {paymentInstructions.title}
              </Text>
              <Text style={styles.instructionsDescription}>
                {paymentInstructions.description}
              </Text>
              
              {paymentInstructions.account_details && (
                <View style={styles.accountDetails}>
                  {paymentInstructions.account_details.bank_name && (
                    <Text style={styles.accountDetail}>
                      Bank: {paymentInstructions.account_details.bank_name}
                    </Text>
                  )}
                  {paymentInstructions.account_details.account_number && (
                    <Text style={styles.accountDetail}>
                      Account: {paymentInstructions.account_details.account_number}
                    </Text>
                  )}
                  {paymentInstructions.account_details.account_holder && (
                    <Text style={styles.accountDetail}>
                      Holder: {paymentInstructions.account_details.account_holder}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Summary */}
        {selectedSubscriptionData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Plan:</Text>
                <Text style={styles.summaryValue}>{selectedSubscriptionData.plan}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}>{selectedSubscriptionData.duration_months} months</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Method:</Text>
                <Text style={styles.summaryValue}>
                  {paymentMethodOptions.find(m => m.value === paymentMethod)?.label}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotal}>Total Amount:</Text>
                <Text style={styles.summaryTotalAmount}>
                  {selectedSubscriptionData.amount} ETB
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Payment Button */}
      <View style={styles.footer}>
        <CustomButton
          title="Create Payment"
          onPress={handleCreatePayment}
          loading={isCreating}
          disabled={!selectedSubscription || isCreating}
          style={styles.createButton}
        />
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: COLORS.gray,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center' as const,
    padding: 16,
  },
  selectedSubscriptionContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  selectedSubscriptionInfo: {
    flex: 1,
  },
  selectedSubscriptionPlan: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  selectedSubscriptionAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.primary,
    marginTop: 2,
  },
  selectSubscriptionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectSubscriptionText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedCard: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  subscriptionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  subscriptionAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.primary,
  },
  subscriptionDuration: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  featuresContainer: {
    marginTop: 8,
  },
  feature: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  moreFeatures: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic' as const,
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodIcon: {
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 12,
    color: COLORS.gray,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  providerSelector: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerSelectorText: {
    fontSize: 16,
    color: COLORS.text,
  },
  providerCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  providerLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  providerDescription: {
    fontSize: 12,
    color: COLORS.gray,
  },
  instructionsContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  instructionsDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  accountDetails: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
  },
  accountDetail: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  summaryContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  summaryTotalAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.primary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  createButton: {
    width: '100%' as const,
  },
};

export default CreatePaymentScreen;
