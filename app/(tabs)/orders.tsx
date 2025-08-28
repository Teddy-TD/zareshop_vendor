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
import { Clock, Package, Truck, CircleCheck as CheckCircle, Circle as XCircle, Filter, Search } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';
import AnimatedCard from '@/components/AnimatedCard';

export default function Orders() {
  const [orders] = useState([
    {
      id: '#12345',
      customer: 'John Doe',
      items: 2,
      total: '1,450 ETB',
      status: 'pending',
      date: '2024-01-15',
      time: '10:30 AM',
    },
    {
      id: '#12344',
      customer: 'Sarah Smith',
      items: 1,
      total: '280 ETB',
      status: 'ready',
      date: '2024-01-15',
      time: '09:15 AM',
    },
    {
      id: '#12343',
      customer: 'Mike Johnson',
      items: 3,
      total: '2,100 ETB',
      status: 'delivered',
      date: '2024-01-14',
      time: '02:45 PM',
    },
    {
      id: '#12342',
      customer: 'Emma Wilson',
      items: 1,
      total: '890 ETB',
      status: 'cancelled',
      date: '2024-01-14',
      time: '11:20 AM',
    },
  ]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: COLORS.warning,
          icon: Clock,
          text: 'Pending',
          bgColor: '#fff3cd',
        };
      case 'ready':
        return {
          color: COLORS.primary,
          icon: Package,
          text: 'Ready for Delivery',
          bgColor: COLORS.secondary,
        };
      case 'delivered':
        return {
          color: COLORS.success,
          icon: CheckCircle,
          text: 'Delivered',
          bgColor: '#d1edff',
        };
      case 'cancelled':
        return {
          color: COLORS.error,
          icon: XCircle,
          text: 'Cancelled',
          bgColor: '#f8d7da',
        };
      default:
        return {
          color: COLORS.textLight,
          icon: Clock,
          text: 'Unknown',
          bgColor: COLORS.card,
        };
    }
  };

  const OrderCard = ({ order, delay = 0 }: { order: any; delay?: number }) => {
    const statusConfig = getStatusConfig(order.status);
    const IconComponent = statusConfig.icon;

    return (
      <AnimatedCard delay={delay} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.customerName}>{order.customer}</Text>
          </View>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: statusConfig.bgColor }
            ]}
          >
            <IconComponent size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items:</Text>
            <Text style={styles.detailValue}>{order.items}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.detailValue}>{order.total}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{order.date} at {order.time}</Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>View Details</Text>
          </TouchableOpacity>
          {order.status === 'pending' && (
            <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
              <Text style={[styles.actionText, styles.primaryActionText]}>
                Mark Ready
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedCard>
    );
  };

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textLight} />
          <Text style={styles.searchPlaceholder}>Search orders...</Text>
        </View>
      </View>

      {/* Order Stats */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: COLORS.warning }]}>
            <Text style={styles.statValue}>{statusCounts.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.statValue}>{statusCounts.ready}</Text>
            <Text style={styles.statLabel}>Ready</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.success }]}>
            <Text style={styles.statValue}>{statusCounts.delivered}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.error }]}>
            <Text style={styles.statValue}>{statusCounts.cancelled}</Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>
      </ScrollView>

      {/* Orders List */}
      <ScrollView 
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
      >
        {orders.map((order, index) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            delay={index * 100} 
          />
        ))}
      </ScrollView>
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  searchPlaceholder: {
    marginLeft: SIZES.sm,
    color: COLORS.textLight,
    flex: 1,
  },
  statsScroll: {
    paddingLeft: SIZES.md,
    marginBottom: SIZES.md,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingRight: SIZES.md,
  },
  statCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginRight: SIZES.sm,
    minWidth: 100,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: SIZES.md,
  },
  orderCard: {
    marginBottom: SIZES.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  customerName: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: SIZES.xs,
  },
  orderDetails: {
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
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SIZES.xs,
  },
  primaryAction: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  primaryActionText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});