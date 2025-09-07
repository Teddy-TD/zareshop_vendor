import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Clock, Package, Truck, CircleCheck as CheckCircle, Circle as XCircle, Filter, Search, DollarSign, ShoppingCart } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';
import AnimatedCard from '@/components/AnimatedCard';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { OrderStatus } from '@/services/orderApi';
import { useAuth } from '@/hooks/useAuth';
import { useGetVendorByPhoneQuery } from '@/services/vendorApi';
import { cleanPhoneNumber } from '@/validations/login_validation';
import { useRouter } from 'expo-router';

export default function Orders() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
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
  
  const {
    orders,
    statusCounts,
    isLoadingOrders,
    isUpdatingStatus,
    ordersError,
    handleStatusUpdate,
    handleStatusFilter,
    handleSearch,
    clearFilters,
    refetchOrders,
    currentStatus,
    currentSearch,
  } = useOrderManagement({
    vendorId: vendorId || 0,
    initialPage: 1,
    initialLimit: 10,
  });

  // Calculate additional stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.new:
        return {
          color: COLORS.warning,
          icon: Clock,
          text: 'New',
          bgColor: '#fff3cd',
        };
      case OrderStatus.processing:
        return {
          color: COLORS.primary,
          icon: Package,
          text: 'Processing',
          bgColor: COLORS.secondary,
        };
      case OrderStatus.ready_to_delivery:
        return {
          color: COLORS.success,
          icon: Truck,
          text: 'Ready for Delivery',
          bgColor: '#d1edff',
        };
      case OrderStatus.completed:
        return {
          color: COLORS.success,
          icon: CheckCircle,
          text: 'Completed',
          bgColor: '#d1edff',
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

  const handleOrderStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    const result = await handleStatusUpdate(orderId, newStatus);
    if (result.success) {
      Alert.alert('Success', 'Order status updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleSearchSubmit = () => {
    handleSearch(searchQuery);
  };

  const OrderCard = ({ order, delay = 0 }: { order: any; delay?: number }) => {
    const statusConfig = getStatusConfig(order.status);
    const IconComponent = statusConfig.icon;

    return (
      <AnimatedCard delay={delay} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{order.id}</Text>
            <Text style={styles.customerName}>
              {order.client.user.name || order.client.user.phone_number}
            </Text>
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
            <Text style={styles.detailLabel}>Product:</Text>
            <Text style={styles.detailValue}>{order.product.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{order.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.detailValue}>${order.total_amount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(order.created_at).toLocaleDateString()} at{' '}
              {new Date(order.created_at).toLocaleTimeString()}
            </Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/orders/${order.id}`)}
          >
            <Text style={styles.actionText}>View Details</Text>
          </TouchableOpacity>
          {order.status === OrderStatus.new && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => handleOrderStatusUpdate(order.id, OrderStatus.processing)}
              disabled={isUpdatingStatus}
            >
              <Text style={[styles.actionText, styles.primaryActionText]}>
                {isUpdatingStatus ? 'Updating...' : 'Mark Processing'}
              </Text>
            </TouchableOpacity>
          )}
          {order.status === OrderStatus.processing && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => handleOrderStatusUpdate(order.id, OrderStatus.ready_to_delivery)}
              disabled={isUpdatingStatus}
            >
              <Text style={[styles.actionText, styles.primaryActionText]}>
                {isUpdatingStatus ? 'Updating...' : 'Ready for Delivery'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedCard>
    );
  };

  // Loading and error states
  if (isLoadingVendor) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading vendor information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (vendorError || !vendorId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Vendor not found or error loading vendor data</Text>
          <Text style={styles.errorSubText}>
            Please make sure you're logged in with a vendor account{'\n'}
            Phone: {user?.phone_number || 'Not available'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoadingOrders) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (ordersError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error loading orders</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetchOrders}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* 2x2 Dashboard Grid */}
      <View style={styles.dashboardGrid}>
        {/* Row 1 */}
        <View style={styles.dashboardRow}>
          <TouchableOpacity 
            style={[styles.dashboardCard, styles.revenueCard]}
            onPress={() => handleStatusFilter(undefined)}
          >
            <View style={styles.cardHeader}>
              <DollarSign size={24} color={COLORS.success} />
              <Text style={styles.cardTitle}>Total Revenue</Text>
            </View>
            <Text style={styles.cardValue}>${totalRevenue.toFixed(2)}</Text>
            <Text style={styles.cardSubtext}>All time</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dashboardCard, styles.ordersCard]}
            onPress={() => handleStatusFilter(undefined)}
          >
            <View style={styles.cardHeader}>
              <ShoppingCart size={24} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Total Orders</Text>
            </View>
            <Text style={styles.cardValue}>{statusCounts.all}</Text>
            <Text style={styles.cardSubtext}>All orders</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 */}
        <View style={styles.dashboardRow}>
          <TouchableOpacity 
            style={[styles.dashboardCard, styles.newOrdersCard]}
            onPress={() => handleStatusFilter(OrderStatus.new)}
          >
            <View style={styles.cardHeader}>
              <Clock size={24} color={COLORS.warning} />
              <Text style={styles.cardTitle}>New Orders</Text>
            </View>
            <Text style={styles.cardValue}>{statusCounts.new}</Text>
            <Text style={styles.cardSubtext}>Pending review</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dashboardCard, styles.processingCard]}
            onPress={() => handleStatusFilter(OrderStatus.processing)}
          >
            <View style={styles.cardHeader}>
              <Package size={24} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Processing</Text>
            </View>
            <Text style={styles.cardValue}>{statusCounts.processing}</Text>
            <Text style={styles.cardSubtext}>In progress</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Filter Pills */}
      {/* <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
      >
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterPill, !currentStatus && styles.activeFilterPill]}
            onPress={() => handleStatusFilter(undefined)}
          >
            <Text style={[styles.filterPillText, !currentStatus && styles.activeFilterPillText]}>
              All Orders
            </Text>
          </TouchableOpacity>
          
          {Object.values(OrderStatus).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterPill, currentStatus === status && styles.activeFilterPill]}
              onPress={() => handleStatusFilter(status)}
            >
              <Text style={[styles.filterPillText, currentStatus === status && styles.activeFilterPillText]}>
                {status.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView> */}

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
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    fontWeight: '500',
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: 16,
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.sm,
    fontSize: 16,
    color: COLORS.text,
  },
  // Dashboard Grid Styles
  dashboardGrid: {
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  dashboardRow: {
    flexDirection: 'row',
    marginBottom: SIZES.sm,
    gap: SIZES.sm,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginLeft: SIZES.xs,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  cardSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  newOrdersCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  processingCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  // Filter Pills Styles
  filterScroll: {
    paddingLeft: SIZES.md,
    marginBottom: SIZES.md,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingRight: SIZES.md,
    gap: SIZES.sm,
  },
  filterPill: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  activeFilterPillText: {
    color: COLORS.white,
  },
  errorSubText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.sm,
  },
});