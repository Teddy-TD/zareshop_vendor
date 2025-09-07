import { useState, useCallback } from 'react';
import {
  useGetOrdersByVendorQuery,
  useUpdateOrderStatusMutation,
  useGetOrdersByStatusQuery,
  useSearchOrdersQuery,
  OrderStatus,
  GetOrdersByVendorParams,
} from '@/services/orderApi';

export interface UseOrderManagementOptions {
  vendorId: number;
  initialPage?: number;
  initialLimit?: number;
  initialStatus?: OrderStatus;
  initialSearch?: string;
}

export const useOrderManagement = (options: UseOrderManagementOptions) => {
  const {
    vendorId,
    initialPage = 1,
    initialLimit = 10,
    initialStatus,
    initialSearch = '',
  } = options;

  // Local state
  const [page, setPage] = useState(initialPage);
  const [status, setStatus] = useState<OrderStatus | undefined>(initialStatus);
  const [search, setSearch] = useState(initialSearch);

  // Query parameters
  const queryParams: GetOrdersByVendorParams = {
    vendorId,
    page,
    limit: initialLimit,
    status,
    search: search || undefined,
  };

  // Queries
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetOrdersByVendorQuery(queryParams);

  // Mutations
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();

  // Actions
  const handleStatusUpdate = useCallback(
    async (orderId: number, newStatus: OrderStatus) => {
      try {
        await updateOrderStatus({
          orderId,
          status: newStatus,
        }).unwrap();
        
        // Refetch orders to get updated data
        refetchOrders();
        return { success: true };
      } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error };
      }
    },
    [updateOrderStatus, refetchOrders]
  );

  const handleStatusFilter = useCallback((newStatus: OrderStatus | undefined) => {
    setStatus(newStatus);
    setPage(1); // Reset to first page when filtering
  }, []);

  const handleSearch = useCallback((searchQuery: string) => {
    setSearch(searchQuery);
    setPage(1); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const clearFilters = useCallback(() => {
    setStatus(undefined);
    setSearch('');
    setPage(1);
  }, []);

  // Computed values
  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;
  const totalOrders = pagination?.total || 0;
  const totalPages = pagination?.pages || 0;
  const currentPage = pagination?.page || 1;

  // Status counts (you might want to fetch these separately for better performance)
  const statusCounts = {
    all: totalOrders,
    new: orders.filter(order => order.status === OrderStatus.new).length,
    processing: orders.filter(order => order.status === OrderStatus.processing).length,
    ready_to_delivery: orders.filter(order => order.status === OrderStatus.ready_to_delivery).length,
    completed: orders.filter(order => order.status === OrderStatus.completed).length,
  };

  return {
    // Data
    orders,
    pagination,
    statusCounts,
    
    // Loading states
    isLoadingOrders,
    isUpdatingStatus,
    
    // Error states
    ordersError,
    
    // Actions
    handleStatusUpdate,
    handleStatusFilter,
    handleSearch,
    handlePageChange,
    clearFilters,
    refetchOrders,
    
    // Current state
    currentStatus: status,
    currentSearch: search,
    currentPage,
    totalPages,
    totalOrders,
    
    // Status enum for convenience
    OrderStatus,
  };
};

// Convenience hook for specific status queries
export const useOrdersByStatus = (vendorId: number, status: OrderStatus) => {
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useGetOrdersByStatusQuery({
    vendorId,
    status,
    page: 1,
    limit: 100, // Get more orders for status-specific views
  });

  return {
    orders: ordersData?.orders || [],
    isLoading,
    error,
    refetch,
  };
};

// Convenience hook for search
export const useOrderSearch = (vendorId: number) => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useSearchOrdersQuery(
    {
      vendorId,
      search: searchQuery,
      page: 1,
      limit: 20,
    },
    {
      skip: !searchQuery, // Only run query when there's a search term
    }
  );

  return {
    searchQuery,
    setSearchQuery,
    orders: ordersData?.orders || [],
    isLoading,
    error,
    refetch,
  };
};

export default useOrderManagement;
