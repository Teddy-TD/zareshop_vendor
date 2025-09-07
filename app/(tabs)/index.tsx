import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { TrendingUp, ShoppingBag, TriangleAlert as AlertTriangle, DollarSign, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import StatsCard from '@/components/StatsCard';
import AnimatedCard from '@/components/AnimatedCard';
import { useAuth } from '@/hooks/useAuth';
import { useGetVendorByPhoneQuery } from '@/services/vendorApi';
import { useGetOrdersStatsQuery } from '@/services/orderApi';
import { useGetProductsByStockStatusQuery } from '@/services/productApi';
import { useGetUserUnreadCountQuery } from '@/services/notificationApi';

export default function Dashboard() {
  const { user } = useAuth();
  const phone = user?.phone_number || '';

  const { data: vendorData } = useGetVendorByPhoneQuery(phone, {
    skip: !phone,
  });

  const vendorId = vendorData?.vendor?.id;
  const userId = vendorData?.user?.id;
  const { data: unread } = useGetUserUnreadCountQuery(userId as number, { skip: !userId });

  const { data: orderStats, isLoading: isLoadingStats } = useGetOrdersStatsQuery(
    { vendorId: vendorId as number },
    { skip: !vendorId }
  );

  const { data: lowStock } = useGetProductsByStockStatusQuery(
    { status: 'low_stock', vendor_id: vendorId as number, page: 1, limit: 1 },
    { skip: !vendorId }
  );

  const { data: outOfStock } = useGetProductsByStockStatusQuery(
    { status: 'out_of_stock', vendor_id: vendorId as number, page: 1, limit: 1 },
    { skip: !vendorId }
  );

  const activeProductsCount = (lowStock?.pagination?.total || 0) + (outOfStock?.pagination?.total || 0);
  const lowStockCount = lowStock?.pagination?.total || 0;
  const outOfStockCount = outOfStock?.pagination?.total || 0;

  const salesData = [
    { period: 'Today', amount: String(orderStats?.total_revenue || 0), orders: orderStats?.total_orders || 0 },
    { period: 'Processing', amount: '', orders: orderStats?.processing_orders || 0 },
    { period: 'Completed', amount: '', orders: orderStats?.completed_orders || 0 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.storeName}>Zareshop Vendor</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationsButton}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={24} color={COLORS.text} />
            {(unread?.count || 0) > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{Math.min(unread?.count || 0, 99)}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatsCard
            title="Total Revenue"
            value={`${orderStats?.total_revenue || 0} ETB`}
            subtitle={`${orderStats?.completed_orders || 0} completed orders`}
            icon={<DollarSign size={16} color={COLORS.primary} />}
            trend="neutral"
            trendValue=""
            delay={0}
          />
          <StatsCard
            title="Total Orders"
            value={`${orderStats?.total_orders || 0}`}
            subtitle={`Processing: ${orderStats?.processing_orders || 0}`}
            icon={<TrendingUp size={16} color={COLORS.primary} />}
            trend="neutral"
            trendValue=""
            delay={100}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Stock Overview"
            value={`${activeProductsCount}`}
            subtitle={`${lowStockCount} low, ${outOfStockCount} out`
            }
            icon={<ShoppingBag size={16} color={COLORS.warning} />}
            trend="neutral"
            trendValue=""
            delay={200}
          />
          <StatsCard
            title="Ready to Deliver"
            value={`${orderStats?.ready_to_delivery_orders || 0}`}
            subtitle="Orders waiting dispatch"
            icon={<AlertTriangle size={16} color={COLORS.error} />}
            trend="neutral"
            trendValue=""
            delay={300}
          />
        </View>

        {/* Sales Summary */}
        <AnimatedCard delay={400} style={styles.salesCard}>
          <Text style={styles.cardTitle}>Sales Summary</Text>
          <View style={styles.salesSummary}>
            {salesData.map((item, index) => (
              <View key={index} style={styles.salesItem}>
                <Text style={styles.salesPeriod}>{item.period}</Text>
                <Text style={styles.salesAmount}>{item.amount} ETB</Text>
                <Text style={styles.salesOrders}>{item.orders} orders</Text>
              </View>
            ))}
          </View>
        </AnimatedCard>

        {/* Recent Activity */}
        <AnimatedCard delay={500}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New order #12345 received</Text>
                <Text style={styles.activityTime}>2 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: COLORS.warning }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Product "iPhone Case" low stock</Text>
                <Text style={styles.activityTime}>15 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: COLORS.success }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Payout of 45,200 ETB processed</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
            </View>
          </View>
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SIZES.md,
    paddingTop: SIZES.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.xs,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.sm,
  },
  salesCard: {
    marginHorizontal: SIZES.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  salesSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salesItem: {
    alignItems: 'center',
    flex: 1,
  },
  salesPeriod: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SIZES.xs,
  },
  salesAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  salesOrders: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  activityList: {
    marginTop: SIZES.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: SIZES.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  notificationsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});