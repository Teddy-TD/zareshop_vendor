import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
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

export default function Payouts() {
  const [payouts] = useState([
    {
      id: 'PO-001',
      amount: '45,200 ETB',
      status: 'completed',
      date: '2024-01-15',
      method: 'Bank Transfer',
      account: '**** 1234',
    },
    {
      id: 'PO-002',
      amount: '32,800 ETB',
      status: 'pending',
      date: '2024-01-12',
      method: 'Mobile Money',
      account: '**** 5678',
    },
    {
      id: 'PO-003',
      amount: '18,500 ETB',
      status: 'processing',
      date: '2024-01-10',
      method: 'Bank Transfer',
      account: '**** 9012',
    },
  ]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: COLORS.success,
          text: 'Completed',
          bgColor: '#d1edff',
        };
      case 'pending':
        return {
          color: COLORS.warning,
          text: 'Pending',
          bgColor: '#fff3cd',
        };
      case 'processing':
        return {
          color: COLORS.primary,
          text: 'Processing',
          bgColor: COLORS.secondary,
        };
      default:
        return {
          color: COLORS.textLight,
          text: 'Unknown',
          bgColor: COLORS.card,
        };
    }
  };

  const PayoutCard = ({ payout, delay = 0 }: { payout: any; delay?: number }) => {
    const statusConfig = getStatusConfig(payout.status);

    return (
      <AnimatedCard delay={delay} style={styles.payoutCard}>
        <View style={styles.payoutHeader}>
          <View style={styles.payoutInfo}>
            <Text style={styles.payoutId}>{payout.id}</Text>
            <Text style={styles.payoutAmount}>{payout.amount}</Text>
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
            <Text style={styles.detailLabel}>Method:</Text>
            <Text style={styles.detailValue}>{payout.method}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account:</Text>
            <Text style={styles.detailValue}>{payout.account}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{payout.date}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.downloadButton}>
          <Download size={16} color={COLORS.primary} />
          <Text style={styles.downloadText}>Download Receipt</Text>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payouts</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Balance Overview */}
      <AnimatedCard delay={0} style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>Available Balance</Text>
          <CreditCard size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.balanceAmount}>96,450 ETB</Text>
        <Text style={styles.balanceSubtext}>Ready for withdrawal</Text>
        
        <View style={styles.balanceStats}>
          <View style={styles.balanceStat}>
            <Text style={styles.balanceStatValue}>324,780 ETB</Text>
            <Text style={styles.balanceStatLabel}>Total Earnings</Text>
          </View>
          <View style={styles.balanceStatDivider} />
          <View style={styles.balanceStat}>
            <Text style={styles.balanceStatValue}>228,330 ETB</Text>
            <Text style={styles.balanceStatLabel}>Withdrawn</Text>
          </View>
        </View>
      </AnimatedCard>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <AnimatedCard delay={100} style={styles.statCard}>
          <Calendar size={20} color={COLORS.primary} />
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </AnimatedCard>
        <AnimatedCard delay={200} style={styles.statCard}>
          <TrendingUp size={20} color={COLORS.success} />
          <Text style={styles.statValue}>96,450 ETB</Text>
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
        {payouts.map((payout, index) => (
          <PayoutCard 
            key={payout.id} 
            payout={payout} 
            delay={300 + (index * 100)} 
          />
        ))}
      </ScrollView>

      {/* Request Payout Button */}
      <View style={styles.bottomContainer}>
        <CustomButton
          title="Request Payout"
          onPress={() => {}}
          style={styles.requestButton}
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
});