import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  Download,
  Plus,
} from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';
import AnimatedCard from '@/components/AnimatedCard';
import CustomButton from '@/components/CustomButton';
import { useAuth } from '@/hooks/useAuth';
import { useGetVendorByPhoneQuery } from '@/services/vendorApi';
import { cleanPhoneNumber } from '@/validations/login_validation';
import { 
  useGetVendorPayoutStatsQuery, 
  useGetVendorPayoutHistoryQuery, 
  useCreatePayoutRequestMutation,
  CashOutRequestStatus 
} from '@/services/payoutApi';

export default function Payouts() {
  const { user } = useAuth();
  
  // Get vendor information by phone number
  const cleanedPhoneNumber = user?.phone_number ? cleanPhoneNumber(user.phone_number) : '';
  const { 
    data: vendorData, 
    isLoading: isLoadingVendor, 
    error: vendorError 
  } = useGetVendorByPhoneQuery(cleanedPhoneNumber, {
    skip: !cleanedPhoneNumber
  });

  const vendorId = vendorData?.vendor?.id;

  // Get payout statistics
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError
  } = useGetVendorPayoutStatsQuery(
    { vendorId: vendorId || 0 },
    { skip: !vendorId }
  );

  // Get payout history
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError
  } = useGetVendorPayoutHistoryQuery(
    { vendorId: vendorId || 0, limit: 10 },
    { skip: !vendorId }
  );

  const [createPayoutRequest, { isLoading: isCreatingPayout }] = useCreatePayoutRequestMutation();

  const handleRequestPayout = () => {
    if (!vendorId) {
      Alert.alert('Error', 'Vendor information not found');
      return;
    }

    const availableBalance = statsData?.availableBalance || 0;
    
    Alert.prompt(
      'Request Payout',
      `Enter payout amount (ETB):\nAvailable balance: ${availableBalance.toLocaleString()} ETB`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request', 
          style: 'default',
          onPress: async (amount) => {
            if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
              const numAmount = Number(amount);
              if (numAmount > availableBalance) {
                Alert.alert('Error', `Amount exceeds available balance (${availableBalance.toLocaleString()} ETB)`);
                return;
              }
              
              try {
                await createPayoutRequest({
                  vendorId,
                  data: { amount: numAmount }
                }).unwrap();
                
                Alert.alert(
                  'Payout Requested',
                  `Your payout request for ${numAmount.toLocaleString()} ETB has been submitted. You will receive the funds within 2-3 business days.`,
                  [{ text: 'OK', style: 'default' }]
                );
              } catch (error: any) {
                Alert.alert('Error', error?.data?.message || 'Failed to create payout request');
              }
            } else {
              Alert.alert('Error', 'Please enter a valid amount');
            }
          }
        }
      ],
      'plain-text',
      availableBalance.toString()
    );
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Payment method form will be implemented here. This would typically open a form to add bank account or mobile money details.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const getStatusConfig = (status: CashOutRequestStatus) => {
    switch (status) {
      case CashOutRequestStatus.approved:
        return {
          color: COLORS.success,
          text: 'Completed',
          bgColor: '#d1edff',
        };
      case CashOutRequestStatus.pending:
        return {
          color: COLORS.warning,
          text: 'Pending',
          bgColor: '#fff3cd',
        };
      case CashOutRequestStatus.rejected:
        return {
          color: COLORS.error,
          text: 'Rejected',
          bgColor: '#f8d7da',
        };
      default:
        return {
          color: COLORS.textLight,
          text: 'Unknown',
          bgColor: COLORS.card,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const PayoutCard = ({ payout, delay = 0 }: { payout: any; delay?: number }) => {
    const statusConfig = getStatusConfig(payout.status);

    return (
      <AnimatedCard delay={delay} style={styles.payoutCard}>
        <View style={styles.payoutHeader}>
          <View style={styles.payoutInfo}>
            <Text style={styles.payoutId}>#{payout.id}</Text>
            <Text style={styles.payoutAmount}>{formatCurrency(payout.amount)}</Text>
          </View>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: statusConfig.bgColor }
            ]}
          >
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>
        
        <View style={styles.payoutDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>{statusConfig.text}</Text>
          </View>
          {payout.reason && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reason:</Text>
              <Text style={styles.detailValue}>{payout.reason}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(payout.created_at)}</Text>
          </View>
        </View>

        {payout.status === CashOutRequestStatus.approved && (
          <TouchableOpacity style={styles.downloadButton}>
            <Download size={16} color={COLORS.primary} />
            <Text style={styles.downloadText}>Download Receipt</Text>
          </TouchableOpacity>
        )}
      </AnimatedCard>
    );
  };

  // Loading state
  if (isLoadingVendor || isLoadingStats) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading payout information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (vendorError || statsError || !vendorId || !statsData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load payout information</Text>
          <Text style={styles.errorSubText}>
            Please make sure you're logged in with a vendor account
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = statsData;
  const payouts = historyData?.payouts || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payouts</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Balance Overview */}
      <AnimatedCard delay={0} style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>Available Balance</Text>
          <CreditCard size={24} color={COLORS.white} />
        </View>
        <Text style={styles.balanceAmount}>{formatCurrency(stats.availableBalance)}</Text>
        <Text style={styles.balanceSubtext}>Ready for withdrawal</Text>
        
        <View style={styles.balanceStats}>
          <View style={styles.balanceStat}>
            <Text style={styles.balanceStatValue}>{formatCurrency(stats.totalEarnings)}</Text>
            <Text style={styles.balanceStatLabel}>Total Earnings</Text>
          </View>
          <View style={styles.balanceStatDivider} />
          <View style={styles.balanceStat}>
            <Text style={styles.balanceStatValue}>{formatCurrency(stats.totalWithdrawn)}</Text>
            <Text style={styles.balanceStatLabel}>Withdrawn</Text>
          </View>
        </View>
      </AnimatedCard>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <AnimatedCard delay={100} style={styles.statCard}>
          <Calendar size={20} color={COLORS.primary} />
          <Text style={styles.statValue}>{stats.thisMonthPayouts}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </AnimatedCard>
        <AnimatedCard delay={200} style={styles.statCard}>
          <TrendingUp size={20} color={COLORS.success} />
          <Text style={styles.statValue}>{formatCurrency(stats.pendingPayouts)}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </AnimatedCard>
      </View>

      {/* Payout History */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Payout History</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.payoutsList}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading payout history...</Text>
          </View>
        ) : payouts.length > 0 ? (
          payouts.map((payout, index) => (
            <PayoutCard 
              key={payout.id} 
              payout={payout} 
              delay={300 + (index * 100)} 
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payout history found</Text>
            <Text style={styles.emptySubText}>Your payout requests will appear here</Text>
          </View>
        )}
      </ScrollView>

      {/* Request Payout Button */}
      <View style={styles.bottomContainer}>
        <CustomButton
          title={isCreatingPayout ? "Requesting..." : "Request Payout"}
          onPress={handleRequestPayout}
          style={styles.requestButton}
          disabled={isCreatingPayout || stats.availableBalance <= 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    paddingTop: SIZES.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    backgroundColor: COLORS.primary,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  balanceTitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  balanceSubtext: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: SIZES.lg,
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceStat: {
    flex: 1,
    alignItems: 'center',
  },
  balanceStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  balanceStatLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SIZES.xs,
  },
  balanceStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SIZES.xs,
    paddingVertical: SIZES.lg,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.sm,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  payoutsList: {
    flex: 1,
    paddingHorizontal: SIZES.md,
  },
  payoutCard: {
    marginBottom: SIZES.sm,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  payoutInfo: {
    flex: 1,
  },
  payoutId: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.xs,
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  payoutDetails: {
    marginBottom: SIZES.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xs,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.md,
  },
  downloadText: {
    marginLeft: SIZES.sm,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bottomContainer: {
    padding: SIZES.md,
  },
  requestButton: {
    marginBottom: SIZES.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  loadingText: {
    marginTop: SIZES.base,
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});