import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '@/constants/theme';
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation, OrderStatus } from '@/services/orderApi';
import AnimatedCard from '@/components/AnimatedCard';

const { width } = Dimensions.get('window');

export default function OrderDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);

  const {
    data: orderData,
    isLoading,
    error,
    refetch
  } = useGetOrderByIdQuery(Number(id));

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const order = orderData?.order;

  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      new: { color: COLORS.primary, label: 'New Order', icon: 'add-circle' },
      processing: { color: COLORS.warning, label: 'Processing', icon: 'time' },
      ready_to_delivery: { color: COLORS.info, label: 'Ready for Delivery', icon: 'checkmark-circle' },
      completed: { color: COLORS.success, label: 'Completed', icon: 'checkmark-done' },
    };
    return configs[status] || configs.new;
  };

  const getPaymentMethodConfig = (method: string) => {
    const configs = {
      wallet: { icon: 'wallet', label: 'Wallet Payment' },
      external: { icon: 'card', label: 'External Payment' },
      cod: { icon: 'cash', label: 'Cash on Delivery' },
    };
    return configs[method as keyof typeof configs] || configs.wallet;
  };

  const getDeliveryStatusConfig = (status: string) => {
    const configs = {
      not_assigned: { color: COLORS.gray, label: 'Not Assigned', icon: 'help-circle' },
      assigned: { color: COLORS.warning, label: 'Assigned', icon: 'person' },
      out_for_delivery: { color: COLORS.info, label: 'Out for Delivery', icon: 'car' },
      delivered: { color: COLORS.success, label: 'Delivered', icon: 'checkmark-circle' },
    };
    return configs[status as keyof typeof configs] || configs.not_assigned;
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus({
        orderId: Number(id),
        status: newStatus
      }).unwrap();
      
      Alert.alert('Success', 'Order status updated successfully');
      refetch();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to update order status');
    }
  };

  const showStatusUpdateModal = (status: OrderStatus) => {
    setSelectedStatus(status);
    Alert.alert(
      'Update Order Status',
      `Are you sure you want to change the order status to "${getStatusConfig(status).label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => handleStatusUpdate(status),
          style: 'default'
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>Order not found</Text>
          <Text style={styles.errorSubText}>
            The order you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const paymentConfig = getPaymentMethodConfig(order.payment_method);
  const deliveryConfig = order.delivery ? getDeliveryStatusConfig(order.delivery.delivery_status) : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <AnimatedCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: statusConfig.color }]}>
              <Ionicons name={statusConfig.icon as any} size={24} color={COLORS.white} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>{statusConfig.label}</Text>
              <Text style={styles.orderId}>Order #{order.id}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
        </AnimatedCard>

        {/* Customer Information */}
        <AnimatedCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Customer Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{order.client.user.name || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{order.client.user.phone_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{order.client.user.email || 'N/A'}</Text>
          </View>
        </AnimatedCard>

        {/* Product Information */}
        <AnimatedCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Product Information</Text>
          </View>
          
          <View style={styles.productCard}>
            {order.product.images && order.product.images.length > 0 && (
              <Image 
                source={{ uri: order.product.images[0].url }} 
                style={styles.productImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{order.product.name}</Text>
              <Text style={styles.productDescription} numberOfLines={2}>
                {order.product.description || 'No description available'}
              </Text>
              <View style={styles.productMeta}>
                <Text style={styles.categoryText}>
                  {order.product.category.name} • {order.product.subcategory.name}
                </Text>
                <Text style={styles.stockText}>
                  Stock: {order.product.stock} units
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quantity:</Text>
              <Text style={styles.infoValue}>{order.quantity}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Unit Price:</Text>
              <Text style={styles.infoValue}>{formatCurrency(order.unit_price)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Amount:</Text>
              <Text style={[styles.infoValue, styles.totalAmount]}>
                {formatCurrency(order.total_amount)}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Payment Information */}
        <AnimatedCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name={paymentConfig.icon as any} size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Payment Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Method:</Text>
            <Text style={styles.infoValue}>{paymentConfig.label}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount:</Text>
            <Text style={[styles.infoValue, styles.totalAmount]}>
              {formatCurrency(order.total_amount)}
            </Text>
          </View>
        </AnimatedCard>

        {/* Delivery Information */}
        {order.delivery && (
          <AnimatedCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="car" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Delivery Information</Text>
            </View>
            
            <View style={styles.deliveryStatus}>
              <View style={[styles.deliveryIndicator, { backgroundColor: deliveryConfig?.color }]}>
                <Ionicons name={deliveryConfig?.icon as any} size={16} color={COLORS.white} />
              </View>
              <Text style={styles.deliveryStatusText}>{deliveryConfig?.label}</Text>
            </View>

            {order.delivery.driver && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Driver:</Text>
                  <Text style={styles.infoValue}>{order.delivery.driver.user.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Driver Phone:</Text>
                  <Text style={styles.infoValue}>{order.delivery.driver.user.phone_number}</Text>
                </View>
              </>
            )}

            {order.delivery.tip_amount > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tip Amount:</Text>
                <Text style={styles.infoValue}>{formatCurrency(order.delivery.tip_amount)}</Text>
              </View>
            )}

            {order.delivery.delivered_at && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Delivered At:</Text>
                <Text style={styles.infoValue}>{formatDate(order.delivery.delivered_at)}</Text>
              </View>
            )}
          </AnimatedCard>
        )}

        {/* Status Update Actions */}
        {order.status !== 'completed' && (
          <AnimatedCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Update Status</Text>
            </View>
            
            <View style={styles.statusButtons}>
              {order.status === 'new' && (
                <TouchableOpacity 
                  style={[styles.statusButton, styles.processingButton]}
                  onPress={() => showStatusUpdateModal('processing')}
                  disabled={isUpdating}
                >
                  <Ionicons name="time" size={20} color={COLORS.white} />
                  <Text style={styles.statusButtonText}>Start Processing</Text>
                </TouchableOpacity>
              )}
              
              {order.status === 'processing' && (
                <TouchableOpacity 
                  style={[styles.statusButton, styles.readyButton]}
                  onPress={() => showStatusUpdateModal('ready_to_delivery')}
                  disabled={isUpdating}
                >
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                  <Text style={styles.statusButtonText}>Ready for Delivery</Text>
                </TouchableOpacity>
              )}
              
              {order.status === 'ready_to_delivery' && (
                <TouchableOpacity 
                  style={[styles.statusButton, styles.completeButton]}
                  onPress={() => showStatusUpdateModal('completed')}
                  disabled={isUpdating}
                >
                  <Ionicons name="checkmark-done" size={20} color={COLORS.white} />
                  <Text style={styles.statusButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </AnimatedCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: SIZES.padding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.base,
    fontSize: SIZES.body3,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  errorText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    marginTop: SIZES.base,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: '600',
  },
  statusCard: {
    marginBottom: SIZES.base,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  orderId: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    marginTop: 2,
  },
  orderDate: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
  },
  sectionCard: {
    marginBottom: SIZES.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.black,
    marginLeft: SIZES.base,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base / 2,
  },
  infoLabel: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    flex: 1,
  },
  infoValue: {
    fontSize: SIZES.body2,
    color: COLORS.black,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: SIZES.base,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    marginBottom: SIZES.base / 2,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: SIZES.body4,
    color: COLORS.primary,
    fontWeight: '500',
  },
  stockText: {
    fontSize: SIZES.body4,
    color: COLORS.gray,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SIZES.base,
  },
  deliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  deliveryIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  deliveryStatusText: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.black,
  },
  statusButtons: {
    gap: SIZES.base,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    gap: SIZES.base / 2,
  },
  processingButton: {
    backgroundColor: COLORS.warning,
  },
  readyButton: {
    backgroundColor: COLORS.info,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  statusButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: '600',
  },
});

