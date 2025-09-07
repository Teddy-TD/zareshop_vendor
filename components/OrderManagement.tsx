import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import {
  useGetOrdersByVendorQuery,
  useUpdateOrderStatusMutation,
  useGetOrdersByStatusQuery,
  useSearchOrdersQuery,
  OrderStatus,
} from '@/services/orderApi';

interface OrderManagementProps {
  vendorId: number;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ vendorId }) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Queries
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetOrdersByVendorQuery({
    vendorId,
    page,
    limit: 10,
    status: selectedStatus,
    search: searchQuery || undefined,
  });

  // Mutations
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();

  // Handle status update
  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus({
        orderId,
        status: newStatus,
      }).unwrap();
      
      Alert.alert('Success', 'Order status updated successfully');
      refetchOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  // Handle status filter change
  const handleStatusFilter = (status: OrderStatus | undefined) => {
    setSelectedStatus(status);
    setPage(1); // Reset to first page when filtering
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  // Render order item
  const renderOrderItem = ({ item: order }: { item: any }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{order.id}</Text>
        <Text style={styles.orderDate}>
          {new Date(order.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.productName}>{order.product.name}</Text>
        <Text style={styles.quantity}>Quantity: {order.quantity}</Text>
        <Text style={styles.totalAmount}>Total: ${order.total_amount}</Text>
        <Text style={styles.customerName}>
          Customer: {order.client.user.name || order.client.user.phone_number}
        </Text>
      </View>

      <View style={styles.statusSection}>
        <Text style={[styles.status, getStatusStyle(order.status)]}>
          Status: {order.status.replace('_', ' ').toUpperCase()}
        </Text>
        
        <View style={styles.statusButtons}>
          {order.status === OrderStatus.new && (
            <TouchableOpacity
              style={[styles.statusButton, styles.processingButton]}
              onPress={() => handleStatusUpdate(order.id, OrderStatus.processing)}
              disabled={isUpdatingStatus}
            >
              <Text style={styles.buttonText}>Mark as Processing</Text>
            </TouchableOpacity>
          )}
          
          {order.status === OrderStatus.processing && (
            <TouchableOpacity
              style={[styles.statusButton, styles.readyButton]}
              onPress={() => handleStatusUpdate(order.id, OrderStatus.ready_to_delivery)}
              disabled={isUpdatingStatus}
            >
              <Text style={styles.buttonText}>Ready for Delivery</Text>
            </TouchableOpacity>
          )}
          
          {order.status === OrderStatus.ready_to_delivery && (
            <TouchableOpacity
              style={[styles.statusButton, styles.completedButton]}
              onPress={() => handleStatusUpdate(order.id, OrderStatus.completed)}
              disabled={isUpdatingStatus}
            >
              <Text style={styles.buttonText}>Mark as Completed</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  // Get status style
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.new:
        return styles.newStatus;
      case OrderStatus.processing:
        return styles.processingStatus;
      case OrderStatus.ready_to_delivery:
        return styles.readyStatus;
      case OrderStatus.completed:
        return styles.completedStatus;
      default:
        return styles.defaultStatus;
    }
  };

  if (isLoadingOrders) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (ordersError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading orders</Text>
        <TouchableOpacity onPress={() => refetchOrders()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Management</Text>
      
      {/* Status Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, !selectedStatus && styles.activeFilter]}
          onPress={() => handleStatusFilter(undefined)}
        >
          <Text style={[styles.filterText, !selectedStatus && styles.activeFilterText]}>
            All Orders
          </Text>
        </TouchableOpacity>
        
        {Object.values(OrderStatus).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, selectedStatus === status && styles.activeFilter]}
            onPress={() => handleStatusFilter(status)}
          >
            <Text style={[styles.filterText, selectedStatus === status && styles.activeFilterText]}>
              {status.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={ordersData?.orders || []}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />

      {/* Pagination Info */}
      {ordersData?.pagination && (
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationText}>
            Page {ordersData.pagination.page} of {ordersData.pagination.pages} 
            ({ordersData.pagination.total} total orders)
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#007bff',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ordersList: {
    flex: 1,
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  orderDetails: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 12,
    color: '#666',
  },
  statusSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newStatus: {
    color: '#ffc107',
  },
  processingStatus: {
    color: '#17a2b8',
  },
  readyStatus: {
    color: '#28a745',
  },
  completedStatus: {
    color: '#6c757d',
  },
  defaultStatus: {
    color: '#333',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
  },
  processingButton: {
    backgroundColor: '#17a2b8',
  },
  readyButton: {
    backgroundColor: '#28a745',
  },
  completedButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paginationContainer: {
    padding: 16,
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 8,
  },
  retryText: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default OrderManagement;
