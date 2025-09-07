import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Bell, Package, CreditCard, AlertCircle, CheckCircle, Clock, X, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import AnimatedCard from '@/components/AnimatedCard';
import { useAuth } from '@/hooks/useAuth';
import { 
  useGetUserNotificationsQuery,
  useGetUserUnreadCountQuery,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useMarkAllReadMutation,
} from '@/services/notificationApi';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const userId = user ? Number(user.id) : undefined;

  const { data, isLoading, refetch } = useGetUserNotificationsQuery(
    { userId: userId as number, page: 1, limit: 50 },
    { skip: !userId }
  );
  const { data: unread } = useGetUserUnreadCountQuery(userId as number, { skip: !userId });
  const [markRead] = useMarkNotificationReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const notifications = data?.notifications || [];

  const computedStats = useMemo(() => {
    const byType = notifications.reduce<Record<string, number>>((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});
    return byType;
  }, [notifications]);

  const getNotificationIcon = (notification: any) => {
    const map: Record<string, any> = {
      order: Package,
      payout: CreditCard,
      stock: AlertCircle,
      system: CheckCircle,
      promotion: Bell,
      default: Bell,
    };
    const IconComponent = map[notification.type] || map.default;
    const colorMap: Record<string, string> = {
      order: COLORS.primary,
      payout: COLORS.success,
      stock: COLORS.warning,
      system: COLORS.success,
      promotion: COLORS.primary,
      default: COLORS.primary,
    };
    const color = colorMap[notification.type] || colorMap.default;
    return (
      <View style={[styles.notificationIcon, { backgroundColor: color + '20' }]}>
        <IconComponent size={20} color={color} />
      </View>
    );
  };

  const markAsReadHandler = async (id: number) => {
    await markRead(id).unwrap();
    refetch();
  };

  const deleteNotificationHandler = async (id: number) => {
    await deleteNotification(id).unwrap();
    refetch();
  };

  const renderNotification = ({ item, index }: { item: any; index: number }) => (
    <AnimatedCard delay={index * 100} style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        {getNotificationIcon(item)}
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <View style={styles.notificationActions}>
          {!item.is_read && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => markAsReadHandler(item.id)}
            >
              <CheckCircle size={16} color={COLORS.success} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteNotificationHandler(item.id)}
          >
            <X size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {!item.is_read && (
        <View style={[styles.unreadIndicator, { backgroundColor: COLORS.primary }]} />
      )}
    </AnimatedCard>
  );

  const unreadCount = unread?.count || 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.markAllButton} onPress={() => userId && markAllRead(userId)}>
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Package size={20} color={COLORS.primary} />
          <Text style={styles.statValue}>
            {notifications.filter(n => n.type === 'order').length}
          </Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <CreditCard size={20} color={COLORS.success} />
          <Text style={styles.statValue}>
            {notifications.filter(n => n.type === 'payout').length}
          </Text>
          <Text style={styles.statLabel}>Payouts</Text>
        </View>
        <View style={styles.statItem}>
          <AlertCircle size={20} color={COLORS.warning} />
          <Text style={styles.statValue}>
            {notifications.filter(n => n.type === 'stock').length}
          </Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
        <View style={styles.statItem}>
          <Bell size={20} color={COLORS.primary} />
          <Text style={styles.statValue}>
            {notifications.filter(n => n.type === 'system').length}
          </Text>
          <Text style={styles.statLabel}>System</Text>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsContent}
      />

      {/* Empty State */}
      {(!isLoading && notifications.length === 0) && (
        <View style={styles.emptyState}>
          <Bell size={48} color={COLORS.textLight} />
          <Text style={styles.emptyStateTitle}>No Notifications</Text>
          <Text style={styles.emptyStateSubtitle}>
            You're all caught up! Check back later for new updates.
          </Text>
        </View>
      )}
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
    marginBottom: SIZES.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SIZES.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginLeft: SIZES.md,
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    minWidth: 24,
    alignItems: 'center',
    marginRight: SIZES.sm,
  },
  unreadCount: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    marginLeft: SIZES.sm,
  },
  markAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SIZES.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    marginTop: SIZES.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.xs,
    marginBottom: SIZES.sm,
    marginTop: SIZES.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.xs,
    marginLeft: SIZES.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
    marginLeft: SIZES.xs,
  },
  notificationsList: {
    flex: 1,
    marginTop: SIZES.md,
  },
  notificationsContent: {
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.xl,
  },
  notificationCard: {
    marginBottom: SIZES.md,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SIZES.md,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
    marginTop: SIZES.xs,
  },
  notificationContent: {
    flex: 1,
    paddingRight: SIZES.sm,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
    marginTop: SIZES.xs,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SIZES.xs,
    marginTop: SIZES.xs,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: SIZES.xs,
    paddingLeft: SIZES.sm,
    marginTop: SIZES.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.xs,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    marginTop: SIZES.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
    marginTop: SIZES.xl,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SIZES.lg,
    marginBottom: SIZES.sm,
    marginLeft: SIZES.xl,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginLeft: SIZES.xl,
  },
});
